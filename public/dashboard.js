const API = 'http://localhost:3000/denuncias';

const CORES_TIPO = [
  '#2d6a4f', '#52b788', '#95d5b2', '#f4a261',
  '#e76f51', '#264653', '#2a9d8f', '#e9c46a'
];

const CORES_STATUS = {
  'Pendente':   '#f0ad00',
  'Em análise': '#3498db',
  'Resolvida':  '#27ae60'
};

async function carregarDados() {
  try {
    const response = await fetch(API);
    const dados = await response.json();
    renderizarResumo(dados);
    renderizarGraficoPorTipo(dados);
    renderizarGraficoStatus(dados);
    renderizarGraficoPorMes(dados);
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
}

// ── Cards de resumo ──────────────────────────────────────────────────────────
function renderizarResumo(dados) {
  document.getElementById('totalDenuncias').textContent = dados.length;
  document.getElementById('totalPendente').textContent  = dados.filter(d => (d.status || 'Pendente') === 'Pendente').length;
  document.getElementById('totalAnalise').textContent   = dados.filter(d => d.status === 'Em análise').length;
  document.getElementById('totalResolvida').textContent = dados.filter(d => d.status === 'Resolvida').length;
}

// ── Gráfico por tipo (barra horizontal) ─────────────────────────────────────
function renderizarGraficoPorTipo(dados) {
  const contagem = {};
  dados.forEach(d => {
    contagem[d.tipo] = (contagem[d.tipo] || 0) + 1;
  });

  const labels = Object.keys(contagem);
  const valores = Object.values(contagem);

  new Chart(document.getElementById('graficoPorTipo'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Quantidade',
        data: valores,
        backgroundColor: CORES_TIPO.slice(0, labels.length),
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: '#f0f0f0' }
        },
        y: {
          grid: { display: false }
        }
      }
    }
  });
}

// ── Gráfico de status (rosca) ────────────────────────────────────────────────
function renderizarGraficoStatus(dados) {
  const contagem = { 'Pendente': 0, 'Em análise': 0, 'Resolvida': 0 };
  dados.forEach(d => {
    const s = d.status || 'Pendente';
    if (contagem[s] !== undefined) contagem[s]++;
  });

  const labels = Object.keys(contagem);
  const valores = Object.values(contagem);

  new Chart(document.getElementById('graficoStatus'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: labels.map(l => CORES_STATUS[l]),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { family: 'DM Sans' }, padding: 16 }
        }
      },
      cutout: '65%'
    }
  });
}

// ── Gráfico por mês (linha) ──────────────────────────────────────────────────
function renderizarGraficoPorMes(dados) {
  const contagem = {};

  dados.forEach(d => {
    if (!d.data_criacao) return;
    const date = new Date(d.data_criacao);
    const chave = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    contagem[chave] = (contagem[chave] || 0) + 1;
  });

  // Ordena por data
  const labels = Object.keys(contagem);
  const valores = labels.map(l => contagem[l]);

  new Chart(document.getElementById('graficoPorMes'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Denúncias',
        data: valores,
        borderColor: '#2d6a4f',
        backgroundColor: 'rgba(45,106,79,.1)',
        borderWidth: 2.5,
        pointBackgroundColor: '#2d6a4f',
        pointRadius: 5,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: '#f0f0f0' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

// ── Init ─────────────────────────────────────────────────────────────────────
carregarDados();
