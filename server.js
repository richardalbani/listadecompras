const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

let data = require('./data.json');

// Rota de login com usuário fixo
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'user' && password === 'user123') {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Login inválido' });
    }
});

// Rota para pegar a lista
app.get('/list', (req, res) => {
    res.json(data);
});

// Rota para salvar item novo
app.post('/add', (req, res) => {
    data.push(req.body);
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Minhas Compras rodando na porta ${PORT}`));
