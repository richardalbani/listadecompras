let usuarioLogado = null;
let isAdmin = false;

function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, senha })
  })
  .then(res => res.json())
  .then(data => {
    if (data.sucesso) {
      usuarioLogado = usuario;
      isAdmin = data.admin;
      document.getElementById("login-area").style.display = "none";
      document.getElementById("app").style.display = "block";
      document.getElementById("usuario-logado").textContent = usuario;
      carregarLista();
    } else {
      alert("Login inválido!");
    }
  });
}

function carregarLista() {
  fetch("/api/itens")
    .then(res => res.json())
    .then(lista => {
      const ul = document.getElementById("lista");
      ul.innerHTML = "";
      lista.forEach(item => {
        const li = document.createElement("li");
        li.innerText = `${item.nome} - ${item.quantidade} x R$${item.preco.toFixed(2)}`;
        if (isAdmin) {
          const btn = document.createElement("button");
          btn.innerText = "Apagar";
          btn.onclick = () => deletarItem(item.id);
          li.append(" ", btn);
        }
        ul.appendChild(li);
      });
    });
}

function adicionarItem() {
  const nome = document.getElementById("nome").value;
  const quantidade = +document.getElementById("quantidade").value;
  const preco = +document.getElementById("preco").value;
  fetch("/api/itens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, quantidade, preco })
  }).then(() => carregarLista());
}

function deletarItem(id) {
  fetch("/api/itens/" + id, { method: "DELETE" })
    .then(() => carregarLista());
}
