```javascript
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/* =========================
   INICIO
========================= */

app.get("/", (req, res) => {
  res.json({
    mensaje: "API BotanicaPro funcionando correctamente"
  });
});

/* =========================
   USUARIOS
========================= */

// Obtener usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM usuarios ORDER BY id DESC"
    );

    res.json(resultado.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener usuarios"
    });
  }
});

// Crear usuario
app.post("/usuarios", async (req, res) => {

  try {

    const { nombre, correo, password } = req.body;

    const resultado = await pool.query(
      `
      INSERT INTO usuarios
      (nombre, correo, password)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [nombre, correo, password]
    );

    res.status(201).json(resultado.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al crear usuario"
    });

  }

});

// Eliminar usuario
app.delete("/usuarios/:id", async (req, res) => {

  try {

    await pool.query(
      "DELETE FROM usuarios WHERE id = $1",
      [req.params.id]
    );

    res.json({
      mensaje: "Usuario eliminado"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al eliminar usuario"
    });

  }

});

/* =========================
   RECETAS
========================= */

// Obtener recetas
app.get("/recetas", async (req, res) => {

  try {

    const resultado = await pool.query(
      "SELECT * FROM recetas ORDER BY id DESC"
    );

    res.json(resultado.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al obtener recetas"
    });

  }

});

// Crear receta
app.post("/recetas", async (req, res) => {

  try {

    const {
      nombre,
      ingredientes,
      pasos,
      beneficios,
      imagen
    } = req.body;

    const resultado = await pool.query(
      `
      INSERT INTO recetas
      (nombre, ingredientes, pasos, beneficios, imagen)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        nombre,
        ingredientes,
        pasos,
        beneficios,
        imagen
      ]
    );

    res.status(201).json(resultado.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al crear receta"
    });

  }

});

// Eliminar receta
app.delete("/recetas/:id", async (req, res) => {

  try {

    await pool.query(
      "DELETE FROM recetas WHERE id = $1",
      [req.params.id]
    );

    res.json({
      mensaje: "Receta eliminada"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al eliminar receta"
    });

  }

});

/* =========================
   COMENTARIOS
========================= */

// Obtener comentarios
app.get("/comentarios", async (req, res) => {

  try {

    const resultado = await pool.query(
      "SELECT * FROM comentarios ORDER BY id DESC"
    );

    res.json(resultado.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al obtener comentarios"
    });

  }

});

// Crear comentario
app.post("/comentarios", async (req, res) => {

  try {

    const { nombre, comentario } = req.body;

    const resultado = await pool.query(
      `
      INSERT INTO comentarios
      (nombre, comentario)
      VALUES ($1, $2)
      RETURNING *
      `,
      [nombre, comentario]
    );

    res.status(201).json(resultado.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al guardar comentario"
    });

  }

});

// Eliminar comentario
app.delete("/comentarios/:id", async (req, res) => {

  try {

    await pool.query(
      "DELETE FROM comentarios WHERE id = $1",
      [req.params.id]
    );

    res.json({
      mensaje: "Comentario eliminado"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al eliminar comentario"
    });

  }

});

/* =========================
   POLINIZADORES
========================= */

// Obtener polinizadores
app.get("/polinizadores", async (req, res) => {

  try {

    const resultado = await pool.query(
      "SELECT * FROM polinizadores ORDER BY id DESC"
    );

    res.json(resultado.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al obtener polinizadores"
    });

  }

});

// Crear polinizador
app.post("/polinizadores", async (req, res) => {

  try {

    const {
      nombre,
      descripcion,
      importancia
    } = req.body;

    const resultado = await pool.query(
      `
      INSERT INTO polinizadores
      (nombre, descripcion, importancia)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [
        nombre,
        descripcion,
        importancia
      ]
    );

    res.status(201).json(resultado.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al crear polinizador"
    });

  }

});

// Eliminar polinizador
app.delete("/polinizadores/:id", async (req, res) => {

  try {

    await pool.query(
      "DELETE FROM polinizadores WHERE id = $1",
      [req.params.id]
    );

    res.json({
      mensaje: "Polinizador eliminado"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al eliminar polinizador"
    });

  }

});

/* =========================
   SERVIDOR
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});
```
