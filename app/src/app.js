const path = require("path");
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// 👉 Serve static files (HTML UI)
app.use(express.static(path.join(__dirname)));

// Connect to PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Create table if not exists
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        content TEXT
      );
    `);
    console.log("Table ready");
  } catch (err) {
    console.error("Table creation error:", err);
  }
})();

// 👉 MAIN PAGE → serve UI instead of text
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Get all notes
app.get("/api/notes", async (req, res) => {
  const result = await pool.query("SELECT * FROM notes ORDER BY id DESC");
  res.json(result.rows);
});

app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Add note
app.post("/api/notes", async (req, res) => {
  const { content } = req.body;

  const result = await pool.query(
    "INSERT INTO notes (content) VALUES ($1) RETURNING *",
    [content]
  );

  res.json(result.rows[0]);
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
