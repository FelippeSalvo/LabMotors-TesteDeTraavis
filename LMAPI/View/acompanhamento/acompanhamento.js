// Configuração da API
var API_BASE_URL = window.API_BASE_URL || 'http://localhost:5284/api';

// Mapeamento de status
const STATUS_CONFIG = {
  'Aguardando': {
    icone: '⏳',
    texto: 'Aguardando início do serviço'
  },
  'Em Andamento': {
    icone: '🔧',
    texto: 'Serviço em andamento'
  },
  'Concluído': {
    icone: '✅',
    texto: 'Serviço concluído'
  }
};

let intervaloAtualizacao = null;
let placaOuIdAtual = null;

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  // Criar campo de busca se não existir
  criarCampoBusca();
  
  // Verificar se há placa/ID na URL
  const urlParams = new URLSearchParams(window.location.search);
  const placaFromUrl = urlParams.get('placa') || urlParams.get('id');
  if (placaFromUrl) {
    document.getElementById('buscaInput')?.setAttribute('value', placaFromUrl);
    acompanharServico(placaFromUrl);
  }
});

/**
 * Cria campo de busca se não existir no HTML
 */
function criarCampoBusca() {
  const statusSection = document.querySelector('.status-servico');
  if (!statusSection) return;

  // Verificar se já existe campo de busca
  if (document.getElementById('buscaInput')) return;

  const buscaContainer = document.createElement('div');
  buscaContainer.style.cssText = 'margin: 20px auto; max-width: 500px; padding: 20px;';
  buscaContainer.innerHTML = `
    <h3 style="margin-bottom: 15px; text-align: center;">Buscar Serviço</h3>
    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
      <input 
        type="text" 
        id="buscaInput" 
        placeholder="Digite a placa (ex: ABC-1234) ou ID da ordem"
        style="flex: 1; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;"
      />
      <button 
        id="buscarBtn" 
        style="padding: 12px 24px; background: #d62828; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;"
      >
        Buscar
      </button>
    </div>
    <p style="text-align: center; color: #666; font-size: 14px;">
      Digite a placa da moto ou o número da ordem de serviço
    </p>
  `;

  statusSection.parentNode.insertBefore(buscaContainer, statusSection);

  // Adicionar eventos
  const buscarBtn = document.getElementById('buscarBtn');
  const buscaInput = document.getElementById('buscaInput');

  if (buscarBtn && buscaInput) {
    buscarBtn.addEventListener('click', () => {
      const valor = buscaInput.value.trim();
      if (valor) {
        acompanharServico(valor);
      } else {
        alert('Digite uma placa ou ID para buscar');
      }
    });

    buscaInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const valor = buscaInput.value.trim();
        if (valor) {
          acompanharServico(valor);
        }
      }
    });
  }
}

/**
 * Busca e exibe o serviço por placa ou ID
 */
async function acompanharServico(placaOuId) {
  try {
    if (!placaOuId) {
      hideServicoInfo();
      return;
    }

    placaOuIdAtual = placaOuId;

    // Tentar buscar por ID primeiro (se for número)
    let ordem = null;
    if (/^\d+$/.test(placaOuId)) {
      try {
        const response = await fetch(`${API_BASE_URL}/OrdemServico/${placaOuId}`);
        if (response.ok) {
          ordem = await response.json();
        }
      } catch (e) {
        // Continuar para buscar por placa
      }
    }

    // Se não encontrou por ID, buscar por placa
    if (!ordem) {
      const response = await fetch(`${API_BASE_URL}/OrdemServico/placa/${encodeURIComponent(placaOuId)}`);
      if (!response.ok) {
        if (response.status === 404) {
          hideServicoInfo();
          mostrarMensagem('Nenhum serviço encontrado para esta placa ou ID', 'error');
          return;
        }
        throw new Error(`Erro ao buscar serviço: ${response.status}`);
      }
      ordem = await response.json();
    }

    if (!ordem || !(ordem.servico || ordem.Servico)) {
      hideServicoInfo();
      mostrarMensagem('Serviço não encontrado', 'error');
      return;
    }

    exibirServico(ordem);
    iniciarAtualizacaoAutomatica(placaOuId);
    
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    mostrarMensagem('Erro ao buscar serviço. Tente novamente.', 'error');
    hideServicoInfo();
  }
}

/**
 * Exibe as informações do serviço
 */
