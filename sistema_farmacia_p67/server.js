const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(
  session({
    secret: "farmacia_secreto",
    resave: false,
    saveUninitialized: false,
  })
);


app.use(express.static(__dirname));

const RUTA_DATOS = path.join(__dirname, "data");

function leerJSON(nombreArchivo) {
  const ruta = path.join(RUTA_DATOS, nombreArchivo);
  if (!fs.existsSync(ruta)) return [];
  const contenido = fs.readFileSync(ruta, "utf-8");
  return contenido ? JSON.parse(contenido) : [];
}

function guardarJSON(nombreArchivo, datos) {
  const ruta = path.join(RUTA_DATOS, nombreArchivo);
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2), "utf-8");
}

function hoyYYYYMMDD() {
  const ahora = new Date();
  const y = ahora.getFullYear();
  const m = String(ahora.getMonth() + 1).padStart(2, "0");
  const d = String(ahora.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ---------- LOGIN ----------
app.post("/login", (req, res) => {
  const { correo, clave } = req.body;

  if (!correo || !clave) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  const usuarios = leerJSON("usuarios.json");

  const usuario = usuarios.find(
    (u) => u.correo === correo && u.clave === clave
  );

  if (!usuario) {
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });
  }

  // Guardar sesión
  req.session.usuario = {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
  };

  res.json(req.session.usuario);
});

app.get("/yo", (req, res) => {
  res.json(req.session.usuario || null);
});

// ---------- PRODUCTOS ----------
app.get("/productos", (req, res) => {
  const productos = leerJSON("productos.json");
  res.json(productos);
});

// --------- Protección por rol (para páginas) ----------
function requiereSesion(req, res, next) {
  if (!req.session?.usuario) return res.status(401).json({ ok: false, mensaje: "No has iniciado sesión" });
  next();
}

function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    const usuario = req.session?.usuario;
    if (!usuario) return res.status(401).json({ ok: false, mensaje: "No has iniciado sesión" });
    if (!rolesPermitidos.includes(usuario.rol)) return res.status(403).json({ ok: false, mensaje: "No autorizado" });
    next();
  };
}

// Endpoints para verificar acceso (útiles desde el frontend)
app.get("/api/protegido/admin", requiereRol("administrador"), (req, res) => res.json({ ok: true }));
app.get("/api/protegido/cajero", requiereRol("cajero", "administrador"), (req, res) => res.json({ ok: true }));
app.get("/api/protegido/cliente", requiereRol("cliente"), (req, res) => res.json({ ok: true }));

app.post("/cerrar-sesion", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ ok: false, mensaje: "No se pudo cerrar sesión" });

    // Opcional: limpiar cookie de sesión (por si acaso)
    res.clearCookie("connect.sid");
    res.json({ ok: true, mensaje: "Sesión cerrada" });
  });
});
// ---------- INVENTARIO (ADMIN) ----------
// Devuelve lista en el formato que tu tabla espera: [{producto, stock}]
app.get("/inventario", requiereRol("administrador"), (req, res) => {
  const productos = leerJSON("productos.json");
  const lista = productos.map(p => ({ producto: p.nombre, stock: p.stock }));
  res.json(lista);
});

// Guarda/actualiza stock por nombre (si no existe, lo crea con precio 0)
app.post("/inventario", requiereRol("administrador"), (req, res) => {
  const { producto, stock } = req.body || {};
  if (!producto) return res.status(400).json({ mensaje: "Falta producto" });

  const productos = leerJSON("productos.json");
  const nombre = String(producto).trim();
  const nuevoStock = Number(stock);

  if (Number.isNaN(nuevoStock)) return res.status(400).json({ mensaje: "Stock inválido" });

  let p = productos.find(x => x.nombre.toLowerCase() === nombre.toLowerCase());

  if (p) {
    p.stock = nuevoStock;
  } else {
    const nuevoId = productos.length ? Math.max(...productos.map(x => x.id)) + 1 : 1;
    productos.push({
      id: nuevoId,
      nombre,
      precio: 0,
      stock: nuevoStock,
      categoria: "General"
    });
  }

  guardarJSON("productos.json", productos);
  res.json({ mensaje: "Inventario actualizado" });
});

// ---------- VENTA (CAJERO/ADMIN) ----------
// Tu POS manda {producto, precio}. Guardamos venta y si existe en catálogo, descontamos stock 1.
app.post("/venta", requiereRol("cajero", "administrador"), (req, res) => {
  const { producto, precio } = req.body || {};
  if (!producto || precio === undefined) return res.status(400).json({ mensaje: "Faltan datos" });

  const productos = leerJSON("productos.json");
  const ventas = leerJSON("ventas.json");

  const nombre = String(producto).trim();
  const precioNum = Number(precio);

  if (Number.isNaN(precioNum) || precioNum < 0) {
    return res.status(400).json({ mensaje: "Precio inválido" });
  }

  // Si está en catálogo, descuenta stock (1 unidad)
  const p = productos.find(x => x.nombre.toLowerCase() === nombre.toLowerCase());
  if (p) {
    if (p.stock <= 0) return res.status(400).json({ mensaje: "Sin stock" });
    p.stock -= 1;
    guardarJSON("productos.json", productos);
  }

  const venta = {
    id: ventas.length ? ventas[ventas.length - 1].id + 1 : 1,
    fecha: new Date().toISOString(),
    producto: nombre,
    total: precioNum,
    rol: req.session.usuario?.rol || "sin_sesion"
  };

  ventas.push(venta);
  guardarJSON("ventas.json", ventas);

  res.json({ mensaje: "Venta guardada" });
});

