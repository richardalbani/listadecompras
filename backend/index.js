const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const app = express();
const db = new Database("banco.db");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Criação da tabela se não existir
db.prepare("CREATE TABLE IF NOT EXISTS itens (id INTEGER PRIMARY KEY, nome TEXT, quantidade INTEGER, preco REAL)").run();
db.prepare("CREATE TABLE IF NOT EXISTS usuarios (usuario TEXT PRIMARY KEY, senha TEXT, admin INTEGER)").run();

// Usuários padrão
try {
  db.prepare("INSERT INTO usuarios (usuario, senha, admin) VALUES (?, ?, ?)").run("admin", "admin123", 1);
  db.prepare("INSERT INTO usuarios (usuario, senha, admin) VALUES (?, ?, ?)").run("user", "user123", 0);
} catch (e) {}

app.post("/api/login", (req, res) => {
  const { usuario, senha } = req.body;
  const user = db.prepare("SELECT * FROM usuarios WHERE usuario = ? AND senha = ?").get(usuario, senha);
  if (user) {
    res.json({ sucesso: true, admin: !!user.admin });
  } else {
    res.json({ sucesso: false });
  }
});

app.get("/api/itens", (req, res) => {
  const itens = db.prepare("SELECT * FROM itens").all();
  res.json(itens);
});

app.post("/api/itens", (req, res) => {
  const { nome, quantidade, preco } = req.body;
  db.prepare("INSERT INTO itens (nome, quantidade, preco) VALUES (?, ?, ?)").run(nome, quantidade, preco);
  res.sendStatus(201);
});

app.delete("/api/itens/:id", (req, res) => {
  db.prepare("DELETE FROM itens WHERE id = ?").run(req.params.id);
  res.sendStatus(204);
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));

