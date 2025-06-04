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
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  let totalGeral = 0;

  data.forEach(item => {
    const total = item.qtd * item.valor;
    totalGeral += total;

    tbody.innerHTML += `
      <tr>
        <td>${item.item}</td>
        <td>${item.qtd}</td>
        <td>R$ ${item.valor.toFixed(2)}</td>
        <td>R$ ${total.toFixed(2)}</td>
      </tr>`;
  });

  document.getElementById("totalGeral").textContent = totalGeral.toFixed(2);
}

async function addItem() {
  const item = document.getElementById("item").value;
  const qtd = parseInt(document.getElementById("qtd").value);
  const valor = parseFloat(document.getElementById("valor").value);

  await fetch("/add", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item, qtd, valor }),
  });

  loadList();
}
