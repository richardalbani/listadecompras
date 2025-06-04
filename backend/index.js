// === index.js (Backend) ===
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const app = express();
const db = new Database("banco.db");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Tabelas

// Itens por usuário
// Cada item terá um campo "usuario" para sabermos quem adicionou

// Criação das tabelas

// Tabela de itens com campo de usuário

db.prepare(`CREATE TABLE IF NOT EXISTS itens (
  id INTEGER PRIMARY KEY,
  nome TEXT,
  quantidade INTEGER,
  preco REAL,
  usuario TEXT
)`).run();

// Tabela de usuários

db.prepare(`CREATE TABLE IF NOT EXISTS usuarios (
  usuario TEXT PRIMARY KEY,
  senha TEXT,
  admin INTEGER
)`).run();

// Inserir usuários padrão (ignorar se já existir)
const usuariosPadrao = [
  ["Richard", "Richard123", 1],
  ["BB", "Italo1103", 0],
  ["Joao", "Joao123", 0],
  ["user3", "senha3", 0],
];

for (const [usuario, senha, admin] of usuariosPadrao) {
  try {
    db.prepare("INSERT INTO usuarios (usuario, senha, admin) VALUES (?, ?, ?)").run(usuario, senha, admin);
  } catch (e) {}
}

// Login
app.post("/api/login", (req, res) => {
  const { usuario, senha } = req.body;
  const user = db.prepare("SELECT * FROM usuarios WHERE usuario = ? AND senha = ?").get(usuario, senha);
  if (user) {
    res.json({ sucesso: true, admin: !!user.admin });
  } else {
    res.json({ sucesso: false });
  }
});

// Lista de itens
app.get("/api/itens", (req, res) => {
  const itens = db.prepare("SELECT * FROM itens").all();
  res.json(itens);
});

// Adicionar item
app.post("/api/itens", (req, res) => {
  const { nome, quantidade, preco, usuario } = req.body;
  db.prepare("INSERT INTO itens (nome, quantidade, preco, usuario) VALUES (?, ?, ?, ?)")
    .run(nome, quantidade, preco, usuario);
  res.sendStatus(201);
});

// Apagar item
app.delete("/api/itens/:id", (req, res) => {
  db.prepare("DELETE FROM itens WHERE id = ?").run(req.params.id);
  res.sendStatus(204);
});

// Listar usuários (somente para admin)
app.get("/api/usuarios", (req, res) => {
  const usuarios = db.prepare("SELECT usuario, admin FROM usuarios").all();
  res.json(usuarios);
});

// Apagar usuário
app.delete("/api/usuarios/:usuario", (req, res) => {
  db.prepare("DELETE FROM usuarios WHERE usuario = ?").run(req.params.usuario);
  res.sendStatus(204);
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
