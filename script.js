// ================= VARIÁVEIS GLOBAIS =================
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();
let modoAgenda = false;

const nomesMeses = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

// ================= ELEMENTOS DO DOM =================
const loginArea = document.getElementById("login-area");
const appArea = document.getElementById("app-area");
const calendarDays = document.getElementById("calendar-days");
const agendaLista = document.getElementById("agenda-lista");
const mesAno = document.getElementById("mesAno");

const eventoId = document.getElementById("eventoId");
const dataAcao = document.getElementById("dataAcao");
const titulo = document.getElementById("titulo");
const local = document.getElementById("local");
const hora = document.getElementById("hora");
const tipo = document.getElementById("tipo");
const novaAcaoModal = document.getElementById("novaAcaoModal");
const statusEvento = document.getElementById("status");

// ================= AUTENTICAÇÃO =================
auth.onAuthStateChanged(user => {
  loginArea.style.display = user ? "none" : "block";
  appArea.style.display = user ? "block" : "none";
  if (user) renderCalendario();
});

function loginGoogle(){
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .catch(e => alert(e.message));
}

function logout(){
  auth.signOut();
}

// ================= CALENDÁRIO =================
function renderCalendario(){
  calendarDays.innerHTML = "";
  mesAno.innerText = `${nomesMeses[mesAtual]} / ${anoAtual}`;

  const primeiro = new Date(anoAtual, mesAtual, 1).getDay();
  const total = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const hoje = new Date();

  let row = document.createElement("div");
  row.className = "row";

  for(let i = 0; i < primeiro; i++){
    row.innerHTML += `<div class="col"></div>`;
  }

  for(let d = 1; d <= total; d++){
    const data = `${anoAtual}-${String(mesAtual+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const ehHoje =
      d === hoje.getDate() &&
      mesAtual === hoje.getMonth() &&
      anoAtual === hoje.getFullYear();

    row.innerHTML += `
      <div class="col p-0">
        <div class="calendar-day ${ehHoje ? "today" : ""}"
             onclick="abrirModal('${data}')">
          <strong>${d}</strong>
          <div id="e-${data}" class="eventos-dia"></div>
        </div>
      </div>`;

    if((primeiro + d) % 7 === 0){
      calendarDays.appendChild(row);
      row = document.createElement("div");
      row.className = "row";
    }
  }

  calendarDays.appendChild(row);
  carregarEventos();
}

function proximoMes(){
  mesAtual++;
  if(mesAtual > 11){
    mesAtual = 0;
    anoAtual++;
  }
  renderCalendario();
}

function mesAnterior(){
  mesAtual--;
  if(mesAtual < 0){
    mesAtual = 11;
    anoAtual--;
  }
  renderCalendario();
}

// ================= EVENTOS =================
function abrirModal(data){
  eventoId.value = "";
  dataAcao.value = data;
  titulo.value = "";
  local.value = "";
  hora.value = "";
  tipo.value = "padrao";
  statusEvento.value = "agendado";
  new bootstrap.Modal(novaAcaoModal).show();
}

function salvarEvento(){
  const ev = {
    data: dataAcao.value,
    titulo: titulo.value,
    local: local.value,
    hora: hora.value,
    tipo: tipo.value,
    status: statusEvento.value
  };

  if (eventoId.value) {
    db.collection("eventos").doc(eventoId.value).update(ev);
  } else {
    db.collection("eventos").add(ev);
  }

  bootstrap.Modal.getInstance(novaAcaoModal).hide();
  carregarEventos();
}

function excluirEvento(){
  if (!eventoId.value) {
    alert("Evento não selecionado");
    return;
  }

  if (confirm("Deseja excluir este evento?")) {
    db.collection("eventos").doc(eventoId.value).delete()
      .then(() => {
        bootstrap.Modal.getInstance(novaAcaoModal).hide();
        carregarEventos();
      });
  }
}


function carregarEventos(){
  document.querySelectorAll(".eventos-dia").forEach(d => d.innerHTML = "");

  db.collection("eventos").get().then(snap => {
    snap.forEach(doc => {
      const e = doc.data();
      const div = document.getElementById("e-" + e.data);

      if (div) {
        div.innerHTML += `
          <div class="event ${e.tipo || "padrao"} status-${e.status || "agendado"}"
            onclick="editarEvento(
              '${doc.id}',
              '${e.data}',
              '${e.titulo}',
              '${e.local}',
              '${e.hora}',
              '${e.tipo || "padrao"}',
              '${e.status || "agendado"}'
            )">
            ${e.titulo}
          </div>`;
      }
    });
  });
}


function editarEvento(id, data, t, l, h, tp, st){
  eventoId.value = id;
  dataAcao.value = data;
  titulo.value = t;
  local.value = l;
  hora.value = h;
  tipo.value = tp;
  statusEvento.value = st;

  new bootstrap.Modal(novaAcaoModal).show();
}


// ================= AGENDA =================
function toggleAgenda(){
  modoAgenda = !modoAgenda;
  calendarDays.style.display = modoAgenda ? "none" : "block";
  agendaLista.style.display = modoAgenda ? "block" : "none";
  if(modoAgenda) carregarAgenda();
}

function carregarAgenda(){
  agendaLista.innerHTML = "";
  db.collection("eventos").orderBy("data").get().then(snap => {
    snap.forEach(doc => {
      const e = doc.data();
      agendaLista.innerHTML += `
        <div class="card p-2 mb-2">
          <strong>${e.titulo}</strong><br>
          <small>${e.data} - ${e.hora}</small><br>
          <small>${e.local}</small>
        </div>`;
    });
  });
}
