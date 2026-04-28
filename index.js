//ENCARGADO DE Lo
const express = require("express");
const path = require("path");
const pool = require("./db"); //->Importar la conexión de db.js
const app = express();
const port = 3000;

// Configuración para leer JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (aquí pondrás tu HTML, CSS y JS frontal)
app.use(express.static("public"));

// 1. Ruta para obtener el TOTAL DE ESTUDIANTES
app.get("/api/total-estudiantes", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT COUNT(*) AS total FROM Estudiante",
    );
    // Convertimos el resultado a un número entero por si acaso
    const conteo = parseInt(resultado.rows[0].total);

    console.log("✅ Conteo exitoso:", conteo);
    res.json({ total: conteo });
  } catch (err) {
    console.error("❌ Error real de Postgres:", err.message); // ESTA LÍNEA ES CLAVE: Mira tu terminal de VS Code para ver el error real

    res.status(500).json({ error: "Error al contar estudiantes" });
  }
});

// 2. Ruta para obtener todos los cursos (para tus contadores o tablas)
app.get("/api/total-cursos", async (req, res) => {
  try {
    const consulta = await pool.query("SELECT COUNT(*) AS total FROM Curso");

    const conteo = parseInt(consulta.rows[0].total);
    console.log("✅ Conteo de cursos exitoso:", conteo);
    res.json({ total: conteo });
  } catch (err) {
    console.error("❌ Error al contar cursos:", err.message);

    res.status(500).json({ error: "Error al contar cursos" });
  }
});

// 3. Ruta para obtener el total de docentes
app.get("/api/total-docentes", async (req, res) => {
  try {
    const consulta = await pool.query("SELECT COUNT(*) AS total FROM Docente");
    const conteo = parseInt(consulta.rows[0].total);
    console.log("✅ Conteo de docentes exitoso:", conteo);
    res.json({ total: conteo });
  } catch (err) {
    res.status(500).json({ error: "Error al contar docentes" });
  }
});

////////////////////////////////////////////////////
///////////////////////////////////////////////////
// Arrancar el servidor////////////////////////////
///////////////////////////////////////////////////
app.listen(port, () => {
  console.log(`🚀 Servidor listo en http://localhost:${port}`);
});

/////////////////////////////////////////
///////////LISTADO ESTUDIANTE///////////
///////////////////////////////////////
app.get("/api/estudiantes", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM Estudiante ORDER BY Codigo_Estudiante ASC",
    );
    res.json(resultado.rows); // Enviamos todas las filas como un arreglo
  } catch (err) {
    console.error("❌ Error al traer la lista:", err.message);
    res.status(500).json({ error: "Error al obtener estudiantes" });
  }
});

