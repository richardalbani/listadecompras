const express = require("express");
const cors = require("cors");
const sqlite3 = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

// Rota raiz para servir o index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const db = new sqlite3("banco.db");

// Criar tabela users
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    nivel TEXT
  )
`).run();

// Criar tabela itens
db.prepare(`
  CREATE TABLE IF NOT EXISTS itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    nome TEXT,
    quantidade INTEGER,
    valor REAL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`).run();

// Inserir 3 usuários (se não existirem)
const countUsers = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
if (countUsers === 0) {
  const insertUser = db.prepare("INSERT INTO users (nome, nivel) VALUES (?, ?)");
  insertUser.run("Admin Master", "admin");
  insertUser.run("User One", "user");
  insertUser.run("User Two", "user");
  console.log("Usuários iniciais criados.");
}

// Middleware de autenticação simples via headers
function autenticar(req, res, next) {
  const { user_id, nivel } = req.headers;
  if (!user_id || !nivel) return res.status(401).json({ erro: "Não autenticado" });
  req.user = { id: parseInt(user_id), nivel };
  next();
}

// Rotas API

app.get("/users", autenticar, (req, res) => {
  if (req.user.nivel !== "admin") return res.status(403).json({ erro: "Sem permissão" });
  const users = db.prepare("SELECT id, nome, nivel FROM users").all();
  const usersWithItems = users.map(user => {
    const itens = db.prepare("SELECT * FROM itens WHERE user_id = ?").all(user.id);
    return { ...user, itens };
  });
  res.json(usersWithItems);
});

app.put("/users/:id", autenticar, (req, res) => {
  if (req.user.nivel !== "admin") return res.status(403).json({ erro: "Sem permissão" });
  const { nome, nivel } = req.body;
  const { id } = req.params;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!user) return res.status(404).json({ erro: "Usuário não encontrado" });
  db.prepare("UPDATE users SET nome = ?, nivel = ? WHERE id = ?").run(nome, nivel, id);
  res.json({ sucesso: true });
});

app.delete("/users/:id", autenticar, (req, res) => {
  if (req.user.nivel !== "admin") return res.status(403).json({ erro: "Sem permissão" });
  const { id } = req.params;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!user) return res.status(404).json({ erro: "Usuário não encontrado" });
  db.prepare("DELETE FROM itens WHERE user_id = ?").run(id);
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  res.json({ sucesso: true });
});

app.get("/itens", autenticar, (req, res) => {
  if (req.user.nivel === "admin") {
    const itens = db.prepare("SELECT * FROM itens").all();
    return res.json(itens);
  }
  const itens = db.prepare("SELECT * FROM itens WHERE user_id = ?").all(req.user.id);
  res.json(itens);
});

app.post("/itens", autenticar, (req, res) => {
  const { nome, quantidade, valor } = req.body;
  db.prepare("INSERT INTO itens (user_id, nome, quantidade, valor) VALUES (?, ?, ?, ?)")
    .run(req.user.id, nome, quantidade, valor);
  res.json({ sucesso: true });
});

app.put("/itens/:id", autenticar, (req, res) => {
  const { nome, quantidade, valor } = req.body;
  const { id } = req.params;
  const item = db.prepare("SELECT * FROM itens WHERE id = ?").get(id);
  if (!item) return res.status(404).json({ erro: "Item não encontrado" });
  if (req.user.nivel !== "admin" && item.user_id !== req.user.id)
    return res.status(403).json({ erro: "Sem permissão" });
  db.prepare("UPDATE itens SET nome = ?, quantidade = ?, valor = ? WHERE id = ?")
    .run(nome, quantidade, valor, id);
  res.json({ sucesso: true });
});

app.delete("/itens/:id", autenticar, (req, res) => {
  const { id } = req.params;
  const item = db.prepare("SELECT * FROM itens WHERE id = ?").get(id);
  if (!item) return res.status(404).json({ erro: "Item não encontrado" });
  if (req.user.nivel !== "admin" && item.user_id !== req.user.id)
    return res.status(403).json({ erro: "Sem permissão" });
  db.prepare("DELETE FROM itens WHERE id = ?").run(id);
  res.json({ sucesso: true });
});

// Start servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

