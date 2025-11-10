// Configuração da API
const API_BASE_URL = 'http://localhost:5284/api';

// Estado global
let pecas = [];
let editingId = null;
let editForm = {};

let clientes = [];
let editingClienteId = null;
let editClienteForm = {};

// Elementos DOM
const pecasTbody = document.getElementById('pecas-tbody');
const searchInput = document.getElementById('search-input');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error-message');

const clientesTbody = document.getElementById('clientes-tbody');
const clienteSearchInput = document.getElementById('cliente-search-input');
const clienteLoadingDiv = document.getElementById('cliente-loading');
const clienteErrorDiv = document.getElementById('cliente-error-message');

// Funções de API
async function fetchPecas() {
    try {
        showLoading(true);
        hideError();
        const response = await fetch(`${API_BASE_URL}/Peca`);
        if (!response.ok) throw new Error('Erro ao buscar peças');
        pecas = await response.json();
        renderPecas(pecas);
    } catch (error) {
        showError('Erro ao carregar peças. Verifique se a API está rodando em http://localhost:5284');
        console.error(error);
        pecasTbody.innerHTML = '<tr><td colspan="5" class="no-data">Erro ao carregar peças</td></tr>';
    } finally {
        showLoading(false);
    }
}

async function createPeca(peca) {
    try {
        const response = await fetch(`${API_BASE_URL}/Peca`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(peca),
        });
        if (!response.ok) throw new Error('Erro ao criar peça');
        return await response.json();
    } catch (error) {
        throw new Error('Erro ao criar peça: ' + error.message);
    }
}

async function updatePeca(id, peca) {
    try {
        const response = await fetch(`${API_BASE_URL}/Peca/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(peca),
        });
        if (!response.ok) throw new Error('Erro ao atualizar peça');
        return response.ok;
    } catch (error) {
        throw new Error('Erro ao atualizar peça: ' + error.message);
    }
}

async function deletePeca(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/Peca/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Erro ao deletar peça');
        return response.ok;
    } catch (error) {
        throw new Error('Erro ao deletar peça: ' + error.message);
    }
}

// Funções de UI
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    errorDiv.style.display = 'none';
}

// Sistema de Notificações
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showErrorNotification(message) {
    showNotification(message, 'error');
}

function showWarning(message) {
    showNotification(message, 'warning');
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function renderPecas(pecasToRender) {
    if (pecasToRender.length === 0) {
        pecasTbody.innerHTML = '<tr><td colspan="5" class="no-data">Nenhuma peça encontrada</td></tr>';
        return;
    }

    pecasTbody.innerHTML = pecasToRender.map(peca => {
        if (editingId === peca.id) {
            return `
                <tr>
                    <td>
                        <input
                            type="text"
                            value="${escapeHtml(editForm.codigo)}"
                            onchange="editForm.codigo = this.value"
                            class="edit-input"
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            value="${escapeHtml(editForm.nome)}"
                            onchange="editForm.nome = this.value"
                            class="edit-input"
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            value="${escapeHtml(editForm.precoUnitario)}"
                            onchange="editForm.precoUnitario = this.value"
                            class="edit-input"
                            placeholder="0,00"
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            value="${editForm.quantidade}"
                            onchange="editForm.quantidade = this.value"
                            class="edit-input"
                        />
                    </td>
                    <td class="actions">
                        <div class="edit-actions">
                            <button class="save-btn" onclick="handleSaveEdit(${peca.id})">
                                ✓ Salvar
                            </button>
                            <button class="cancel-btn" onclick="handleCancelEdit()">
                                ✕ Cancelar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            return `
                <tr>
                    <td>#${escapeHtml(peca.codigo)}</td>
                    <td>${escapeHtml(peca.nome)}</td>
                    <td>
                        <span class="price">
                            ${formatCurrency(peca.precoUnitario)}
                            ${peca.precoUnitario < 150 ? '<span class="price-dot">●</span>' : ''}
                        </span>
                    </td>
                    <td>${peca.quantidade}</td>
                    <td class="actions">
                        <button class="edit-btn" onclick="handleEdit(${peca.id})" title="Editar">
                        Editar
                        </button>
                        <button class="remove-btn" onclick="handleDelete(${peca.id})" title="Remover">
                        Remover
                        </button>
                    </td>
                </tr>
            `;
        }
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handlers
function handleEdit(id) {
    const peca = pecas.find(p => p.id === id);
    if (!peca) return;

    editingId = id;
    editForm = {
        codigo: peca.codigo,
        nome: peca.nome,
        precoUnitario: peca.precoUnitario.toString().replace('.', ','),
        quantidade: peca.quantidade.toString()
    };
    renderPecas(filteredPecas());
}

function handleCancelEdit() {
    editingId = null;
    editForm = {};
    renderPecas(filteredPecas());
}

async function handleSaveEdit(id) {
    try {
        const pecaToUpdate = {
            id: id,
            codigo: editForm.codigo,
            nome: editForm.nome,
            precoUnitario: parseFloat(editForm.precoUnitario.replace(',', '.')) || 0,
            quantidade: parseInt(editForm.quantidade) || 0
        };
        await updatePeca(id, pecaToUpdate);
        editingId = null;
        editForm = {};
        await fetchPecas();
        showSuccess('Peça atualizada com sucesso!');
    } catch (error) {
        showErrorNotification('Erro ao atualizar peça: ' + error.message);
        console.error(error);
    }
}

async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja remover esta peça?')) {
        return;
    }

    try {
        await deletePeca(id);
        await fetchPecas();
        showSuccess('Peça removida com sucesso!');
    } catch (error) {
        showErrorNotification('Erro ao remover peça: ' + error.message);
        console.error(error);
    }
}

