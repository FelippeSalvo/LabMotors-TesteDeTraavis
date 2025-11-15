const tasks = [
  { id: 1, cliente: "João", moto: "CG 160", servico: "Troca de óleo", status: "waiting" },
  { id: 2, cliente: "Marcos", moto: "Fazer 250", servico: "Revisão elétrica", status: "progress" },
];

function renderTasks() {
  document.querySelectorAll(".kanban-items").forEach(col => col.innerHTML = "");

  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "kanban-item";
    card.draggable = true;
    card.dataset.id = task.id;
    card.innerHTML = `
      <strong>Cliente:</strong> ${task.cliente}<br>
      <strong>Moto:</strong> ${task.moto}<br>
      <strong>Serviço:</strong> ${task.servico}
    `;
    card.addEventListener("dragstart", dragStart);
    document.getElementById(task.status).appendChild(card);
  });
}

function dragStart(e) {
  e.dataTransfer.setData("id", e.target.dataset.id);
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  const id = e.dataTransfer.getData("id");
  const task = tasks.find(t => t.id == id);
  task.status = e.currentTarget.id;
  renderTasks();
}

document.querySelectorAll(".kanban-items").forEach(col => {
  col.addEventListener("dragover", dragOver);
  col.addEventListener("drop", drop);
});

/* === MODAL === */
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");

openModalBtn.onclick = () => modal.style.display = "flex";
closeModalBtn.onclick = () => modal.style.display = "none";

// Salvar novo card
saveTaskBtn.onclick = () => {
  const cliente = document.getElementById("clienteInput").value;
  const moto = document.getElementById("motoInput").value;
  const servico = document.getElementById("servicoInput").value;

  if (cliente === "" || moto === "" || servico === "") {
    alert("Preencha todos os campos");
    return;
  }

  tasks.push({
    id: tasks.length + 1,
    cliente,
    moto,
    servico,
    status: "waiting"
  });

  renderTasks();
  modal.style.display = "none";
};

renderTasks();
