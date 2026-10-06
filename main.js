import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  push, 
  onValue, 
  remove, 
  update 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0YvCoeRdDCTuhk4jHMPq5GHGpkKY4qFA",
  authDomain: "dafe-spotify.firebaseapp.com",
  databaseURL: "https://dafe-spotify-default-rtdb.firebaseio.com",
  projectId: "dafe-spotify",
  storageBucket: "dafe-spotify.firebasestorage.app",
  messagingSenderId: "178024870650",
  appId: "1:178024870650:web:4bac901555d9f5afef0f43",
  measurementId: "G-9QEZZ9B70Q"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const refMusicas = ref(db, "musicas");

function escutarEvento(idElemento, evento, callback) {
  const el = document.getElementById(idElemento);
  if (el) {
    el.addEventListener(evento, callback);
  }
}

// Elementos Principais
const modalCriador = document.getElementById("modal-criador");
const formulario = document.getElementById("meu-formulario");
const inputId = document.getElementById("id-musica");
const inputTitulo = document.getElementById("input-titulo");
const inputArtista = document.getElementById("input-artista");
const inputImagem = document.getElementById("input-imagem");
const inputAudio = document.getElementById("input-audio");
const inputSearch = document.getElementById("input-search");
const tabelaCorpo = document.getElementById("lista-musicas-tabela");
const countMusicas = document.getElementById("count-musicas");

const tituloForm = document.getElementById("titulo-form");
const btnSalvar = document.getElementById("btn-salvar");

const meuPlayer = document.getElementById("meu-player");
const playerCapa = document.getElementById("player-capa");
const playerTitulo = document.getElementById("player-titulo");
const playerArtista = document.getElementById("player-artista");

let dadosMusicasAtuais = {};

// --- NAVEGAÇÃO E BOTÕES ---

escutarEvento("btn-inicio", "click", (e) => {
  e.preventDefault();
  atualizarAbaAtiva("btn-inicio");
  if (inputSearch) inputSearch.value = "";
  renderizarTabela(dadosMusicasAtuais, "");
  const contentBody = document.getElementById("content-body");
  if (contentBody) contentBody.scrollTop = 0;
});

escutarEvento("btn-buscar", "click", (e) => {
  e.preventDefault();
  atualizarAbaAtiva("btn-buscar");
  if (inputSearch) inputSearch.focus();
});

const abrirModal = () => {
  if (modalCriador) modalCriador.classList.remove("escondido");
};

const fecharModal = () => {
  if (modalCriador) modalCriador.classList.add("escondido");
  limparFormulario();
};

escutarEvento("btn-painel-criador", "click", (e) => {
  e.preventDefault();
  abrirModal();
});
escutarEvento("btn-add-quick", "click", abrirModal);
escutarEvento("btn-fechar-modal", "click", fecharModal);
escutarEvento("btn-cancelar", "click", fecharModal);

escutarEvento("pill-playlists", "click", () => {
  document.getElementById("pill-playlists")?.classList.add("active");
  document.getElementById("pill-artistas")?.classList.remove("active");
});

escutarEvento("pill-artistas", "click", () => {
  document.getElementById("pill-artistas")?.classList.add("active");
  document.getElementById("pill-playlists")?.classList.remove("active");
});

function atualizarAbaAtiva(idAba) {
  document.querySelectorAll(".nav-item").forEach((el) => el.classList.remove("active"));
  document.getElementById(idAba)?.classList.add("active");
}

// --- MEDIA SESSION API ---
function atualizarMediaSession(musica) {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: musica.titulo || "Música",
      artist: musica.artista || "Artista",
      album: "Spotify Dafeni",
      artwork: [
        { src: musica.imagem || "https://via.placeholder.com/512/121212/FFFFFF?text=Music", sizes: "512x512", type: "image/png" }
      ]
    });

    navigator.mediaSession.setActionHandler("play", () => meuPlayer?.play());
    navigator.mediaSession.setActionHandler("pause", () => meuPlayer?.pause());
  }
}

// --- FIREBASE E TABELA ---

onValue(refMusicas, (snapshot) => {
  dadosMusicasAtuais = snapshot.val() || {};
  renderizarTabela(dadosMusicasAtuais, inputSearch ? inputSearch.value : "");
});