async function handleAdd() {
    const codigo = document.getElementById('new-codigo').value.trim();
    const nome = document.getElementById('new-nome').value.trim();
    const preco = document.getElementById('new-preco').value.trim();
    const quantidade = document.getElementById('new-quantidade').value.trim();

    if (!codigo || !nome || !preco || !quantidade) {
        showWarning('Por favor, preencha todos os campos');
        return;
    }

    try {
        const pecaToAdd = {
            codigo: codigo,
            nome: nome,
            precoUnitario: parseFloat(preco.replace(',', '.')) || 0,
            quantidade: parseInt(quantidade) || 0
        };
        await createPeca(pecaToAdd);
        
        // Limpar campos
        document.getElementById('new-codigo').value = '';
        document.getElementById('new-nome').value = '';
        document.getElementById('new-preco').value = '';
        document.getElementById('new-quantidade').value = '';
        
        await fetchPecas();
        showSuccess('Peça adicionada com sucesso!');
    } catch (error) {
        showErrorNotification('Erro ao adicionar peça: ' + error.message);
        console.error(error);
    }
}

function filteredPecas() {
    const term = searchInput.value.toLowerCase();
    if (!term) return pecas;
    return pecas.filter(peca =>
        peca.nome.toLowerCase().includes(term) ||
        peca.codigo.toLowerCase().includes(term)
    );
}

// Event Listeners
searchInput.addEventListener('input', () => {
    renderPecas(filteredPecas());
});

// Permitir Enter no formulário de adicionar
document.getElementById('new-codigo').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAdd();
});
document.getElementById('new-nome').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAdd();
});
document.getElementById('new-preco').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAdd();
});
document.getElementById('new-quantidade').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAdd();
});

// ==================== FUNÇÕES DE CLIENTES ====================

// Funções de API para Clientes
async function fetchClientes() {
    try {
        showClienteLoading(true);
        hideClienteError();
        const response = await fetch(`${API_BASE_URL}/Cliente`);
        if (!response.ok) throw new Error('Erro ao buscar clientes');
        clientes = await response.json();
        renderClientes(clientes);
    } catch (error) {
        showClienteError('Erro ao carregar clientes. Verifique se a API está rodando em http://localhost:5284');
        console.error(error);
        clientesTbody.innerHTML = '<tr><td colspan="6" class="no-data">Erro ao carregar clientes</td></tr>';
    } finally {
        showClienteLoading(false);
    }
}

async function createCliente(cliente) {
    try {
        const response = await fetch(`${API_BASE_URL}/Cliente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cliente),
        });
        if (!response.ok) throw new Error('Erro ao criar cliente');
        return await response.json();
    } catch (error) {
        throw new Error('Erro ao criar cliente: ' + error.message);
    }
}

async function updateCliente(id, cliente) {
    try {
        const response = await fetch(`${API_BASE_URL}/Cliente/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cliente),
        });
        if (!response.ok) throw new Error('Erro ao atualizar cliente');
        return response.ok;
    } catch (error) {
        throw new Error('Erro ao atualizar cliente: ' + error.message);
    }
}

async function deleteCliente(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/Cliente/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Erro ao deletar cliente');
        return response.ok;
    } catch (error) {
        throw new Error('Erro ao deletar cliente: ' + error.message);
    }
}

// Funções de UI para Clientes
function showClienteLoading(show) {
    clienteLoadingDiv.style.display = show ? 'block' : 'none';
}

function showClienteError(message) {
    clienteErrorDiv.textContent = message;
    clienteErrorDiv.style.display = 'block';
}

function hideClienteError() {
    clienteErrorDiv.style.display = 'none';
}

