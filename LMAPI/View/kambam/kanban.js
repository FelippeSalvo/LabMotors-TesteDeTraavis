// Configuração da API
var API_BASE_URL = 'http://localhost:5284/api';

// ========== SISTEMA DE NOTIFICAÇÕES ==========
function showNotification(message, type = 'info', duration = 4000) {
  const container = document.getElementById('notification-container') || createNotificationContainer();
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${escapeHtml(message)}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  container.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Fechar ao clicar no X
  notification.querySelector('.notification-close').onclick = () => {
    closeNotification(notification);
  };
  
  // Auto-fechar após duração
  if (duration > 0) {
    setTimeout(() => closeNotification(notification), duration);
  }
  
  return notification;
}

function createNotificationContainer() {
  const container = document.createElement('div');
  container.id = 'notification-container';
  document.body.appendChild(container);
  return container;
}

function closeNotification(notification) {
  notification.classList.remove('show');
  setTimeout(() => notification.remove(), 300);
}

function getNotificationIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type] || icons.info;
}

function showConfirm(message, onConfirm, onCancel = null) {
  const container = document.getElementById('notification-container') || createNotificationContainer();
  
  const notification = document.createElement('div');
  notification.className = 'notification notification-confirm';
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${escapeHtml(message)}</span>
      <div class="notification-actions">
        <button class="notification-btn notification-btn-confirm">Confirmar</button>
        <button class="notification-btn notification-btn-cancel">Cancelar</button>
      </div>
    </div>
  `;
  
  container.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 10);
  
  notification.querySelector('.notification-btn-confirm').onclick = () => {
    closeNotification(notification);
    if (onConfirm) onConfirm();
  };
  
  notification.querySelector('.notification-btn-cancel').onclick = () => {
    closeNotification(notification);
    if (onCancel) onCancel();
  };
  
  return notification;
}

// Mapeamento de status
const STATUS_MAP = {
  'Aguardando': 'waiting',
  'Em Andamento': 'progress',
  'Pronto para Contato': 'ready',
  'Concluído': 'done'
};

const STATUS_REVERSE_MAP = {
  'waiting': 'Aguardando',
  'progress': 'Em Andamento',
  'ready': 'Pronto para Contato',
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
    showNotification('Status alterado com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    showNotification('Erro ao alterar status: ' + error.message, 'error');
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
  document.getElementById('ready').innerHTML = '';
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
      <button class="card-btn card-btn-primary" onclick="alterarStatus(${ordemId}, 'Pronto para Contato')">
        Pronto para Contato
      </button>
    `;
  } else if (ordemStatus === 'Pronto para Contato') {
    actionButtons = `
      <button class="card-btn card-btn-primary" onclick="alterarStatus(${ordemId}, 'Em Andamento')">
        Em Andamento
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
    // Se estiver em "Concluído", abrir tela de finalização
    if (ordemStatus === 'Concluído') {
      abrirFinalizacaoServico(ordem, servico);
    } else {
      abrirDetalhesOrdem(ordem, servico, ordemStatus);
    }
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
      <button class="card-btn card-btn-primary" onclick="alterarStatus(${ordemId}, 'Pronto para Contato')">
        Pronto para Contato
      </button>
    `;
  } else if (ordemStatus === 'Pronto para Contato') {
    actionButtons = `
      <button class="card-btn card-btn-primary" onclick="alterarStatus(${ordemId}, 'Em Andamento')">
        Em Andamento
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
    // Se estiver em "Concluído", abrir tela de finalização
    if (ordemStatus === 'Concluído') {
      abrirFinalizacaoServico(ordem, null);
    } else {
      abrirDetalhesOrdem(ordem, null, ordemStatus);
    }
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
  
  if (!novoStatus) return;

  // Encontrar o card que foi arrastado
  const draggedCard = document.querySelector(`[data-id="${id}"]`);
  if (!draggedCard) return;

  // Guardar dados do card antes de mover (para reverter se necessário)
  const oldStatus = draggedCard.dataset.status;
  const oldColumn = draggedCard.closest('.kanban-items');
  const newColumn = e.currentTarget;
  
  // Atualização otimista: mover o card imediatamente
  draggedCard.remove();
  newColumn.appendChild(draggedCard);
  
  // Atualizar o status do card
  draggedCard.dataset.status = novoStatus;
  
  // Atualizar o conteúdo do card (botões) baseado no novo status
  atualizarConteudoCard(draggedCard, id, novoStatus);
  
  // Tentar atualizar no servidor
  try {
    const response = await fetch(`${API_BASE_URL}/OrdemServico/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: novoStatus })
    });

    if (!response.ok) {
      // Se falhar, reverter e recarregar
      throw new Error('Erro ao atualizar status');
    }

    // Recarregar Kanban para garantir que tudo está sincronizado (incluindo botões)
    await loadKanban();
    showNotification('Status alterado com sucesso!', 'success');
  } catch (error) {
    // Reverter mudança em caso de erro
    console.error('Erro ao alterar status:', error);
    showNotification('Erro ao alterar status. Recarregando...', 'error');
    // Reverter posição
    draggedCard.remove();
    oldColumn.appendChild(draggedCard);
    draggedCard.dataset.status = oldStatus;
    atualizarConteudoCard(draggedCard, id, oldStatus);
    // Recarregar Kanban para garantir sincronização
    await loadKanban();
  }
}