function exibirServico(ordem) {
  // Normalizar propriedades (API usa camelCase)
  const servico = ordem.servico || ordem.Servico;
  const status = ordem.status || ordem.Status || 'Aguardando';
  const ordemId = ordem.id || ordem.Id;
  const statusSection = document.querySelector('.status-servico');
  const relatorioSection = document.querySelector('.relatorio-servico');
  const statusBtn = document.getElementById('statusBtn');
  const statusIcon = document.getElementById('statusIcon');
  const relatorioTexto = document.getElementById('relatorioTexto');

  if (!statusSection || !relatorioSection || !statusBtn || !statusIcon || !relatorioTexto) {
    return;
  }

  // Configurar status
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG['Aguardando'];
  
  statusBtn.textContent = status;
  statusBtn.dataset.status = status;
  statusIcon.textContent = statusConfig.icone;

  // Normalizar propriedades do serviço (pode vir em camelCase ou PascalCase)
  const cliente = servico.Cliente || servico.cliente || 'N/A';
  const moto = servico.Moto || servico.moto || 'N/A';
  const placa = servico.Placa || servico.placa || '';
  const tipoServico = servico.TipoServico || servico.tipoServico || servico.Descricao || servico.descricao || 'N/A';
  const telefone = servico.Telefone || servico.telefone || '';
  const data = servico.Data || servico.data || '';
  const horario = servico.Horario || servico.horario || '';
  const observacoes = servico.Observacoes || servico.observacoes || '';

  // Montar relatório detalhado
  let relatorioHTML = `
    <div style="text-align: left; line-height: 1.8;">
      <p><strong>👤 Cliente:</strong> ${escapeHtml(cliente)}</p>
      <p><strong>🛵 Moto:</strong> ${escapeHtml(moto)}</p>
      ${placa ? `<p><strong>🔢 Placa:</strong> ${escapeHtml(placa)}</p>` : ''}
      <p><strong>🔧 Tipo de Serviço:</strong> ${escapeHtml(tipoServico)}</p>
      ${telefone ? `<p><strong>📞 Telefone:</strong> ${escapeHtml(telefone)}</p>` : ''}
      ${data ? `<p><strong>📅 Data:</strong> ${formatDate(data)}</p>` : ''}
      ${horario ? `<p><strong>⏰ Horário:</strong> ${escapeHtml(horario)}</p>` : ''}
      ${observacoes ? `<p><strong>📝 Observações:</strong> ${escapeHtml(observacoes)}</p>` : ''}
      <p><strong>📊 Status Atual:</strong> <span style="background: #d62828; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px;">${statusConfig.icone} ${status}</span></p>
      <p><strong>🆔 Número da Ordem:</strong> #${ordemId}</p>
    </div>
  `;

  relatorioTexto.innerHTML = relatorioHTML;

  // Exibir seções
  statusSection.style.display = 'block';
  relatorioSection.style.display = 'block';
}

/**
 * Oculta as informações do serviço
 */
function hideServicoInfo() {
  const statusSection = document.querySelector('.status-servico');
  const relatorioSection = document.querySelector('.relatorio-servico');
  const relatorioTexto = document.getElementById('relatorioTexto');
  
  if (relatorioTexto) {
    relatorioTexto.innerHTML = '<p style="text-align: center; color: #999;">Nenhum serviço encontrado</p>';
  }
  
  // Parar atualização automática
  pararAtualizacaoAutomatica();
  placaOuIdAtual = null;
}

/**
 * Inicia atualização automática do serviço
 */
function iniciarAtualizacaoAutomatica(placaOuId) {
  // Parar atualização anterior se existir
  pararAtualizacaoAutomatica();
  
  // Atualizar a cada 10 segundos
  intervaloAtualizacao = setInterval(() => {
    acompanharServico(placaOuId);
  }, 10000);
}

/**
 * Para a atualização automática
 */
function pararAtualizacaoAutomatica() {
  if (intervaloAtualizacao) {
    clearInterval(intervaloAtualizacao);
    intervaloAtualizacao = null;
  }
}

// ========== FUNÇÕES AUXILIARES ==========

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

function mostrarMensagem(message, type = 'info') {
  // Usar sistema de notificações existente se disponível
  if (window.mostrarNotificacao) {
    window.mostrarNotificacao(message, type);
  } else if (window.showError && type === 'error') {
    window.showError(message);
  } else {
    alert(message);
  }
}

// Limpar intervalo ao sair da página
window.addEventListener('beforeunload', () => {
  pararAtualizacaoAutomatica();
});

