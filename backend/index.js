const express = require("express");
const cors = require("cors");
const sqlite3 = require("better-sqlite3");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3("banco.db");
db.prepare(\`
  CREATE TABLE IF NOT EXISTS itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    nome TEXT,
    quantidade INTEGER,
    valor REAL
  )
\`).run();

function autenticar(req, res, next) {
  const { user_id, nivel } = req.headers;
  if (!user_id || !nivel) return res.status(401).json({ erro: "Não autenticado" });
  req.user = { id: parseInt(user_id), nivel };
  next();
}

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

app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));