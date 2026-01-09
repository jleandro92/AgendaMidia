let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();
let modoAgenda = false;

const nomesMeses = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

// ELEMENTOS
const loginArea = document.getElementById("login-area");
const appArea = document.getElementById("app-area");
const calendarDays = document.getElementById("calendar-days");
const mesAno = document.getElementById("mesAno");
const agendaLista = document.getElementById("agenda-lista");

const eventoId = document.getElementById("eventoId");
const dataAcao = document.getElementById("dataAcao");
const titulo = document.getElementById("titulo");
const local = document.getElementById("local");
const hora = document.getElementById("hora");
const statusEvento = document.getElementById("status");

const novaAcaoModal = document.getElementById("novaAcaoModal");

// AUTH
auth.onAuthStateChanged(user => {
  if (user) {
    loginArea.style.display = "none";
    appArea.style.display = "block";
    renderCalendario();
  } else {
    loginArea.style.display = "block";
    appArea.style.display = "none";
  }

  document.body.style.display = "block"; // 👈 MOSTRA TUDO AGORA
});


// CALENDÁRIO
function renderCalendario(){
  calendarDays.innerHTML = "";
  mesAno.innerText = `${nomesMeses[mesAtual]} / ${anoAtual}`;

  const primeiro = new Date(anoAtual, mesAtual, 1).getDay();
  const total = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const hoje = new Date();

  let row = document.createElement("div");
  row.className = "row";

  for(let i=0;i<primeiro;i++) row.innerHTML += `<div class="col"></div>`;

  for(let d=1;d<=total;d++){
    const data = `${anoAtual}-${String(mesAtual+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const ehHoje = d===hoje.getDate() && mesAtual===hoje.getMonth() && anoAtual===hoje.getFullYear();

    row.innerHTML += `
      <div class="col p-0">
        <div class="calendar-day ${ehHoje ? "today" : ""}" onclick="abrirModal('${data}')">
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

function mesAnterior(){ mesAtual--; if(mesAtual<0){mesAtual=11;anoAtual--;} renderCalendario(); }
function proximoMes(){ mesAtual++; if(mesAtual>11){mesAtual=0;anoAtual++;} renderCalendario(); }

// MODAL
function abrirModal(data){
  eventoId.value="";
  dataAcao.value=data;
  titulo.value="";
  local.value="";
  hora.value="";
  statusEvento.value="agendado";
  new bootstrap.Modal(novaAcaoModal).show();
}

// CRUD
function salvarEvento(){
  const ev = {
    data: dataAcao.value,
    titulo: titulo.value,
    local: local.value,
    hora: hora.value,
    status: statusEvento.value
  };

  eventoId.value
    ? db.collection("eventos").doc(eventoId.value).update(ev)
    : db.collection("eventos").add(ev);

  bootstrap.Modal.getInstance(novaAcaoModal).hide();
  renderCalendario();
  if(modoAgenda) carregarAgenda();
}

function excluirEvento(){
  if(!eventoId.value) return alert("Selecione um evento");
  if(!confirm("Excluir evento?")) return;

  db.collection("eventos").doc(eventoId.value).delete().then(()=>{
    bootstrap.Modal.getInstance(novaAcaoModal).hide();
    eventoId.value="";
    renderCalendario();
    if(modoAgenda) carregarAgenda();
  });
}

function carregarEventos(){
  document.querySelectorAll(".eventos-dia").forEach(d=>d.innerHTML="");

  db.collection("eventos").get().then(snapshot=>{
    snapshot.forEach(doc=>{
      const e = doc.data();
      const div = document.getElementById("e-"+e.data);
      if(!div) return;

      const el = document.createElement("div");
      el.className = `event ${e.status}`;
      el.innerText = e.titulo;

      el.onclick = (evt)=>{
        evt.stopPropagation();
        eventoId.value = doc.id;
        dataAcao.value = e.data;
        titulo.value = e.titulo;
        local.value = e.local;
        hora.value = e.hora;
        statusEvento.value = e.status;
        new bootstrap.Modal(novaAcaoModal).show();
      };

      div.appendChild(el);
    });
  });
}

// AGENDA
function toggleAgenda(){
  modoAgenda=!modoAgenda;
  calendarDays.style.display = modoAgenda?"none":"block";
  agendaLista.style.display = modoAgenda?"block":"none";
  if(modoAgenda) carregarAgenda();
}

function carregarAgenda(){
  agendaLista.innerHTML="";
  db.collection("eventos").orderBy("data").get().then(snapshot=>{
    snapshot.forEach(doc=>{
      const e = doc.data();
      agendaLista.innerHTML += `
        <div class="card p-2 mb-2">
          <strong>${e.titulo}</strong>
          <small>${e.data} • ${e.hora}</small><br>
          <small>${e.local}</small>
        </div>`;
    });
  });
}

// AUTH
function loginGoogle(){
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
}
function logout(){ auth.signOut(); }
