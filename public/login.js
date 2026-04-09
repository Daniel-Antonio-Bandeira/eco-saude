const API = 'https://eco-saude.onrender.com';

function mostrarAba(aba) {
  document.getElementById('formLogin').style.display    = aba === 'entrar' ? 'block' : 'none';
  document.getElementById('formRegistro').style.display = aba === 'criar'  ? 'block' : 'none';
  document.getElementById('abaEntrar').classList.toggle('ativa', aba === 'entrar');
  document.getElementById('abaCriar').classList.toggle('ativa',  aba === 'criar');
}

// ── Login ────────────────────────────────────────────────────────────────────
document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const erro = document.getElementById('erroLogin');
  erro.textContent = '';

  const email = document.getElementById('loginEmail').value;
  const senha  = document.getElementById('loginSenha').value;

  try {
    const response = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (!response.ok) { erro.textContent = data.error; return; }

    // Salva token e dados do usuário
    localStorage.setItem('token',   data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));

    // Redireciona conforme perfil
    window.location.href = 'index.html';

  } catch {
    erro.textContent = 'Erro ao conectar com o servidor.';
  }
});

// ── Registro ─────────────────────────────────────────────────────────────────
document.getElementById('formRegistro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const erro = document.getElementById('erroRegistro');
  erro.textContent = '';

  const nome  = document.getElementById('regNome').value;
  const email = document.getElementById('regEmail').value;
  const senha = document.getElementById('regSenha').value;

  try {
    const response = await fetch(API + '/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await response.json();

    if (!response.ok) { erro.textContent = data.error; return; }

    alert('Conta criada! Faça login para continuar.');
    mostrarAba('entrar');

  } catch {
    erro.textContent = 'Erro ao conectar com o servidor.';
  }
});
