// API de Autenticação
var API_BASE_URL = 'https://labmotors-testedetraavis.onrender.com/api';
// Tornar disponível globalmente
window.API_BASE_URL = API_BASE_URL;

window.apiAuth = {
    /**
     * Realiza o cadastro de um novo usuário
     * @param {string} email - Email do usuário
     * @param {string} senha - Senha do usuário
     * @param {string} nome - Nome completo do usuário
     * @param {string} telefone - Telefone do usuário
     * @param {string} endereco - Endereço do usuário
     * @returns {Promise<Object>} Resposta da API com dados do cliente cadastrado
     */
    async register(email, senha, nome, telefone, endereco) {
        try {
            const apiUrl = window.API_BASE_URL || API_BASE_URL || 'https://labmotors-testedetraavis.onrender.com/api';
            const response = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    telefone: telefone,
                    endereco: endereco,
                    senha: senha
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao realizar cadastro');
            }

            // Salvar dados do usuário no localStorage
            if (data.cliente) {
                localStorage.setItem('cliente', JSON.stringify(data.cliente));
                // Atualizar o botão de login e links imediatamente
                this.updateLoginButton();
                this.updateAcompanhamentoLink();
                this.updateAdminLinks();
                this.updateAgendaLink();
            }

            return data;
        } catch (error) {
            console.error('Erro no cadastro:', error);
            throw error;
        }
    },

    /**
     * Realiza o login do usuário
     * @param {string} email - Email do usuário
     * @param {string} senha - Senha do usuário
     * @returns {Promise<Object>} Resposta da API com dados do cliente autenticado
     */
    async login(email, senha) {
        try {
            const apiUrl = window.API_BASE_URL || API_BASE_URL || 'https://labmotors-testedetraavis.onrender.com/api';
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao fazer login');
            }

            // Salvar dados do usuário no localStorage
            if (data.cliente) {
                localStorage.setItem('cliente', JSON.stringify(data.cliente));
                // Atualizar o botão de login e links imediatamente
                this.updateLoginButton();
                this.updateAcompanhamentoLink();
                this.updateAdminLinks();
                this.updateAgendaLink();
            }

            return data;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    },

    /**
     * Faz logout do usuário
     */
    logout() {
        localStorage.removeItem('cliente');
        this.updateLoginButton();
        this.updateAcompanhamentoLink();
        this.updateAdminLinks();
        this.updateAgendaLink();
    },

    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean} True se o usuário estiver autenticado
     */
    isAuthenticated() {
        return localStorage.getItem('cliente') !== null;
    },

    /**
     * Obtém os dados do usuário autenticado
     * @returns {Object|null} Dados do cliente ou null se não estiver autenticado
     */
    getCurrentUser() {
        const clienteStr = localStorage.getItem('cliente');
        return clienteStr ? JSON.parse(clienteStr) : null;
    },

    /**
     * Verifica se o usuário atual é admin
     * @returns {boolean} True se o usuário for admin
     */
    isAdmin() {
        const cliente = this.getCurrentUser();
        return cliente && (cliente.Admin === true || cliente.admin === true);
    },

    /**
     * Atualiza a visibilidade da aba de acompanhamento baseado no status de login e admin
     */
    updateAcompanhamentoLink() {
        // Buscar todos os links de acompanhamento
        const acompanhamentoLinks = document.querySelectorAll('#acompanhamento-link, .nav-link-acompanhamento, a[href*="acompanhamento"]');
        if (acompanhamentoLinks.length === 0) return;
        
        const isAuthenticated = this.isAuthenticated();
        const isAdmin = this.isAdmin();
        
        acompanhamentoLinks.forEach(link => {
            // Se não estiver autenticado ou for admin, esconder
            if (!isAuthenticated || isAdmin) {
                link.style.display = 'none';
            } else {
                link.style.display = 'block';
            }
        });
    },

    /**
     * Atualiza a visibilidade das abas de admin e kanban baseado no status de admin
     */
    updateAdminLinks() {
        // Buscar todos os links de admin e kanban (apenas os que estão no nav)
        const adminLinks = document.querySelectorAll('.nav-link-admin, nav a[href*="admin"], nav a[href*="kanban"], nav a[href*="kambam"]');
        if (adminLinks.length === 0) return;
        
        const isAuthenticated = this.isAuthenticated();
        const isAdmin = this.isAdmin();
        
        adminLinks.forEach(link => {
            // Verificar se o link realmente é de admin/kanban (não outros links que contenham essas palavras)
            const href = link.getAttribute('href') || '';
            const isAdminLink = href.includes('/admin') || href.includes('admin/index');
            const isKanbanLink = href.includes('kanban') || href.includes('kambam');
            
            if (isAdminLink || isKanbanLink || link.classList.contains('nav-link-admin')) {
                // Se estiver autenticado e for admin, mostrar
                if (isAuthenticated && isAdmin) {
                    link.style.display = 'block';
                } else {
                    link.style.display = 'none';
                }
            }
        });
    },

    /**
     * Atualiza a visibilidade do link de Agenda baseado no status de login
     */
    updateAgendaLink() {
        // Buscar todos os links de agenda
        const agendaLinks = document.querySelectorAll('nav a[href*="Agenda"], nav a[href*="agenda"]');
        if (agendaLinks.length === 0) return;
        
        const isAuthenticated = this.isAuthenticated();
        
        agendaLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            const isAgendaLink = href.includes('/Agenda') || href.includes('Agenda/index') || href.includes('agenda');
            
            if (isAgendaLink) {
                // Se estiver autenticado, mostrar. Se não, esconder.
                if (isAuthenticated) {
                    link.style.display = 'block';
                } else {
                    link.style.display = 'none';
                }
            }
        });
    },

    /**
     * Protege a página de acompanhamento - redireciona se não estiver logado ou for admin
     */
    protectAcompanhamentoPage() {
        // Verificar se estamos na página de acompanhamento
        const isAcompanhamentoPage = window.location.pathname.includes('acompanhamento') || 
                                     window.location.href.includes('acompanhamento');
        
        if (isAcompanhamentoPage) {
            if (!this.isAuthenticated()) {
                // Esconder o conteúdo imediatamente
                const mainContent = document.querySelector('main, .servicos-container, body');
                if (mainContent) {
                    mainContent.style.display = 'none';
                }
                
                if (window.showError) {
                    window.showError('Você precisa estar logado para acessar esta página.');
                }
                setTimeout(() => {
                    window.location.href = '../login/index.html';
                }, 1500);
                return true;
            } else if (this.isAdmin()) {
                // Admin não pode acessar acompanhamento
                const mainContent = document.querySelector('main, .servicos-container, body');
                if (mainContent) {
                    mainContent.style.display = 'none';
                }
                
                if (window.showError) {
                    window.showError('Esta página não está disponível para administradores.');
                }
                setTimeout(() => {
                    window.location.href = '../homepage/index.html';
                }, 1500);
                return true;
            }
        }
        return false;
    },

    /**
     * Protege as páginas de admin e kanban - redireciona se não for admin
     */
    protectAdminPages() {
        // Verificar se estamos em uma página de admin ou kanban
        const isAdminPage = window.location.pathname.includes('admin') || 
                           window.location.href.includes('admin');
        const isKanbanPage = window.location.pathname.includes('kanban') || 
                            window.location.pathname.includes('kambam') ||
                            window.location.href.includes('kanban') ||
                            window.location.href.includes('kambam');
        
        if (isAdminPage || isKanbanPage) {
            if (!this.isAuthenticated() || !this.isAdmin()) {
                // Esconder o conteúdo imediatamente
                const mainContent = document.querySelector('main, .main-content, .kanban-container');
                if (mainContent) {
                    mainContent.style.display = 'none';
                }
                
                if (window.showError) {
                    window.showError('Você precisa ser administrador para acessar esta página.');
                } else if (window.showErrorNotification) {
                    window.showErrorNotification('Você precisa ser administrador para acessar esta página.');
                }
                setTimeout(() => {
                    window.location.href = '../homepage/index.html';
                }, 1500);
                return true;
            }
        }
        return false;
    },

    /**
     * Protege a página de agenda - redireciona se não estiver logado
     */
    protectAgendaPage() {
        // Verificar se estamos na página de agenda
        const isAgendaPage = window.location.pathname.includes('Agenda') || 
                            window.location.pathname.includes('agenda') ||
                            window.location.href.includes('Agenda') ||
                            window.location.href.includes('agenda');
        
        if (isAgendaPage) {
            if (!this.isAuthenticated()) {
                // Esconder o conteúdo imediatamente
                const mainContent = document.querySelector('section, .agenda-section, .calendar-section');
                if (mainContent) {
                    mainContent.style.display = 'none';
                }
                
                if (window.showError) {
                    window.showError('Você precisa estar logado para acessar a agenda.');
                } else if (window.showErrorNotification) {
                    window.showErrorNotification('Você precisa estar logado para acessar a agenda.');
                }
                setTimeout(() => {
                    window.location.href = '../login/index.html';
                }, 1500);
                return true;
            }
        }
        return false;
    },

    /**
     * Atualiza o botão de login no header com o nome do usuário se estiver logado
     */
    updateLoginButton() {
        const signupBtn = document.querySelector('.signup-btn');
        if (!signupBtn) return;

        const cliente = this.getCurrentUser();
        
        // Remover dropdown existente se houver
        const existingDropdown = signupBtn.querySelector('.user-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
        
        if (cliente && (cliente.Nome || cliente.nome)) {
            // Usuário está logado - mostrar nome com dropdown
            const nomeUsuario = cliente.Nome || cliente.nome;
            signupBtn.innerHTML = nomeUsuario + ' ▼';
            signupBtn.classList.add('user-logged-in');
            signupBtn.style.display = 'block';
            signupBtn.style.position = 'relative';
            
            // Remover qualquer link existente
            const existingLink = signupBtn.querySelector('a');
            if (existingLink) {
                existingLink.remove();
            }
            
            // Criar menu dropdown
            const dropdown = document.createElement('div');
            dropdown.className = 'user-dropdown';
            dropdown.innerHTML = `
                <div class="user-dropdown-item logout-item" id="logout-btn">
                    <span>Sair</span>
                </div>
            `;
            
            // Adicionar dropdown ao botão
            signupBtn.appendChild(dropdown);
            
            // Evento para mostrar/ocultar dropdown
            signupBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('show');
            };
            
            // Evento de logout
            dropdown.addEventListener('click', (e) => {
                const logoutBtn = e.target.closest('#logout-btn, .logout-item');
                if (logoutBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    dropdown.classList.remove('show');
                    this.logout();
                    if (window.showSuccess) {
                        window.showSuccess('Logout realizado com sucesso!');
                    }
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }
            });
            
            // Fechar dropdown ao clicar fora
            const closeDropdown = (e) => {
                if (!signupBtn.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            };
            document.addEventListener('click', closeDropdown);
            signupBtn._closeDropdown = closeDropdown;
        } else {
            // Usuário não está logado - mostrar "SIGN UP" ou link para login
            signupBtn.classList.remove('user-logged-in');
            signupBtn.style.position = '';
            
            // Remover listener do dropdown se existir
            if (signupBtn._closeDropdown) {
                document.removeEventListener('click', signupBtn._closeDropdown);
                signupBtn._closeDropdown = null;
            }
            
            // Remover qualquer link existente dentro do botão
            const existingLink = signupBtn.querySelector('a');
            if (existingLink) {
                existingLink.remove();
            }
            
            // Configurar botão para redirecionar para login
            signupBtn.innerHTML = 'SIGN UP';
            signupBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '../login/index.html';
            };
        }
    }
};

// Atualizar o botão e links quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.apiAuth.updateLoginButton();
        window.apiAuth.updateAcompanhamentoLink();
        window.apiAuth.updateAdminLinks();
        window.apiAuth.updateAgendaLink();
        window.apiAuth.protectAcompanhamentoPage();
        window.apiAuth.protectAdminPages();
        window.apiAuth.protectAgendaPage();
    });
} else {
    window.apiAuth.updateLoginButton();
    window.apiAuth.updateAcompanhamentoLink();
    window.apiAuth.updateAdminLinks();
    window.apiAuth.updateAgendaLink();
    window.apiAuth.protectAcompanhamentoPage();
    window.apiAuth.protectAdminPages();
    window.apiAuth.protectAgendaPage();
}

