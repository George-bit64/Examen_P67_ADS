const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  port: 3306,
});

db.query("SHOW DATABASES", (err, results) => {
  if (err) {
    console.error("ERROR conectando:", err);
    process.exit(1);
  }
  console.log("Bases encontradas:");
  console.table(results);
  process.exit(0);
});