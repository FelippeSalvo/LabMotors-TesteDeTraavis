// Configuração da API
var API_BASE_URL = 'https://labmotors-testedetraavis.onrender.com/api';

// Mapeamento de status
const STATUS_MAP = {
  'Aguardando': 'waiting',
  'Em Andamento': 'progress',
  'Concluído': 'done'
};

const STATUS_REVERSE_MAP = {
  'waiting': 'Aguardando',
  'progress': 'Em Andamento',
  'done': 'Concluído'
};

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  loadKanban();
  setupDragAndDrop();
  
  // Atualizar a cada 30 segundos
  setInterval(loadKanban, 30000);
});

// ========== FUNÇÕES DE API ==========

/**
 * Carrega todas as ordens de serviço e renderiza no Kanban
 */
async function loadKanban() {
  try {
    console.log('🔄 Carregando Kanban de:', `${API_BASE_URL}/OrdemServico`);
    const response = await fetch(`${API_BASE_URL}/OrdemServico`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao carregar ordens:', response.status, errorText);
      throw new Error(`Erro ao carregar ordens: ${response.status}`);
    }
    
    const ordens = await response.json();
    console.log('✅ Ordens carregadas:', ordens.length, 'ordens');
    console.log('📋 Dados das ordens:', ordens);
    renderKanban(ordens);
  } catch (error) {
    console.error('❌ Erro ao carregar Kanban:', error);
    // Mostrar mensagem de erro na interface
    const waiting = document.getElementById('waiting');
    if (waiting) {
      waiting.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Erro ao carregar serviços. Verifique se a API está rodando.</div>';
    }
  }
}

/**
 * Altera o status de uma ordem de serviço
 */
async function alterarStatus(id, novoStatus) {
  try {
    const response = await fetch(`${API_BASE_URL}/OrdemServico/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: novoStatus })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ao alterar status: ${response.status}`);
    }

    // Recarregar Kanban após alteração
    await loadKanban();
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    alert('Erro ao alterar status: ' + error.message);
  }
}

// ========== FUNÇÕES DE RENDERIZAÇÃO ==========

/**
 * Renderiza as ordens no Kanban
 */
function renderKanban(ordens) {
  console.log('🎨 Renderizando Kanban com', ordens?.length || 0, 'ordens');
  
  // Limpar colunas
  document.getElementById('waiting').innerHTML = '';
  document.getElementById('progress').innerHTML = '';
  document.getElementById('done').innerHTML = '';

  if (!ordens || ordens.length === 0) {
    console.log('ℹ️ Nenhuma ordem para exibir');
    document.getElementById('waiting').innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Nenhum serviço cadastrado</div>';
    return;
  }

  // Agrupar por status
  ordens.forEach(ordem => {
    // Normalizar propriedades (API envia em camelCase por padrão)
    const servico = ordem.servico || ordem.Servico;
    const status = ordem.status || ordem.Status || 'Aguardando';

    console.log('🔍 Processando ordem:', { id: ordem.id || ordem.Id, servicoId: ordem.servicoId || ordem.ServicoId, status, servico });
    
    if (!servico) {
      console.warn('⚠️ Ordem sem Servico relacionado:', ordem);
      // Ainda assim, tentar renderizar com dados básicos da ordem
      const statusKey = STATUS_MAP[status] || 'waiting';
      const card = createCardFallback(ordem, status);
      document.getElementById(statusKey).appendChild(card);
      return;
    }
    
    const statusKey = STATUS_MAP[status] || 'waiting';
    console.log(`📋 Adicionando ordem ${ordem.id || ordem.Id} (${status}) na coluna ${statusKey}`);
    const card = createCard(ordem, servico, status);
    document.getElementById(statusKey).appendChild(card);
  });
  
  console.log('✅ Kanban renderizado com sucesso');
}

/**
 * Cria um card do Kanban
 */
function createCard(ordem, servico, status) {
  // Normalizar dados
  const ordemId = ordem.id || ordem.Id;
  const ordemStatus = status || ordem.status || ordem.Status || 'Aguardando';
  const s = servico || {};

  const card = document.createElement("div");
  card.className = "kanban-item";
  card.draggable = true;
  card.dataset.id = ordemId;
  card.dataset.status = ordemStatus;

  // Determinar botões baseado no status
  let actionButtons = '';
  if (ordemStatus === 'Aguardando') {
    actionButtons = `
      <button class="card-btn card-btn-primary" onclick="alterarStatus(${ordemId}, 'Em Andamento')">
        Iniciar
      </button>
    `;
  } else if (ordemStatus === 'Em Andamento') {
    actionButtons = `
      <button class="card-btn card-btn-success" onclick="alterarStatus(${ordemId}, 'Concluído')">
        Concluir
      </button>
    `;
  }

  card.innerHTML = `
    <strong>Cliente:</strong> ${escapeHtml(s.cliente || s.Cliente || 'N/A')}<br>
    <strong>Serviço:</strong> ${escapeHtml(s.tipoServico || s.TipoServico || s.descricao || s.Descricao || 'N/A')}<br>
    ${(s.placa || s.Placa) ? `<strong>Placa:</strong> ${escapeHtml(s.placa || s.Placa)}<br>` : ''}
    ${actionButtons ? `<div style="margin-top: 10px;">${actionButtons}</div>` : ''}
  `;

  // Detalhes ao clicar (evitar conflito com botões)
  card.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    abrirDetalhesOrdem(ordem, servico, ordemStatus);
  });

  // Adicionar evento de drag
  card.addEventListener("dragstart", dragStart);
  
  return card;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Cria um card fallback quando o Servico não está disponível
 */