// RUTA PARA OBTENER UN SOLO ESTUDIANTE POR ID (Para el modal de edición)
app.get("/api/estudiantes/:id", async (req, res) => {
  const { id } = req.params; // Capturamos el ID de la URL
  try {
    const resultado = await pool.query(
      "SELECT * FROM Estudiante WHERE Codigo_Estudiante = $1",
      [id],
    );

    if (resultado.rows.length > 0) {
      res.json(resultado.rows[0]); // Enviamos solo EL estudiante encontrado
    } else {
      res.status(404).json({ error: "Estudiante no encontrado" });
    }
  } catch (err) {
    console.error("❌ Error al traer el estudiante:", err.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// RUTA PARA EDITAR UN ESTUDIANTE (Recibe el ID por la URL y los nuevos datos por el body)
app.put("/api/editar-estudiantes/:id", async (req, res) => {
  const { id } = req.params; // El ID que viene en la URL
  const { nombre, correo, telefono, estado } = req.body; // Los nuevos datos

  try {
    const consulta = `
      UPDATE Estudiante 
      SET Nombre = $1, Correo = $2, Telefono = $3, Estado = $4 
      WHERE Codigo_Estudiante = $5
    `;

    const valores = [nombre, correo, telefono, estado, id];
    await pool.query(consulta, valores);

    res.json({ mensaje: "Estudiante actualizado correctamente" });
  } catch (err) {
    console.error("❌ Error al actualizar:", err.message);
    res.status(500).json({ error: "Error al actualizar el estudiante" });
  }
});
////////////////////////////////////
///////////////////////////////////
//////////////////////////////////
//GUARDAR REGISTRO EN MATRICULA//
////////////////////////////////
app.post("/api/matricular", async (req, res) => {
  const { codigo_estudiante, codigo_curso } = req.body;

  try {
    const consultarExistencia = await pool.query(
      "SELECT * FROM Matricula WHERE Codigo_Estudiante = $1 AND Codigo_Curso = $2",
      [codigo_estudiante, codigo_curso],
    );

    if (consultarExistencia.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Ey! El estudiante ya está matriculado en este curso" });
    }

    await pool.query(
      "INSERT INTO Matricula (Codigo_Estudiante, Codigo_Curso, Fecha_Registro) VALUES ($1, $2, NOW())",
      [codigo_estudiante, codigo_curso],
    );
    res.json({ mensaje: "Matrícula exitosa" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "No se pudo realizar la matrícula" });
  }
});

/////////////////////////////////////////
///////////LISTADO CURSOS///////////////
///////////////////////////////////////
app.get("/api/cursos", async (req, res) => {
  try {
    // 🚨 EL CAMBIO ESTÁ AQUÍ EN EL SQL 🚨
    const sql = `
      SELECT 
        c.Codigo_Curso, 
        c.Nombre_Curso, 
        c.Credito, 
        c.Horario, 
        c.Estado,
        d.Nombre AS nombre
      FROM Curso c
      JOIN Docente d ON c.Codigo_Docente = d.Codigo_Docente
    `;

    const resultado = await pool.query(sql);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error al obtener cursos" });
  }
});
/////////////////////////////////////////
///////////AGREGAR ESTUDIANTE///////////
///////////////////////////////////////
app.post("/api/agregar-estudiante", async (req, res) => {
  const { nombre, correo, telefono, estado } = req.body; // Recibimos el nombre desde el frontend

  if (!nombre) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  try {
    const nuevoEst = await pool.query(
      "INSERT INTO Estudiante (Nombre, Correo, Telefono, Estado) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, correo, telefono, estado],
    );
    res.json({ mensaje: "Estudiante creado", data: nuevoEst.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error al insertar en la base de datos" });
  }
});

////////////////////////////////////
///////////////////////////////////
//////////////////////////////////
//APARTADO DE MATRICULA//////////
////////////////////////////////
app.get("/api/estudiantesMATRI", async (req, res) => {
  try {
    const sql = `
      SELECT 
        m.Codigo_Matricula, 
        m.Codigo_Estudiante, 
        m.Codigo_Curso, 
        e.Nombre AS nombre_estudiante, 
        c.Nombre_Curso AS nombre_curso, 
        m.Fecha_Registro
    FROM Matricula m
    JOIN Estudiante e ON m.Codigo_Estudiante = e.Codigo_Estudiante
    JOIN Curso c ON m.Codigo_Curso = c.Codigo_Curso
    ORDER BY m.Codigo_Matricula DESC;
    `;

    const resultado = await pool.query(sql);
    res.json(resultado.rows);
  } catch (err) {
    console.error("❌ Error en el reporte:", err.message);
    res
      .status(500)
      .json({ error: "Error al obtener el reporte de matrículas" });
  }
});

/////////////////////////////////////////
////////////////BORRAR TABLA/////////////
////////////////////////////////////////

app.delete("/api/eliminar-matricula/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM Matricula WHERE Codigo_Matricula = $1", [id]);
    res.json({ mensaje: "✅ Matrícula eliminada correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar:", err.message);
    res.status(500).json({ error: "No se pudo eliminar la matrícula" });
  }
});

app.delete("/api/eliminar-estudiante/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM Estudiante WHERE Codigo_Estudiante = $1", [
      id,
    ]);
    res.json({ mensaje: "✅ Estudiante eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar:", err.message);
    res.status(500).json({ error: "No se pudo eliminar el estudiante" });
  }
});

app.delete("/api/eliminar-docente/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM Docente WHERE codigo_docente = $1", [id]);
    res.json({ mensaje: "✅ Docente eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar:", err.message);
    res.status(500).json({ error: "No se pudo eliminar el docente" });
  }
});