function renderClientes(clientesToRender) {
    if (clientesToRender.length === 0) {
        clientesTbody.innerHTML = '<tr><td colspan="6" class="no-data">Nenhum cliente encontrado</td></tr>';
        return;
    }

    clientesTbody.innerHTML = clientesToRender.map(cliente => {
        if (editingClienteId === cliente.id) {
            return `
                <tr>
                    <td>${cliente.id}</td>
                    <td>
                        <input
                            type="text"
                            value="${escapeHtml(editClienteForm.nome)}"
                            onchange="editClienteForm.nome = this.value"
                            class="edit-input"
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            value="${escapeHtml(editClienteForm.telefone)}"
                            onchange="editClienteForm.telefone = this.value"
                            class="edit-input"
                        />
                    </td>
                    <td>
                        <input
                            type="email"
                            value="${escapeHtml(editClienteForm.email)}"
                            onchange="editClienteForm.email = this.value"
                            class="edit-input"
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            value="${escapeHtml(editClienteForm.endereco)}"
                            onchange="editClienteForm.endereco = this.value"
                            class="edit-input"
                        />
                    </td>
                    <td class="actions">
                        <div class="edit-actions">
                            <button class="save-btn" onclick="handleSaveEditCliente(${cliente.id})">
                                ✓ Salvar
                            </button>
                            <button class="cancel-btn" onclick="handleCancelEditCliente()">
                                ✕ Cancelar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            return `
                <tr>
                    <td>${cliente.id}</td>
                    <td>${escapeHtml(cliente.nome)}</td>
                    <td>${escapeHtml(cliente.telefone)}</td>
                    <td>${escapeHtml(cliente.email)}</td>
                    <td>${escapeHtml(cliente.endereco)}</td>
                    <td class="actions">
                        <button class="edit-btn" onclick="handleEditCliente(${cliente.id})" title="Editar">
                            Editar
                        </button>
                        <button class="remove-btn" onclick="handleDeleteCliente(${cliente.id})" title="Remover">
                            Remover
                        </button>
                    </td>
                </tr>
            `;
        }
    }).join('');
}

// Handlers de Clientes
function handleEditCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;

    editingClienteId = id;
    editClienteForm = {
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email,
        endereco: cliente.endereco
    };
    renderClientes(filteredClientes());
}

function handleCancelEditCliente() {
    editingClienteId = null;
    editClienteForm = {};
    renderClientes(filteredClientes());
}

async function handleSaveEditCliente(id) {
    try {
        const clienteToUpdate = {
            id: id,
            nome: editClienteForm.nome,
            telefone: editClienteForm.telefone,
            email: editClienteForm.email,
            endereco: editClienteForm.endereco
        };
        await updateCliente(id, clienteToUpdate);
        editingClienteId = null;
        editClienteForm = {};
        await fetchClientes();
        showSuccess('Cliente atualizado com sucesso!');
    } catch (error) {
        showErrorNotification('Erro ao atualizar cliente: ' + error.message);
        console.error(error);
    }
}

async function handleDeleteCliente(id) {
    if (!confirm('Tem certeza que deseja remover este cliente?')) {
        return;
    }

    try {
        await deleteCliente(id);
        await fetchClientes();
        showSuccess('Cliente removido com sucesso!');
    } catch (error) {
        showErrorNotification('Erro ao remover cliente: ' + error.message);
        console.error(error);
    }
}

async function handleAddCliente() {
    const nome = document.getElementById('new-cliente-nome').value.trim();
    const telefone = document.getElementById('new-cliente-telefone').value.trim();
    const email = document.getElementById('new-cliente-email').value.trim();
    const endereco = document.getElementById('new-cliente-endereco').value.trim();

    if (!nome || !telefone || !email || !endereco) {
        showWarning('Por favor, preencha todos os campos');
        return;
    }

    try {
        const clienteToAdd = {
            nome: nome,
            telefone: telefone,
            email: email,
            endereco: endereco
        };
        await createCliente(clienteToAdd);
        
        // Limpar campos
        document.getElementById('new-cliente-nome').value = '';
        document.getElementById('new-cliente-telefone').value = '';
        document.getElementById('new-cliente-email').value = '';
        document.getElementById('new-cliente-endereco').value = '';
        
        await fetchClientes();
        showSuccess('Cliente adicionado com sucesso!');
    } catch (error) {
        showErrorNotification('Erro ao adicionar cliente: ' + error.message);
        console.error(error);
    }
}

function filteredClientes() {
    const term = clienteSearchInput.value.toLowerCase();
    if (!term) return clientes;
    return clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(term) ||
        cliente.email.toLowerCase().includes(term) ||
        cliente.telefone.toLowerCase().includes(term) ||
        cliente.endereco.toLowerCase().includes(term)
    );
}

// Event Listeners para Clientes
clienteSearchInput.addEventListener('input', () => {
    renderClientes(filteredClientes());
});

// Permitir Enter no formulário de adicionar cliente
document.getElementById('new-cliente-nome').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddCliente();
});
document.getElementById('new-cliente-telefone').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddCliente();
});
document.getElementById('new-cliente-email').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddCliente();
});
document.getElementById('new-cliente-endereco').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddCliente();
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    fetchPecas();
    fetchClientes();
});

