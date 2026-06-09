const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
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

    CREATE TABLE IF NOT EXISTS entradas (
      id SERIAL PRIMARY KEY,
      seccion TEXT NOT NULL,
      usuario TEXT,
      titulo TEXT NOT NULL,
      texto TEXT NOT NULL,
      imagen TEXT,
      fecha TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS productos_aira (
      id SERIAL PRIMARY KEY,
      producto TEXT NOT NULL,
      categoria TEXT,
      descripcion TEXT NOT NULL,
      imagen TEXT,
      imagen2 TEXT,
      fecha TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS aira_diagramas (
      id SERIAL PRIMARY KEY,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      src TEXT NOT NULL,
      tipo TEXT DEFAULT 'imagen',
      fecha TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS aira_live (
      id SERIAL PRIMARY KEY,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      src TEXT NOT NULL,
      tipo TEXT DEFAULT 'imagen',
      fecha TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE productos_aira
    ADD COLUMN IF NOT EXISTS imagen2 TEXT;
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
      [usuario || "Sin usuario", password || "", role || "user"]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar acceso" });
  }
});

app.delete("/api/accesos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM accesos WHERE id=$1", [req.params.id]);
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
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [usuario || "Invitado", peso, altura, resultado, estado]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar IMC" });
  }
});

app.delete("/api/imc/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM imc WHERE id=$1", [req.params.id]);
    res.json({ mensaje: "IMC eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar IMC" });
  }
});

/* COMENTARIOS */
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
       VALUES ($1,$2)
       RETURNING *`,
      [nombre || "Anónimo", comentario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar comentario" });
  }
});

app.delete("/api/comentarios/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM comentarios WHERE id=$1", [req.params.id]);
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
       VALUES ($1,$2)
       RETURNING *`,
      [nombre || "Sin nombre", imagen || ""]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar foto" });
  }
});

app.delete("/api/fotos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM fotos WHERE id=$1", [req.params.id]);
    res.json({ mensaje: "Foto eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar foto" });
  }
});

/* CONTENIDO */
app.get("/api/contenido/:clave", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM contenido WHERE clave=$1",
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
       VALUES ($1,$2,$3)
       ON CONFLICT (clave)
       DO UPDATE SET titulo=EXCLUDED.titulo, cuerpo=EXCLUDED.cuerpo
       RETURNING *`,
      [req.params.clave, titulo || "", cuerpo || ""]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar contenido" });
  }
});

/* ENTRADAS */
app.get("/api/entradas/:seccion", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM entradas WHERE seccion=$1 ORDER BY id DESC`,
      [req.params.seccion]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener entradas" });
  }
});

app.post("/api/entradas", async (req, res) => {
  try {
    const { seccion, usuario, titulo, texto, imagen } = req.body;

    const result = await pool.query(
      `INSERT INTO entradas (seccion, usuario, titulo, texto, imagen)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [seccion, usuario || "Invitado", titulo, texto, imagen || ""]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar entrada" });
  }
});

app.delete("/api/entradas/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM entradas WHERE id=$1", [req.params.id]);
    res.json({ mensaje: "Entrada eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar entrada" });
  }
});

/* PRODUCTOS AIRA */
app.get("/api/productos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM productos_aira ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

app.post("/api/productos", async (req, res) => {
  try {
    const { producto, categoria, descripcion, imagen, imagen2 } = req.body;

    const result = await pool.query(
      `INSERT INTO productos_aira
       (producto, categoria, descripcion, imagen, imagen2)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        producto || "Producto sin nombre",
        categoria || "",
        descripcion || "",
        imagen || "",
        imagen2 || ""
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar producto" });
  }
});

app.put("/api/productos/:id", async (req, res) => {
  try {
    const { producto, categoria, descripcion, imagen, imagen2 } = req.body;

    const result = await pool.query(
      `UPDATE productos_aira
       SET producto=$1,
           categoria=$2,
           descripcion=$3,
           imagen=$4,
           imagen2=$5
       WHERE id=$6
       RETURNING *`,
      [
        producto || "Producto sin nombre",
        categoria || "",
        descripcion || "",
        imagen || "",
        imagen2 || "",
        req.params.id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al editar producto" });
  }
});

app.delete("/api/productos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM productos_aira WHERE id=$1", [req.params.id]);
    res.json({ mensaje: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

/* DIAGRAMAS AIRA */
app.get("/api/aira-diagramas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM aira_diagramas ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener diagramas" });
  }
});

app.post("/api/aira-diagramas", async (req, res) => {
  try {
    const { titulo, descripcion, src, tipo } = req.body;

    const result = await pool.query(
      `INSERT INTO aira_diagramas (titulo, descripcion, src, tipo)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [
        titulo || "Diagrama sin título",
        descripcion || "",
        src || "",
        tipo || "imagen"
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar diagrama" });
  }
});

app.put("/api/aira-diagramas/:id", async (req, res) => {
  try {
    const { titulo, descripcion, src, tipo } = req.body;

    const result = await pool.query(
      `UPDATE aira_diagramas
       SET titulo=$1,
           descripcion=$2,
           src=$3,
           tipo=$4
       WHERE id=$5
       RETURNING *`,
      [
        titulo || "Diagrama sin título",
        descripcion || "",
        src || "",
        tipo || "imagen",
        req.params.id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al editar diagrama" });
  }
});

app.delete("/api/aira-diagramas/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM aira_diagramas WHERE id=$1", [req.params.id]);
    res.json({ mensaje: "Diagrama eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar diagrama" });
  }
});

/* LIVE AIRA */
app.get("/api/aira-live", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM aira_live ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener publicaciones LIVE" });
  }
});

app.post("/api/aira-live", async (req, res) => {
  try {
    const { titulo, descripcion, src, tipo } = req.body;

    const result = await pool.query(
      `INSERT INTO aira_live (titulo, descripcion, src, tipo)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [
        titulo || "Publicación LIVE",
        descripcion || "",
        src || "",
        tipo || "imagen"
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar LIVE" });
  }
});

app.delete("/api/aira-live/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM aira_live WHERE id=$1", [req.params.id]);
    res.json({ mensaje: "Publicación LIVE eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar LIVE" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});
