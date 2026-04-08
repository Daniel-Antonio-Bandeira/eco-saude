const API = 'http://localhost:3000';

// ── Autenticação ─────────────────────────────────────────────────────────────
const token   = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
const isAdmin = usuario && usuario.perfil === 'admin';

function getHeaders() {
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

// ── Barra do usuário ─────────────────────────────────────────────────────────
function renderizarUsuarioBar() {
  const nav = document.querySelector('.nav-bar');
  if (!nav) return;

  const div = document.createElement('div');
  div.className = 'user-bar';

  if (usuario) {
    div.innerHTML =
      '<span class="user-nome">' + (isAdmin ? '🔑 ' : '👤 ') + usuario.nome + '</span>' +
      '<button class="btn-sair" onclick="sair()">Sair</button>';
  } else {
    div.innerHTML = '<a href="login.html" class="btn-login-nav">🔐 Entrar</a>';
  }

  nav.appendChild(div);
}

function sair() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

// ── Mapa (Leaflet) ───────────────────────────────────────────────────────────
const mapa = L.map('mapa').setView([-15.8, -47.9], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
  maxZoom: 18
}).addTo(mapa);

const iconeVerde = L.divIcon({
  html: '<div style="background:#2d6a4f;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',
  className: '', iconSize: [14, 14], iconAnchor: [7, 7],
});

const iconeAzul = L.divIcon({
  html: '<div style="background:#3498db;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',
  className: '', iconSize: [16, 16], iconAnchor: [8, 8],
});

let marcadorAtual = null;

// ── Upload de foto ───────────────────────────────────────────────────────────
const uploadArea  = document.getElementById('uploadArea');
const inputFoto   = document.getElementById('foto');
const preview     = document.getElementById('previewFoto');
const placeholder = document.getElementById('uploadPlaceholder');

uploadArea.addEventListener('click', () => inputFoto.click());
uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = '#52b788'; });
uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = '#b7d9c2'; });
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = '#b7d9c2';
  const arquivo = e.dataTransfer.files[0];
  if (arquivo) { inputFoto.files = e.dataTransfer.files; mostrarPreview(arquivo); }
});
inputFoto.addEventListener('change', () => { if (inputFoto.files[0]) mostrarPreview(inputFoto.files[0]); });

function mostrarPreview(arquivo) {
  const reader = new FileReader();
  reader.onload = (e) => { preview.src = e.target.result; preview.hidden = false; placeholder.style.display = 'none'; };
  reader.readAsDataURL(arquivo);
}

// ── Localização GPS ──────────────────────────────────────────────────────────
document.getElementById('btnLocalizacao').addEventListener('click', () => {
  const hint = document.getElementById('locHint');
  if (!navigator.geolocation) { hint.textContent = 'Geolocalização não suportada.'; return; }
  hint.textContent = 'Obtendo localização...';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6);
      document.getElementById('latitude').value  = lat;
      document.getElementById('longitude').value = lng;
      hint.textContent = 'Localização capturada: ' + lat + ', ' + lng;
      if (marcadorAtual) mapa.removeLayer(marcadorAtual);
      marcadorAtual = L.marker([lat, lng], { icon: iconeAzul }).addTo(mapa).bindPopup('Sua localização').openPopup();
      mapa.setView([lat, lng], 15);
    },
    () => { hint.textContent = 'Não foi possível obter a localização.'; }
  );
});

// ── Formulário ───────────────────────────────────────────────────────────────
const form      = document.getElementById('formDenuncia');
const btnEnviar = document.getElementById('btnEnviar');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  btnEnviar.disabled = true;
  btnEnviar.textContent = 'Enviando...';

  const formData = new FormData();
  formData.append('tipo',      document.getElementById('tipo').value);
  formData.append('descricao', document.getElementById('descricao').value);
  formData.append('latitude',  document.getElementById('latitude').value);
  formData.append('longitude', document.getElementById('longitude').value);
  if (inputFoto.files[0]) formData.append('foto', inputFoto.files[0]);

  try {
    const response = await fetch(API + '/denuncias', { method: 'POST', body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro desconhecido');

    mostrarToast('Denúncia enviada com sucesso!');
    form.reset();
    preview.hidden = true;
    placeholder.style.display = '';
    document.getElementById('locHint').textContent = 'A localização será marcada no mapa.';
    await carregarDenuncias();

  } catch (error) {
    mostrarToast('Erro ao enviar denúncia', true);
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.textContent = 'Enviar denúncia';
  }
});

// ── Carregar denúncias ───────────────────────────────────────────────────────
async function carregarDenuncias() {
  try {
    const response = await fetch(API + '/denuncias');
    const dados    = await response.json();
    renderizarLista(dados);
    renderizarMapa(dados);
  } catch (error) {
    console.error('Erro ao carregar denúncias:', error);
  }
}