if (inputSearch) {
  inputSearch.addEventListener("input", (e) => {
    renderizarTabela(dadosMusicasAtuais, e.target.value);
  });
}

function renderizarTabela(dados, filtro = "") {
  if (!tabelaCorpo) return;
  tabelaCorpo.innerHTML = "";
  
  const ids = Object.keys(dados);
  const termoBaixo = filtro.toLowerCase().trim();

  const idsFiltrados = ids.filter((id) => {
    const musica = dados[id];
    const titulo = (musica.titulo || "").toLowerCase();
    const artista = (musica.artista || "").toLowerCase();
    return titulo.includes(termoBaixo) || artista.includes(termoBaixo);
  });

  if (countMusicas) countMusicas.textContent = idsFiltrados.length;

  idsFiltrados.forEach((id, index) => {
    desenharLinhaTabela(id, dados[id], index + 1);
  });
}

function desenharLinhaTabela(id, musica, numero) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${numero}</td>
    <td>
      <div class="track-info">
        <img src="${musica.imagem}" alt="Capa" onerror="this.src='https://via.placeholder.com/40/282828/FFFFFF?text=X'">
        <strong>${musica.titulo}</strong>
      </div>
    </td>
    <td>${musica.artista}</td>
    <td>
      <button class="btn-tb btn-tb-play">▶ Tocar</button>
      <button class="btn-tb btn-tb-edit">Editar</button>
      <button class="btn-tb btn-tb-del">Eliminar</button>
    </td>
  `;

  // Tocar Música
  tr.querySelector(".btn-tb-play")?.addEventListener("click", () => {
    if (meuPlayer) {
      meuPlayer.src = musica.audio;
      meuPlayer.load();
      meuPlayer.play().catch(() => alert("Não foi possível reproduzir este áudio. Verifique o link do ficheiro."));
    }
    if (playerCapa) playerCapa.src = musica.imagem;
    if (playerTitulo) playerTitulo.textContent = musica.titulo;
    if (playerArtista) playerArtista.textContent = musica.artista;

    atualizarMediaSession(musica);
  });

  // Editar Música
  tr.querySelector(".btn-tb-edit")?.addEventListener("click", () => {
    if (inputId) inputId.value = id;
    if (inputTitulo) inputTitulo.value = musica.titulo;
    if (inputArtista) inputArtista.value = musica.artista;
    if (inputImagem) inputImagem.value = musica.imagem;
    if (inputAudio) inputAudio.value = musica.audio;

    if (tituloForm) tituloForm.textContent = "Editar Música";
    if (btnSalvar) btnSalvar.textContent = "Atualizar";
    abrirModal();
  });

  // Eliminar Música
  tr.querySelector(".btn-tb-del")?.addEventListener("click", async () => {
    if (confirm(`Tem a certeza que deseja eliminar "${musica.titulo}"?`)) {
      await remove(ref(db, "musicas/" + id));
    }
  });

  tabelaCorpo.appendChild(tr);
}

// Submissão do Formulário
if (formulario) {
  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idAtual = inputId ? inputId.value : "";
    const dadosMusica = {
      titulo: inputTitulo.value.trim(),
      artista: inputArtista.value.trim(),
      imagem: inputImagem.value.trim(),
      audio: inputAudio.value.trim()
    };

    if (idAtual === "") {
      await push(refMusicas, dadosMusica);
    } else {
      await update(ref(db, "musicas/" + idAtual), dadosMusica);
    }

    fecharModal();
  });
}

function limparFormulario() {
  if (formulario) formulario.reset();
  if (inputId) inputId.value = "";
  if (tituloForm) tituloForm.textContent = "🎨 Painel do Criador - Adicionar Música";
  if (btnSalvar) btnSalvar.textContent = "Salvar Música";
}

// --- PROMPT DE INSTALAÇÃO PWA ---
let deferredPrompt;
const btnInstalar = document.getElementById("btn-instalar-app");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (btnInstalar) {
    btnInstalar.style.display = "inline-block";
  }
});

if (btnInstalar) {
  btnInstalar.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Instalação do utilizador: ${outcome}`);
      deferredPrompt = null;
      btnInstalar.style.display = "none";
    }
  });
}

// --- REGISTO DO SERVICE WORKER ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then((reg) => console.log("Service Worker registado com sucesso:", reg.scope))
      .catch((err) => console.error("Erro ao registar Service Worker:", err));
  });
}