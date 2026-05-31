const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.use(express.static(__dirname));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function crearTablas() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accesos (
      id SERIAL PRIMARY KEY,
      usuario TEXT NOT NULL,
      password TEXT,
      role TEXT NOT NULL,
      fecha TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS imc (
      id SERIAL PRIMARY KEY,
      usuario TEXT NOT NULL,
      peso NUMERIC,
      altura NUMERIC,
      resultado NUMERIC,
      estado TEXT,
      fecha TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS comentarios (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      comentario TEXT NOT NULL,
      fecha TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS fotos (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      imagen TEXT NOT NULL,
      fecha TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contenido (
      clave TEXT PRIMARY KEY,
      titulo TEXT,
      cuerpo TEXT
    );
  `);

  console.log("Tablas listas en Neon/Postgres");
}

crearTablas().catch(console.error);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/index2.html", (req, res) => {
  res.sendFile(path.join(__dirname, "index2.html"));
});

/* ACCESOS */

app.get("/api/accesos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM accesos ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener accesos" });
  }
});

app.post("/api/accesos", async (req, res) => {
  try {
    const { usuario, password, role } = req.body;

    const result = await pool.query(
      `INSERT INTO accesos (usuario, password, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [usuario, password, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar acceso" });
  }
});

app.delete("/api/accesos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM accesos WHERE id = $1", [req.params.id]);
    res.json({ mensaje: "Acceso eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar acceso" });
  }
});

/* IMC */

app.get("/api/imc", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM imc ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener IMC" });
  }
});

app.post("/api/imc", async (req, res) => {
  try {
    const { usuario, peso, altura, resultado, estado } = req.body;

    const result = await pool.query(
      `INSERT INTO imc (usuario, peso, altura, resultado, estado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [usuario, peso, altura, resultado, estado]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar IMC" });
  }
});

app.delete("/api/imc/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM imc WHERE id = $1", [req.params.id]);
    res.json({ mensaje: "IMC eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar IMC" });
  }
});

/* COMENTARIOS / OPINIONES */

app.get("/api/comentarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM comentarios ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener comentarios" });
  }
});

app.post("/api/comentarios", async (req, res) => {
  try {
    const { nombre, comentario } = req.body;

    const result = await pool.query(
      `INSERT INTO comentarios (nombre, comentario)
       VALUES ($1, $2)
       RETURNING *`,
      [nombre, comentario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar comentario" });
  }
});

app.delete("/api/comentarios/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM comentarios WHERE id = $1", [req.params.id]);
    res.json({ mensaje: "Comentario eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar comentario" });
  }
});

/* FOTOS */

app.get("/api/fotos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM fotos ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener fotos" });
  }
});

app.post("/api/fotos", async (req, res) => {
  try {
    const { nombre, imagen } = req.body;

    const result = await pool.query(
      `INSERT INTO fotos (nombre, imagen)
       VALUES ($1, $2)
       RETURNING *`,
      [nombre, imagen]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar foto" });
  }
});

app.delete("/api/fotos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM fotos WHERE id = $1", [req.params.id]);
    res.json({ mensaje: "Foto eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar foto" });
  }
});

/* CONTENIDO EDITABLE */

app.get("/api/contenido/:clave", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM contenido WHERE clave = $1",
      [req.params.clave]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener contenido" });
  }
});

app.put("/api/contenido/:clave", async (req, res) => {
  try {
    const { titulo, cuerpo } = req.body;

    const result = await pool.query(
      `INSERT INTO contenido (clave, titulo, cuerpo)
       VALUES ($1, $2, $3)
       ON CONFLICT (clave)
       DO UPDATE SET titulo = EXCLUDED.titulo, cuerpo = EXCLUDED.cuerpo
       RETURNING *`,
      [req.params.clave, titulo, cuerpo]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar contenido" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});
