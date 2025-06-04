let tempList = [];

async function login() {
  const username = document.getElementById("user").value;
  const password = document.getElementById("pass").value;
  const res = await fetch("/login", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (res.ok) {
    document.getElementById("app").style.display = "block";
    loadList();
  } else {
    alert("Login inválido!");
  }
}

async function loadList() {
  const res = await fetch("/list");
  const data = await res.json();
  tempList = data;
  renderTable();
}

function addItem() {
  const item = document.getElementById("item").value;
  const qtd = parseInt(document.getElementById("qtd").value);
  const valor = parseFloat(document.getElementById("valor").value);
  const total = qtd * valor;

  if (!item || isNaN(qtd) || isNaN(valor)) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  tempList.push({ item, qtd, valor, total });
  renderTable();

  document.getElementById("item").value = "";
  document.getElementById("qtd").value = "";
  document.getElementById("valor").value = "";
}

function removeItem(index) {
  tempList.splice(index, 1);
  renderTable();
}

function renderTable() {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  let totalGeral = 0;

  tempList.forEach((entry, i) => {
    totalGeral += entry.total;

    const row = `<tr>
      <td>${entry.item}</td>
      <td>${entry.qtd}</td>
      <td>R$ ${entry.valor.toFixed(2)}</td>
      <td>R$ ${entry.total.toFixed(2)}</td>
      <td><button onclick="removeItem(${i})">Excluir</button></td>
    </tr>`;

    tbody.innerHTML += row;
  });

  document.getElementById("totalGeral").textContent = totalGeral.toFixed(2);
}

async function saveList() {
  await fetch("/save", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tempList),
  });
  alert("Lista salva com sucesso!");
}
