let usuarioLogado = null;
let userId = null;
let nivel = null;

function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  // Simulando login - você deve substituir pelo login real se tiver
  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, senha })
  })
  .then(res => res.json())
  .then(data => {
    if (data.sucesso) {
      usuarioLogado = data.nome; // nome do usuário vindo do backend
      userId = data.user_id;      // id do usuário vindo do backend
      nivel = data.nivel;         // nível do usuário vindo do backend (admin ou user)
      document.getElementById("login-area").style.display = "none";
      document.getElementById("app").style.display = "block";
      document.getElementById("usuario-logado").textContent = usuarioLogado;

      if (nivel === "admin") {
        carregarUsuariosComItens();
      } else {
        carregarLista();
      }
    } else {
      alert("Login inválido!");
    }
  });
}

function carregarLista() {
  fetch("/itens", {
    headers: {
      "user_id": userId,
      "nivel": nivel
    }
  })
  .then(res => res.json())
  .then(lista => {
    const ul = document.getElementById("lista");
    ul.innerHTML = "";
    lista.forEach(item => {
      const li = document.createElement("li");
      li.innerText = `${item.nome} - ${item.quantidade} x R$${item.valor.toFixed(2)}`;
      // Só mostrar botão apagar se admin ou dono do item
      if (nivel === "admin" || item.user_id === userId) {
        const btn = document.createElement("button");
        btn.innerText = "Apagar";
        btn.onclick = () => deletarItem(item.id);
        li.append(" ", btn);
      }
      ul.appendChild(li);
    });
  });
}

// Função para carregar todos os usuários com seus itens (admin)
function carregarUsuariosComItens() {
  fetch("/users", {
    headers: {
      "user_id": userId,
      "nivel": nivel
    }
  })
  .then(res => res.json())
  .then(users => {
    const div = document.getElementById("usuarios-com-itens");
    div.innerHTML = "";
    users.forEach(user => {
      const userDiv = document.createElement("div");
      userDiv.style.border = "1px solid #ccc";
      userDiv.style.margin = "10px";
      userDiv.style.padding = "10px";

      // Nome e nível do usuário com botão para expandir itens
      const userHeader = document.createElement("div");
      userHeader.style.cursor = "pointer";
      userHeader.style.fontWeight = "bold";
      userHeader.textContent = `${user.nome} (${user.nivel})`;
      
      // Container para os itens, inicialmente escondido
      const itensContainer = document.createElement("ul");
      itensContainer.style.display = "none";

      user.itens.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.nome} - ${item.quantidade} x R$${item.valor.toFixed(2)}`;

        // Botão apagar para admin
        const btn = document.createElement("button");
        btn.innerText = "Apagar";
        btn.onclick = () => {
          deletarItem(item.id).then(() => carregarUsuariosComItens());
        };
        li.append(" ", btn);
        itensContainer.appendChild(li);
      });

      userHeader.onclick = () => {
        itensContainer.style.display = itensContainer.style.display === "none" ? "block" : "none";
      };

      userDiv.appendChild(userHeader);
      userDiv.appendChild(itensContainer);
      div.appendChild(userDiv);
    });
  });
}

function adicionarItem() {
  const nome = document.getElementById("nome").value;
  const quantidade = +document.getElementById("quantidade").value;
  const valor = +document.getElementById("preco").value;
  fetch("/itens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "user_id": userId,
      "nivel": nivel
    },
    body: JSON.stringify({ nome, quantidade, valor })
  }).then(() => {
    if (nivel === "admin") {
      carregarUsuariosComItens();
    } else {
      carregarLista();
    }
  });
}

function deletarItem(id) {
  return fetch("/itens/" + id, {
    method: "DELETE",
    headers: {
      "user_id": userId,
      "nivel": nivel
    }
  }).then(() => {
    if (nivel === "admin") {
      carregarUsuariosComItens();
    } else {
      carregarLista();
    }
  });
}