app.delete("/api/eliminar-curso/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM Curso WHERE Codigo_Curso = $1", [id]);
    res.json({ mensaje: "✅ Curso eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar:", err.message);
    res.status(500).json({ error: "No se pudo eliminar el curso" });
  }
});

///////////////////////////////////////
/////////////TABLA DOCENTE////////////
/////////////////////////////////////

app.get("/api/docentes", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM Docente");
    res.json(resultado.rows);
  } catch (err) {
    console.error("❌ Error al obtener docentes:", err.message);
    res.status(500).json({ error: "Error al obtener docentes" });
  }
});

app.get("/api/docentes/:id", async (req, res) => {
  const { id } = req.params; // Capturamos el ID de la URL
  try {
    const resultado = await pool.query(
      "SELECT * FROM Docente WHERE codigo_docente = $1",
      [id],
    );

    if (resultado.rows.length > 0) {
      res.json(resultado.rows[0]); // Enviamos solo EL docente encontrado
    } else {
      res.status(404).json({ error: "Docente no encontrado" });
    }
  } catch (err) {
    console.error("❌ Error al traer el docente:", err.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// RUTA PARA EDITAR UN DOCENTE (Recibe el ID por la URL y los nuevos datos por el body)
app.put("/api/editar-docentes/:id", async (req, res) => {
  const { id } = req.params; // El ID que viene en la URL
  const { nombre, especialidad, correo, telefono, estado } = req.body; // Los nuevos datos

  try {
    const consulta = `
      UPDATE Docente 
      SET Nombre = $1, Especialidad = $2, Correo = $3, Telefono = $4, Estado = $5 
      WHERE Codigo_Docente = $6
    `;

    const valores = [nombre, especialidad, correo, telefono, estado, id];
    await pool.query(consulta, valores);

    res.json({ mensaje: "Docente actualizado correctamente" });
  } catch (err) {
    console.error("❌ Error al actualizar:", err.message);
    res.status(500).json({ error: "Error al actualizar el docente" });
  }
});

///////////////////////////////////////
///////////AGREGAR DOCENTE////////////
/////////////////////////////////////

app.post("/api/agregar-docente", async (req, res) => {
  const { nombre, especialidad, correo, telefono, estado } = req.body; // Recibimos el nombre desde el frontend

  if (!nombre || !especialidad || !correo || !telefono || !estado) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const nuevoDoc = await pool.query(
      "INSERT INTO Docente (Nombre, Especialidad, Correo, Telefono, Estado) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nombre, especialidad, correo, telefono, estado],
    );
    res.json({ mensaje: "Docente creado", data: nuevoDoc.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error al insertar en la base de datos" });
  }
});

/////////////////////////////////////////
///////////AGREGAR CURSO///////////
///////////////////////////////////////
app.post("/api/agregar-curso", async (req, res) => {
  const { nombre_curso, codigo_docente, credito, horario, estado } = req.body; // Recibimos los datos desde el frontend

  if (!nombre_curso) {
    return res
      .status(400)
      .json({ error: "El nombre del curso es obligatorio" });
  }

  try {
    const nuevoCurso = await pool.query(
      "INSERT INTO Curso (Nombre_Curso, Codigo_Docente, Credito, Horario, Estado) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nombre_curso, codigo_docente, credito, horario, estado],
    );
    res.json({ mensaje: "Curso creado", data: nuevoCurso.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error al insertar en la base de datos" });
  }
});
