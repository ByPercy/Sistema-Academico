const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "sistema_academico",
  password: "60852525",
  port: 5432,
});

module.exports = pool;

///////////////////////
//PRUEBA DE CONEXION//
/////////////////////

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error conectando a la base de datos", err);
  } else {
    console.log("conexion exitosa a PostgreSQL");
  }
});