/**
 * Atualiza o conteúdo do card (botões) baseado no status
 */
function atualizarConteudoCard(card, ordemId, novoStatus) {
  // Determinar botões baseado no novo status
  let actionButtons = '';
  if (novoStatus === 'Aguardando') {
    actionButtons = `
      <button class="card-btn card-btn-primary" onclick="alterarStatus(${ordemId}, 'Pronto para Contato')">
        Pronto para Contato
      </button>
    `;
  } else if (novoStatus === 'Pronto para Contato') {
    actionButtons = `
      <button class="card-btn card-btn-primary" onclick="alterarStatus(${ordemId}, 'Em Andamento')">
        Em Andamento
      </button>
    `;
  } else if (novoStatus === 'Em Andamento') {
    actionButtons = `
      <button class="card-btn card-btn-success" onclick="alterarStatus(${ordemId}, 'Concluído')">
        Concluir
      </button>
    `;
  }
  // Se for "Concluído", não tem botão

  // Obter o conteúdo atual do card
  const cardContent = card.innerHTML;
  
  // Extrair apenas as informações (cliente, serviço, placa) removendo botões antigos
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cardContent;
  
  // Remover botões antigos
  tempDiv.querySelectorAll('.card-btn, [style*="margin-top: 10px"]').forEach(el => {
    el.remove();
  });
  
  // Obter o conteúdo limpo
  let newContent = tempDiv.innerHTML.trim();
  
  // Adicionar os novos botões se houver
  if (actionButtons) {
    newContent += `<div style="margin-top: 10px;">${actionButtons}</div>`;
  }
  
  card.innerHTML = newContent;
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
    showConfirm(
      "Tem certeza que deseja excluir este serviço?",
      async () => {
        try {
          const resp = await fetch(`${API_BASE_URL}/OrdemServico/${ordemId}`, {
            method: "DELETE"
          });
          if (!resp.ok && resp.status !== 204) {
            throw new Error("Erro ao excluir serviço");
          }
          await loadKanban();
          fechar();
          showNotification('Serviço excluído com sucesso!', 'success');
        } catch (err) {
          console.error("Erro ao excluir serviço:", err);
          showNotification("Erro ao excluir serviço: " + err.message, 'error');
        }
      }
    );
  };

  setTimeout(() => overlay.classList.add("show"), 10);
}

// ========== FINALIZAÇÃO DE SERVIÇO ==========

/**
 * Abre a tela de finalização de serviço para adicionar peças utilizadas
 */