function createCardFallback(ordem, status) {
  const ordemId = ordem.id || ordem.Id;
  const ordemStatus = status || ordem.status || ordem.Status || 'Aguardando';

  const card = document.createElement("div");
  card.className = "kanban-item";
  card.draggable = true;
  card.dataset.id = ordemId;
  card.dataset.status = ordemStatus;

  let actionButtons = '';
  if (ordemStatus === 'Aguardando') {
    actionButtons = `
      <button class="card-btn card-btn-primary" onclick="alterarStatus(${ordemId}, 'Em Andamento')">
        Iniciar
      </button>
    `;
  } else if (ordemStatus === 'Em Andamento') {
    actionButtons = `
      <button class="card-btn card-btn-success" onclick="alterarStatus(${ordemId}, 'Concluído')">
        Concluir
      </button>
    `;
  }

  card.innerHTML = `
    <strong>Ordem ID:</strong> ${ordemId}<br>
    <strong>Status:</strong> ${escapeHtml(ordemStatus)}<br>
    <em style="color: #999;">Carregando dados do serviço...</em><br>
    ${actionButtons ? `<div style="margin-top: 10px;">${actionButtons}</div>` : ''}
  `;

  card.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    abrirDetalhesOrdem(ordem, null, ordemStatus);
  });

  card.addEventListener("dragstart", dragStart);
  return card;
}

// ========== DRAG AND DROP ==========

function dragStart(e) {
  e.dataTransfer.setData("id", e.target.dataset.id);
}

function dragOver(e) {
  e.preventDefault();
}

async function drop(e) {
  e.preventDefault();
  const id = parseInt(e.dataTransfer.getData("id"));
  const columnStatus = e.currentTarget.parentElement.dataset.status;
  const novoStatus = STATUS_REVERSE_MAP[columnStatus];
  
  if (novoStatus) {
    await alterarStatus(id, novoStatus);
  }
}

// Configurar drag and drop nas colunas
document.querySelectorAll(".kanban-items").forEach(col => {
  col.addEventListener("dragover", dragOver);
  col.addEventListener("drop", drop);
});

// Tornar função global para uso em onclick
window.alterarStatus = alterarStatus;

// ========== DETALHES DA ORDEM ==========

function abrirDetalhesOrdem(ordem, servico, status) {
  const ordemId = ordem.id || ordem.Id;
  const ordemStatus = status || ordem.status || ordem.Status || 'Aguardando';
  const s = servico || {};

  // Criar overlay
  const overlay = document.createElement("div");
  overlay.className = "order-detail-overlay";
  overlay.innerHTML = `
    <div class="order-detail-modal">
      <div class="order-detail-header">
        <h3>Detalhes do Serviço</h3>
        <button class="order-detail-close">&times;</button>
      </div>
      <div class="order-detail-body">
        <p><strong>Ordem:</strong> #${ordemId}</p>
        <p><strong>Status:</strong> ${escapeHtml(ordemStatus)}</p>
        <hr />
        <p><strong>Cliente:</strong> ${escapeHtml(s.cliente || s.Cliente || 'N/A')}</p>
        <p><strong>Placa:</strong> ${escapeHtml(s.placa || s.Placa || 'N/A')}</p>
        <p><strong>Serviço:</strong> ${escapeHtml(s.tipoServico || s.TipoServico || s.descricao || s.Descricao || 'N/A')}</p>
        ${(s.telefone || s.Telefone) ? `<p><strong>Telefone:</strong> ${escapeHtml(s.telefone || s.Telefone)}</p>` : ''}
        ${(s.data || s.Data) ? `<p><strong>Data:</strong> ${escapeHtml(s.data || s.Data)}</p>` : ''}
        ${(s.horario || s.Horario) ? `<p><strong>Horário:</strong> ${escapeHtml(s.horario || s.Horario)}</p>` : ''}
        ${(s.observacoes || s.Observacoes) ? `<p><strong>Observações:</strong> ${escapeHtml(s.observacoes || s.Observacoes)}</p>` : ''}
      </div>
      <div class="order-detail-actions">
        <button class="order-detail-delete">Excluir serviço</button>
        <button class="order-detail-cancel">Fechar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const fechar = () => {
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.querySelector(".order-detail-close").onclick = fechar;
  overlay.querySelector(".order-detail-cancel").onclick = fechar;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) fechar();
  });

  const deleteBtn = overlay.querySelector(".order-detail-delete");
  deleteBtn.onclick = async () => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/OrdemServico/${ordemId}`, {
        method: "DELETE"
      });
      if (!resp.ok && resp.status !== 204) {
        throw new Error("Erro ao excluir serviço");
      }
      await loadKanban();
      fechar();
    } catch (err) {
      console.error("Erro ao excluir serviço:", err);
      alert("Erro ao excluir serviço: " + err.message);
    }
  };

  setTimeout(() => overlay.classList.add("show"), 10);
}
