Sistema Web de Gestión de Farmacia Comunitaria
Proyecto Académico – Análisis y Diseño de Sistemas
- Descripción del Proyecto

El presente repositorio contiene el desarrollo de un Sistema Web de Gestión de Farmacia, elaborado como proyecto evaluativo de la asignatura Análisis y Diseño de Sistemas. El propósito principal fue aplicar los conceptos teóricos de modelado, estructuración y diseño de sistemas informáticos a un caso práctico inspirado en un entorno real: la gestión digital de una farmacia comunitaria.

El sistema simula procesos habituales como autenticación de usuarios, administración de inventario, gestión de pedidos digitales, punto de venta (POS) y generación de reportes básicos. Todo el desarrollo fue precedido por un análisis formal del sistema mediante diagramas UML y posteriormente implementado como un prototipo funcional accesible desde la web.

Es importante destacar que este sistema constituye una simulación académica y no está destinado a uso comercial ni a entornos productivos reales.

- Contexto Académico y Objetivo

El proyecto fue concebido como ejercicio integrador de la materia, permitiendo recorrer el ciclo completo del desarrollo de sistemas: análisis, diseño, modelado y construcción de una solución funcional.

A través de este trabajo se buscó:

Identificar actores y requerimientos funcionales.

Diseñar la estructura del sistema mediante diagramas UML.

Implementar una solución web coherente con el modelo planteado.

Simular una arquitectura distribuida utilizando servicios en la nube.

Publicar el sistema como prototipo accesible en línea.

Este proceso permitió comprender cómo las decisiones tomadas en la fase de análisis impactan directamente en la implementación técnica.

- Modelo de Usuarios y Funcionamiento General

El sistema contempla tres tipos de usuarios, definidos durante la etapa de análisis:

> El Administrador tiene acceso a la gestión general del sistema, incluyendo inventario, reportes y control operativo.
> El Cajero interactúa principalmente con el módulo de punto de venta y el despacho de pedidos.
> El Cliente puede visualizar el catálogo digital y generar pedidos en línea.

La separación por roles demuestra la aplicación práctica del concepto de control de acceso basado en perfiles, alineado con los requerimientos definidos en los diagramas de casos de uso.

- Arquitectura y Tecnologías Utilizadas

El sistema fue desarrollado como una aplicación web estática con integración a servicios en la nube. La arquitectura adoptada responde a un modelo cliente–servidor simplificado, donde el frontend se encuentra desplegado en GitHub Pages y el backend se apoya en servicios gestionados de Firebase.

Tecnologías utilizadas:

> HTML5 para la estructura del sistema.

> CSS3 para el diseño visual e interfaz.

> JavaScript (Vanilla) para la lógica del cliente.

> Firebase Authentication para la gestión de usuarios.

> Firestore Database para almacenamiento de datos.

> GitHub Pages para el despliegue del sistema.

La elección de Firebase permitió simular un entorno con base de datos real sin necesidad de configurar un servidor dedicado, adaptándose a las limitaciones académicas del proyecto.

- Base de Datos y Gestión de Información

El sistema utiliza Firestore como base de datos en la nube, donde se almacenan colecciones relacionadas con usuarios, productos, pedidos e inventario. La autenticación se realiza mediante Firebase Authentication con inicio de sesión por correo y contraseña.

Si bien la implementación es funcional, su configuración se mantiene en modo académico y no incorpora mecanismos avanzados de seguridad propios de entornos empresariales.

- Despliegue y Acceso

El proyecto se encuentra desplegado mediante GitHub Pages, lo que permite su acceso desde cualquier navegador web sin instalación local. Esta modalidad facilita la demostración del sistema como prototipo funcional dentro del contexto evaluativo.

El despliegue está limitado al frontend, mientras que la persistencia de datos se gestiona completamente en Firebase.

- Relación con Análisis y Diseño de Sistemas

El desarrollo del sistema fue precedido por la elaboración de:

> Diagramas de Casos de Uso

> Diagramas de Actividades

> Diagramas de Secuencia

> Diagrama de Clases

> Diagrama de Despliegue

> Mapa de Navegación

Estos modelos sirvieron como base estructural para la implementación. El proyecto demuestra cómo el análisis previo facilita la organización del código, la definición clara de responsabilidades y la coherencia entre las distintas partes del sistema.

⚠️ Consideraciones y Limitaciones

Este proyecto representa una simulación académica y posee limitaciones propias de un entorno educativo. No incluye integración con sistemas reales de facturación, pasarelas de pago ni mecanismos de seguridad avanzados. Asimismo, algunas funcionalidades se implementaron con fines demostrativos y no con estándares empresariales completos.

El objetivo principal fue evidenciar la aplicación práctica de la materia y no la construcción de un sistema farmacéutico comercial definitivo.

- Autor y Finalidad

Proyecto desarrollado con fines académicos como evaluación práctica en la asignatura Análisis y Diseño de Sistemas, dentro del programa de Ingeniería en Computación.
