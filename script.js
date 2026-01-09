let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();

const nomesMeses = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

auth.onAuthStateChanged(user => {
  document.getElementById("login-area").style.display = user ? "none" : "block";
  document.getElementById("app-area").style.display = user ? "block" : "none";
  if (user) renderCalendario();
});

/* ================= CALENDÁRIO ================= */

function renderCalendario(){
  const c = document.getElementById("calendar-days");
  c.innerHTML = "";

  document.getElementById("mesAno").innerText =
    `${nomesMeses[mesAtual]} / ${anoAtual}`;

  const primeiro = new Date(anoAtual, mesAtual, 1).getDay();
  const total = new Date(anoAtual, mesAtual + 1, 0).getDate();

  let row = document.createElement("div");
  row.className = "row";

  for(let i = 0; i < primeiro; i++){
    row.innerHTML += `<div class="col"></div>`;
  }

  for(let d = 1; d <= total; d++){
    const data = `${anoAtual}-${String(mesAtual+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

    row.innerHTML += `
      <div class="col p-0">
        <div class="calendar-day" onclick="abrirModal('${data}')">
          <strong>${d}</strong>
          <div id="e-${data}" class="eventos-dia"></div>
        </div>
      </div>`;

    if ((primeiro + d) % 7 === 0) {
      c.appendChild(row);
      row = document.createElement("div");
      row.className = "row";
    }
  }

  c.appendChild(row);
  carregarEventos();
}

function proximoMes(){
  mesAtual++;
  if(mesAtual > 11){ mesAtual = 0; anoAtual++; }
  renderCalendario();
}

function mesAnterior(){
  mesAtual--;
  if(mesAtual < 0){ mesAtual = 11; anoAtual--; }
  renderCalendario();
}

/* ================= MODAL ================= */

function abrirModal(data){
  eventoId.value = "";
  dataAcao.value = data;
  titulo.value = "";
  local.value = "";
  hora.value = "";

  new bootstrap.Modal(novaAcaoModal).show();
}

/* ================= FIRESTORE ================= */

function salvarEvento(){
  const ev = {
    data: dataAcao.value,
    titulo: titulo.value,
    local: local.value,
    hora: hora.value
  };

  if(eventoId.value){
    db.collection("eventos").doc(eventoId.value).update(ev);
  } else {
    db.collection("eventos").add(ev);
  }

  bootstrap.Modal.getInstance(novaAcaoModal).hide();
  carregarEventos();
}

function excluirEvento(){
  if(eventoId.value){
    db.collection("eventos").doc(eventoId.value).delete();
    bootstrap.Modal.getInstance(novaAcaoModal).hide();
    carregarEventos();
  }
}

function carregarEventos(){
  // limpa antes de recarregar
  document.querySelectorAll(".eventos-dia").forEach(d => d.innerHTML = "");

  db.collection("eventos").get().then(snap => {
    snap.forEach(doc => {
      const e = doc.data();
      const div = document.getElementById("e-" + e.data);

      if(div){
        div.innerHTML += `
          <div class="event" onclick="editarEvento('${doc.id}','${e.data}','${e.titulo}','${e.local}','${e.hora}')">
            ${e.titulo}
          </div>`;
      }
    });
  });
}

function editarEvento(id,data,tit,loc,hor){
  eventoId.value = id;
  dataAcao.value = data;
  titulo.value = tit;
  local.value = loc;
  hora.value = hor;

  new bootstrap.Modal(novaAcaoModal).show();
}

/* ================= AUTH ================= */

function loginGoogle(){
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(e => alert(e.message));
}

function logout(){
  auth.signOut();
}