// ── Renderizar lista ─────────────────────────────────────────────────────────
function renderizarLista(dados) {
  const lista = document.getElementById('listaDenuncias');
  lista.innerHTML = '';

  if (dados.length === 0) {
    lista.innerHTML = '<p style="color:#92b4a0;text-align:center;padding:20px">Nenhuma denúncia registrada ainda.</p>';
    return;
  }

  dados.forEach(d => {
    const card = document.createElement('div');
    card.classList.add('denuncia-card');

    const data = d.data_criacao
      ? new Date(d.data_criacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';

    const fotoHTML = d.foto
      ? '<img class="denuncia-foto" src="' + API + '/uploads/' + d.foto + '" alt="Foto" loading="lazy" />'
      : '';

    const locHTML = (d.latitude && d.longitude)
      ? '<span>' + parseFloat(d.latitude).toFixed(4) + ', ' + parseFloat(d.longitude).toFixed(4) + '</span>'
      : '';

    const statusAtual = d.status || 'Pendente';
    const statusClasses = { 'Pendente': 'status-pendente', 'Em análise': 'status-analise', 'Resolvida': 'status-resolvida' };
    const statusClass = statusClasses[statusAtual] || 'status-pendente';

    // Controles de admin
    const acoesAdmin = isAdmin
      ? '<div class="acoes">' +
          '<select class="select-status" onchange="atualizarStatus(' + d.id + ', this.value)">' +
            '<option value="Pendente"   ' + (statusAtual === 'Pendente'   ? 'selected' : '') + '>Pendente</option>' +
            '<option value="Em análise" ' + (statusAtual === 'Em análise' ? 'selected' : '') + '>Em análise</option>' +
            '<option value="Resolvida"  ' + (statusAtual === 'Resolvida'  ? 'selected' : '') + '>Resolvida</option>' +
          '</select>' +
          '<button class="btn-excluir" onclick="excluirDenuncia(' + d.id + ')">Excluir</button>' +
        '</div>'
      : '';

    card.innerHTML =
      fotoHTML +
      '<div class="denuncia-body">' +
        '<div class="denuncia-header">' +
          '<span class="denuncia-tipo">' + d.tipo + '</span>' +
          '<span class="status-badge ' + statusClass + '">' + statusAtual + '</span>' +
        '</div>' +
        '<p class="denuncia-descricao">' + d.descricao + '</p>' +
        '<div class="denuncia-meta">' +
          (data ? '<span>' + data + '</span>' : '') +
          locHTML +
        '</div>' +
        acoesAdmin +
      '</div>';

    lista.appendChild(card);
  });
}

// ── Renderizar mapa ──────────────────────────────────────────────────────────
function renderizarMapa(dados) {
  mapa.eachLayer(layer => {
    if (layer instanceof L.Marker && layer !== marcadorAtual) mapa.removeLayer(layer);
  });

  dados.forEach(d => {
    if (!d.latitude || !d.longitude) return;
    L.marker([d.latitude, d.longitude], { icon: iconeVerde })
      .addTo(mapa)
      .bindPopup('<strong>' + d.tipo + '</strong><br><small>' + d.descricao.substring(0, 80) + '</small><br><span style="font-size:.75rem;color:#666">' + (d.status || 'Pendente') + '</span>');
  });
}

// ── Atualizar status (admin) ─────────────────────────────────────────────────
async function atualizarStatus(id, status) {
  try {
    const response = await fetch(API + '/denuncias/' + id + '/status', {
      method: 'PATCH',
      headers: Object.assign({ 'Content-Type': 'application/json' }, getHeaders()),
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    mostrarToast('Status atualizado para "' + status + '"');
    await carregarDenuncias();
  } catch (error) {
    mostrarToast('Erro ao atualizar status', true);
  }
}

// ── Excluir (admin) ──────────────────────────────────────────────────────────
async function excluirDenuncia(id) {
  if (!confirm('Tem certeza que deseja excluir esta denúncia?')) return;
  try {
    const response = await fetch(API + '/denuncias/' + id, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    mostrarToast('Denúncia excluída!');
    await carregarDenuncias();
  } catch (error) {
    mostrarToast('Erro ao excluir denúncia', true);
  }
}

// ── Toast ────────────────────────────────────────────────────────────────────
function mostrarToast(msg, erro = false) {
  const toast = document.createElement('div');
  toast.className = 'toast' + (erro ? ' erro' : '');
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500);
}

// ── Init ─────────────────────────────────────────────────────────────────────
renderizarUsuarioBar();
carregarDenuncias();