// ---------- VENTAS ----------
app.post("/ventas", (req, res) => {
  const { idProducto, cantidad } = req.body;

  const productos = leerJSON("productos.json");
  const ventas = leerJSON("ventas.json");

  const producto = productos.find((p) => p.id === Number(idProducto));
  const cant = Number(cantidad || 1);

  if (!producto) return res.status(404).json({ mensaje: "Producto no existe" });
  if (cant <= 0) return res.status(400).json({ mensaje: "Cantidad inválida" });
  if (producto.stock < cant)
    return res.status(400).json({ mensaje: "Stock insuficiente" });

  // descontar stock
  producto.stock -= cant;

  const venta = {
    id: ventas.length ? ventas[ventas.length - 1].id + 1 : 1,
    fecha: new Date().toISOString(),
    idProducto: producto.id,
    producto: producto.nombre,
    precioUnitario: producto.precio,
    cantidad: cant,
    total: producto.precio * cant,
    rol: req.session.usuario ? req.session.usuario.rol : "sin_sesion",
  };

  ventas.push(venta);

  guardarJSON("productos.json", productos);
  guardarJSON("ventas.json", ventas);

  res.json({ mensaje: "Venta guardada", venta });
});

// ---------- REPORTE DIARIO ----------
app.get("/reporte-diario", (req, res) => {
  const ventas = leerJSON("ventas.json");
  const hoy = hoyYYYYMMDD();

  const total = ventas
    .filter((v) => (v.fecha || "").slice(0, 10) === hoy)
    .reduce((acc, v) => acc + Number(v.total || 0), 0);

  res.json({ total });
});

// ---------- PEDIDOS ----------
app.post("/pedidos", (req, res) => {
  const { nombre, idProducto, cantidad } = req.body;

  if (!nombre || !idProducto || !cantidad) {
    return res.status(400).json({ mensaje: "Faltan datos del pedido" });
  }

  const productos = leerJSON("productos.json");
  const pedidos = leerJSON("pedidos.json");

  const producto = productos.find((p) => p.id === Number(idProducto));
  if (!producto) return res.status(404).json({ mensaje: "Producto no existe" });

  const pedido = {
    id: pedidos.length ? pedidos[pedidos.length - 1].id + 1 : 1,
    fecha: new Date().toISOString(),
    nombre,
    idProducto: producto.id,
    producto: producto.nombre,
    cantidad: Number(cantidad),
    estado: "pendiente",
  };

  pedidos.push(pedido);
  guardarJSON("pedidos.json", pedidos);

  res.json({ mensaje: "Pedido guardado correctamente", pedido });
});

// ---------- PEDIDOS (CAJERO/ADMIN) ----------
app.get("/pedidos", requiereRol("cajero", "administrador"), (req, res) => {
  const pedidos = leerJSON("pedidos.json");
  const estado = (req.query.estado || "").trim().toLowerCase();

  const filtrados = estado ? pedidos.filter(p => (p.estado || "").toLowerCase() === estado) : pedidos;
  res.json(filtrados);
});

// Despachar un pedido: descuenta stock + crea venta + marca pedido despachado
app.post("/pedidos/:id/despachar", requiereRol("cajero", "administrador"), (req, res) => {
  const idPedido = Number(req.params.id);

  const pedidos = leerJSON("pedidos.json");
  const productos = leerJSON("productos.json");
  const ventas = leerJSON("ventas.json");

  const pedido = pedidos.find(p => Number(p.id) === idPedido);
  if (!pedido) return res.status(404).json({ mensaje: "Pedido no existe" });

  if ((pedido.estado || "").toLowerCase() !== "pendiente") {
    return res.status(400).json({ mensaje: "Este pedido ya fue procesado" });
  }

  const producto = productos.find(pr => Number(pr.id) === Number(pedido.idProducto));
  if (!producto) return res.status(404).json({ mensaje: "Producto del pedido no existe" });

  const cantidad = Number(pedido.cantidad);
  if (!cantidad || cantidad <= 0) return res.status(400).json({ mensaje: "Cantidad inválida" });

  if (Number(producto.stock) < cantidad) {
    return res.status(400).json({ mensaje: "Stock insuficiente para despachar" });
  }

  // 1) Descontar stock
  producto.stock = Number(producto.stock) - cantidad;

  // 2) Crear venta
  const idVenta = ventas.length ? ventas[ventas.length - 1].id + 1 : 1;
  const venta = {
    id: idVenta,
    fecha: new Date().toISOString(),
    idPedido: pedido.id,
    idProducto: producto.id,
    producto: producto.nombre,
    cantidad,
    precioUnitario: Number(producto.precio) || 0,
    total: (Number(producto.precio) || 0) * cantidad,
    atendidoPor: req.session.usuario?.nombre || "cajero",
    rol: req.session.usuario?.rol || "sin_sesion"
  };
  ventas.push(venta);

  // 3) Marcar pedido como despachado
  pedido.estado = "despachado";
  pedido.fechaDespacho = new Date().toISOString();
  pedido.idVenta = idVenta;
  pedido.atendidoPor = req.session.usuario?.nombre || "cajero";

  // Guardar todo
  guardarJSON("productos.json", productos);
  guardarJSON("ventas.json", ventas);
  guardarJSON("pedidos.json", pedidos);

  res.json({ mensaje: "Pedido despachado", venta, pedido });
});

app.listen(3000, () => {
  console.log("Servidor activo en puerto 3000 (JSON)");
});