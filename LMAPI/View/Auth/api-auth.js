// API de Autenticação
const API_BASE_URL = 'http://localhost:5284/api';

window.apiAuth = {
    /**
     * Realiza o cadastro de um novo usuário
     * @param {string} email - Email do usuário
     * @param {string} senha - Senha do usuário
     * @param {string} nome - Nome completo do usuário
     * @param {string} telefone - Telefone do usuário
     * @returns {Promise<Object>} Resposta da API com dados do cliente cadastrado
     */
    async register(email, senha, nome, telefone) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    telefone: telefone,
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
                // Atualizar o botão de login imediatamente
                this.updateLoginButton();
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
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
                // Atualizar o botão de login imediatamente
                this.updateLoginButton();
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

// Atualizar o botão quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.apiAuth.updateLoginButton();
    });
} else {
    window.apiAuth.updateLoginButton();
}