async function abrirFinalizacaoServico(ordem, servico) {
  const ordemId = ordem.id || ordem.Id;
  const servicoId = servico?.id || servico?.Id || ordem.servicoId || ordem.ServicoId;
  const s = servico || {};

  // Carregar peças disponíveis
  let pecas = [];
  try {
    const response = await fetch(`${API_BASE_URL}/Peca`);
    if (response.ok) {
      pecas = await response.json();
    }
  } catch (error) {
    console.error('Erro ao carregar peças:', error);
    showNotification('Erro ao carregar peças disponíveis', 'error');
    return;
  }

  // Criar overlay de finalização
  const overlay = document.createElement("div");
  overlay.className = "order-detail-overlay";
  overlay.innerHTML = `
    <div class="finalizacao-modal">
      <div class="order-detail-header">
        <h3>Finalização de Serviço</h3>
        <button class="order-detail-close">&times;</button>
      </div>
      <div class="finalizacao-body">
        <div class="finalizacao-info">
          <h4>Informações do Serviço</h4>
          <p><strong>Ordem:</strong> #${ordemId}</p>
          <p><strong>Cliente:</strong> ${escapeHtml(s.cliente || s.Cliente || 'N/A')}</p>
          <p><strong>Placa:</strong> ${escapeHtml(s.placa || s.Placa || 'N/A')}</p>
          <p><strong>Serviço:</strong> ${escapeHtml(s.tipoServico || s.TipoServico || s.descricao || s.Descricao || 'N/A')}</p>
        </div>
        
        <div class="finalizacao-pecas">
          <h4>Peças Utilizadas</h4>
          <div class="pecas-search">
            <input type="text" 
                   id="pecas-search-input" 
                   class="pecas-search-input" 
                   placeholder="🔍 Pesquisar peça por nome ou código...">
          </div>
          <div id="pecas-lista" class="pecas-lista">
            ${pecas.map(peca => `
              <div class="peca-item" data-peca-nome="${(peca.nome || peca.Nome || '').toLowerCase()}" data-peca-codigo="${(peca.codigo || peca.Codigo || '').toLowerCase()}">
                <div class="peca-info">
                  <strong>${escapeHtml(peca.nome || peca.Nome || '')}</strong>
                  <span class="peca-codigo">Código: ${escapeHtml(peca.codigo || peca.Codigo || '')}</span>
                  <span class="peca-estoque ${(peca.quantidade || peca.Quantidade || 0) < 5 ? 'estoque-baixo' : ''}">Estoque: ${peca.quantidade || peca.Quantidade || 0}</span>
                </div>
                <div class="peca-quantidade">
                  <label>Qtd:</label>
                  <input type="number" 
                         min="0" 
                         max="${peca.quantidade || peca.Quantidade || 0}" 
                         value="0" 
                         class="peca-qtd-input"
                         data-peca-id="${peca.id || peca.Id}">
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="finalizacao-actions">
        <button class="finalizacao-cancelar-btn">Cancelar Serviço</button>
        <button class="finalizacao-finalizar-btn">Finalizar Serviço</button>
        <button class="order-detail-cancel">Fechar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Obter referência aos inputs de quantidade
  const qtdInputs = overlay.querySelectorAll('.peca-qtd-input');

  // Configurar pesquisa de peças
  const searchInput = overlay.querySelector('#pecas-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      const pecaItems = overlay.querySelectorAll('.peca-item');
      
      pecaItems.forEach(item => {
        const nome = item.dataset.pecaNome || '';
        const codigo = item.dataset.pecaCodigo || '';
        
        if (nome.includes(searchTerm) || codigo.includes(searchTerm)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  const fechar = () => {
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.querySelector(".order-detail-close").onclick = fechar;
  overlay.querySelector(".order-detail-cancel").onclick = fechar;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) fechar();
  });

  // Botão de finalizar
  overlay.querySelector(".finalizacao-finalizar-btn").onclick = async () => {
    if (!servicoId || servicoId === 0) {
      showNotification('Erro: ID do serviço não encontrado. Por favor, recarregue a página.', 'error');
      console.error('servicoId não encontrado:', { ordem, servico, servicoId });
      return;
    }

    const pecasUsadas = [];
    qtdInputs.forEach(input => {
      const quantidade = parseInt(input.value) || 0;
      if (quantidade > 0) {
        pecasUsadas.push({
          pecaId: parseInt(input.dataset.pecaId),
          quantidade: quantidade
        });
      }
    });

    if (pecasUsadas.length === 0) {
      showNotification('Adicione pelo menos uma peça utilizada ou use "Cancelar Serviço" para excluir.', 'warning');
      return;
    }

    try {
      console.log('Finalizando serviço:', { servicoId, pecasUsadas });
      // Atualizar serviço com peças utilizadas
      const response = await fetch(`${API_BASE_URL}/Servico/${servicoId}/finalizar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          PecasUsadas: pecasUsadas
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao finalizar serviço');
      }

      // Excluir a ordem de serviço após finalização
      try {
        const deleteResponse = await fetch(`${API_BASE_URL}/OrdemServico/${ordemId}`, {
          method: 'DELETE'
        });
        if (!deleteResponse.ok && deleteResponse.status !== 204) {
          console.warn('Aviso: Não foi possível excluir a ordem de serviço automaticamente');
        }
      } catch (deleteError) {
        console.warn('Aviso ao excluir ordem:', deleteError);
      }

      await loadKanban();
      fechar();
      showNotification('Serviço finalizado com sucesso! O card foi removido.', 'success');
    } catch (error) {
      console.error('Erro ao finalizar serviço:', error);
      showNotification('Erro ao finalizar serviço: ' + error.message, 'error');
    }
  };

  // Botão de cancelar serviço
  overlay.querySelector(".finalizacao-cancelar-btn").onclick = async () => {
    const pecasUsadas = [];
    qtdInputs.forEach(input => {
      const quantidade = parseInt(input.value) || 0;
      if (quantidade > 0) {
        pecasUsadas.push({
          pecaId: parseInt(input.dataset.pecaId),
          quantidade: quantidade
        });
      }
    });

    // Usar notificação de confirmação ao invés de confirm
    showConfirm(
      'Tem certeza que deseja cancelar este serviço? As peças informadas serão dadas baixa no estoque e o serviço será excluído.',
      () => {
        cancelarServicoAcao(pecasUsadas, servicoId, fechar);
      }
    );
    return;
  };

  // Função separada para cancelar serviço após confirmação
  async function cancelarServicoAcao(pecasUsadas, servicoId, fechar) {

    try {
      // Chamar endpoint de cancelar (já faz tudo: baixa no estoque e exclui serviço/ordem)
      const response = await fetch(`${API_BASE_URL}/Servico/${servicoId}/cancelar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          PecasUsadas: pecasUsadas
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao cancelar serviço');
      }

      await loadKanban();
      fechar();
      showNotification('Serviço cancelado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao cancelar serviço:', error);
      showNotification('Erro ao cancelar serviço: ' + error.message, 'error');
    }
  };

  setTimeout(() => overlay.classList.add("show"), 10);
}

