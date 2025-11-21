# 📚 Guia Completo do Sistema LabMotors

## 🎯 Visão Geral

O **LabMotors** é um sistema web completo para gestão de oficina de motos, desenvolvido com:
- **Backend**: C# .NET 8.0 (API REST)
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Deploy**: Docker + Render

---

## 📁 Estrutura de Pastas

```
LabMotors-TesteDeTraavis/
│
├── Dockerfile                    # Configuração Docker para deploy
│
└── LMAPI/                        # Projeto principal (.NET)
    │
    ├── Controllers/              # Endpoints da API REST
    │   ├── AuthController.cs     # Login e registro
    │   ├── ClienteController.cs  # CRUD de clientes
    │   ├── PecaController.cs     # CRUD de peças
    │   ├── ServicoController.cs  # CRUD de serviços
    │   └── OrdemServicoController.cs # CRUD de ordens
    │
    ├── Models/                   # Modelos de dados (DTOs)
    │   ├── Cliente.cs
    │   ├── Peca.cs
    │   ├── Servico.cs
    │   ├── OrdemServico.cs
    │   ├── LoginRequest.cs
    │   ├── RegisterRequest.cs
    │   ├── AuthResponse.cs
    │   └── SolicitacaoServicoDto.cs
    │
    ├── Repositories/             # Camada de acesso a dados
    │   ├── IClienteRepository.cs
    │   ├── ClienteRepository.cs
    │   ├── IPecaRepository.cs
    │   ├── PecaRepository.cs
    │   ├── IServicoRepository.cs
    │   ├── ServicoRepository.cs
    │   ├── IOrdemServicoRepository.cs
    │   └── OrdemServicoRepository.cs
    │
    ├── Services/                 # Lógica de negócio
    │   └── EstoqueService.cs     # Controle de estoque
    │
    ├── Data/                     # Configuração do banco
    │   ├── SupabaseService.cs    # Cliente Supabase (Singleton)
    │   ├── schema.sql            # Script SQL para criar tabelas
    │   └── INSTRUCOES_SUPABASE.md
    │
    ├── View/                     # Frontend (HTML/CSS/JS)
    │   ├── homepage/             # Página inicial
    │   ├── login/                # Página de login
    │   ├── Auth/                 # Scripts de autenticação
    │   ├── Agenda/               # Sistema de agendamento
    │   ├── kambam/               # Kanban board
    │   ├── acompanhamento/      # Rastreamento de serviços
    │   ├── admin/                # Painel administrativo
    │   ├── servicos/             # Página de serviços
    │   └── css/                  # Estilos globais
    │
    ├── Program.cs                # Configuração da aplicação
    ├── LMAPI.csproj              # Arquivo do projeto
    └── appsettings.json          # Configurações
```

---

## 🏗️ Arquitetura do Sistema

### Padrão de Arquitetura: **Repository Pattern + MVC**

```
Frontend (View/) 
    ↓ HTTP Requests
Controllers (API Endpoints)
    ↓ Dependency Injection
Repositories (Acesso a Dados)
    ↓ Supabase Client
Supabase (PostgreSQL)
```

### Fluxo de Dados

1. **Frontend** → Faz requisição HTTP para a API
2. **Controller** → Recebe requisição, valida dados
3. **Repository** → Acessa banco via SupabaseService
4. **Supabase** → Retorna dados do PostgreSQL
5. **Repository** → Converte dados do banco para Models
6. **Controller** → Retorna JSON para o Frontend
7. **Frontend** → Renderiza dados na tela

---

## 📂 Detalhamento das Pastas

### 🔧 **Backend (LMAPI/)**

#### **Controllers/** - Endpoints da API

Responsabilidade: Receber requisições HTTP e retornar respostas JSON.

- **`AuthController.cs`**
  - `POST /api/auth/register` - Cadastro de novos usuários
  - `POST /api/auth/login` - Autenticação de usuários
  - Validações: email único, senha mínima 6 caracteres

- **`ClienteController.cs`**
  - `GET /api/Cliente` - Lista todos os clientes
  - `GET /api/Cliente/{id}` - Busca cliente por ID
  - `POST /api/Cliente` - Cria novo cliente
  - `PUT /api/Cliente/{id}` - Atualiza cliente
  - `DELETE /api/Cliente/{id}` - Remove cliente

- **`PecaController.cs`**
  - `GET /api/Peca` - Lista todas as peças
  - `GET /api/Peca/{id}` - Busca peça por ID
  - `POST /api/Peca` - Adiciona nova peça
  - `PUT /api/Peca/{id}` - Atualiza peça
  - `DELETE /api/Peca/{id}` - Remove peça

- **`ServicoController.cs`**
  - `GET /api/Servico` - Lista todos os serviços
  - `GET /api/Servico/{id}` - Busca serviço por ID
  - `POST /api/Servico/SolicitarServico` - Cria novo agendamento
    - **Validação importante**: Impede agendamentos duplicados (mesma data/hora)
  - `DELETE /api/Servico/{id}` - Remove serviço

- **`OrdemServicoController.cs`**
  - `GET /api/OrdemServico` - Lista todas as ordens
  - `GET /api/OrdemServico/{id}` - Busca ordem por ID
  - `GET /api/OrdemServico/por-placa/{placa}` - Busca por placa
  - `PUT /api/OrdemServico/{id}/status` - Atualiza status da ordem
  - `DELETE /api/OrdemServico/{id}` - Remove ordem (cascade: remove serviço também)

#### **Models/** - Estruturas de Dados

Responsabilidade: Representar entidades do sistema.

- **`Cliente.cs`**
  ```csharp
  - Id, Nome, Email, Telefone, Endereco, Senha, Admin
  ```

- **`Peca.cs`**
  ```csharp
  - Id, Nome, Codigo, Quantidade, PrecoUnitario
  ```

- **`Servico.cs`**
  ```csharp
  - Id, Descricao, ClienteId, ValorTotal
  - Cliente, TipoServico, Moto, Placa, Telefone
  - Data (DateTime?), Horario, Observacoes
  - PecasUsadas (List<PecaUsada>)
  ```

- **`OrdemServico.cs`**
  ```csharp
  - Id, ServicoId, DataEmissao, Status
  - Servico (objeto relacionado)
  ```

- **DTOs (Data Transfer Objects)**
  - `LoginRequest.cs` - Dados de login
  - `RegisterRequest.cs` - Dados de cadastro
  - `AuthResponse.cs` - Resposta de autenticação
  - `SolicitacaoServicoDto.cs` - Dados de agendamento

#### **Repositories/** - Acesso a Dados

Responsabilidade: Abstrair acesso ao banco de dados.

**Padrão usado**: Interface + Implementação

- Cada entidade tem:
  - Interface (ex: `IClienteRepository.cs`) - Define contratos
  - Implementação (ex: `ClienteRepository.cs`) - Lógica real

**Métodos comuns**:
- `GetAllAsync()` / `GetAll()` - Lista todos
- `GetByIdAsync(id)` / `GetById(id)` - Busca por ID
- `AddAsync(entity)` / `Add(entity)` - Adiciona
- `UpdateAsync(id, entity)` / `Update(id, entity)` - Atualiza
- `DeleteAsync(id)` / `Delete(id)` - Remove

**Características**:
- Usa `SupabaseService` para acessar banco
- Converte entre Models (C#) e Models do Banco (Db)
- Tratamento de erros com try-catch

**Exemplo de conversão**:
```csharp
// Model do banco (Supabase)
ServicoDb → Servico (Model da aplicação)
```

#### **Services/** - Lógica de Negócio

- **`EstoqueService.cs`**
  - Controla estoque de peças
  - Valida disponibilidade antes de usar peças em serviços

#### **Data/** - Configuração do Banco

- **`SupabaseService.cs`**
  - Cliente Supabase (Singleton)
  - Inicializa conexão uma vez ao iniciar aplicação
  - Gerencia cliente HTTP para API REST do Supabase
  - **Não precisa abrir/fechar conexão** (gerenciado automaticamente)

- **`schema.sql`**
  - Script SQL para criar todas as tabelas
  - Define relacionamentos (FOREIGN KEY)
  - Cria índices para performance
  - Triggers para `updated_at` automático

**Tabelas criadas**:
- `clientes` - Dados dos clientes
- `pecas` - Catálogo de peças
- `servicos` - Serviços agendados
- `pecas_usadas` - Relacionamento muitos-para-muitos (serviços ↔ peças)
- `ordens_servico` - Ordens de serviço com status

#### **Program.cs** - Configuração da Aplicação

Responsabilidade: Configurar serviços, injeção de dependência, CORS.

**O que faz**:
1. Registra `SupabaseService` como Singleton
2. Registra todos os Repositories como Singleton
3. Configura CORS (permite requisições de qualquer origem)
4. Habilita Swagger em desenvolvimento
5. Mapeia Controllers para rotas `/api/*`

---

### 🎨 **Frontend (LMAPI/View/)**

#### **homepage/** - Página Inicial

- **`index.html`** - Estrutura da página
- **`src/css/`** - Estilos (header, footer, style)
- **`src/img/`** - Imagens da página

**Funcionalidade**: Landing page institucional da oficina.

#### **login/** - Autenticação

- **`index.html`** - Formulário de login/registro
- **`src/css/`** - Estilos da página de login

**Funcionalidade**: Permite usuários fazerem login ou se cadastrarem.

#### **Auth/** - Scripts de Autenticação

- **`api-auth.js`**
  - Funções `login()` e `register()`
  - Faz requisições para `/api/auth/login` e `/api/auth/register`
  - Salva dados do usuário no `localStorage`
  - Redireciona após login bem-sucedido

- **`notifications.js`**
  - Sistema de notificações (sucesso/erro)
  - Exibe mensagens temporárias na tela

**API Base URL**: `https://labmotors-testedetraavis.onrender.com/api`

#### **Agenda/** - Sistema de Agendamento

- **`index.html`** - Página do calendário
- **`agendamento.js`**
  - Função `enviarSolicitacaoServico()`
  - Envia dados do formulário para `/api/Servico/SolicitarServico`
  - Valida conflitos de horário (mesma data/hora)

- **`src/agenda.js`**
  - Renderiza calendário mensal
  - Mostra horários disponíveis (8h-18h)
  - **Marca horários ocupados em vermelho**
  - Carrega agendamentos existentes da API ao iniciar
  - Valida se horário está disponível antes de permitir agendamento

- **`src/agenda.css`** - Estilos do calendário

**Funcionalidade**: 
- Cliente escolhe data e horário
- Sistema valida disponibilidade
- Horários ocupados aparecem em vermelho
- Ao agendar, cria `Servico` no banco

#### **kambam/** - Kanban Board

- **`kanban.html`** - Estrutura do board
- **`kanban.js`**
  - Carrega ordens de serviço da API
  - Renderiza cards em colunas (Aguardando, Em Andamento, Concluído)
  - **Drag and Drop** para mudar status
  - **Modal de detalhes** ao clicar no card
  - **Botão de deletar** no modal (remove ordem + serviço)
  - Atualiza status via `PUT /api/OrdemServico/{id}/status`

- **`kanban.css`** - Estilos do board

**Funcionalidade**:
- Visualiza serviços em formato Kanban
- Move serviços entre colunas (muda status)
- Visualiza detalhes do cliente
- Remove serviços (cascade: remove da agenda também)

**Colunas**:
- **Aguardando** - Status inicial
- **Em Andamento** - Serviço sendo executado
- **Concluído** - Serviço finalizado

#### **acompanhamento/** - Rastreamento

- **`acomp.html`** - Página de busca
- **`acompanhamento.js`**
  - Busca por **placa** ou **ID do serviço**
  - Mostra status atual do serviço
  - Exibe informações do cliente e serviço
  - Usa `GET /api/OrdemServico/por-placa/{placa}`

- **`css/acomp.css`** - Estilos da página

**Funcionalidade**:
- Cliente digita placa ou ID
- Sistema busca e mostra status atual
- Exibe informações completas do serviço

#### **admin/** - Painel Administrativo

- **`index.html`** - Interface administrativa
- **`script.js`**
  - CRUD completo de **Peças**
  - CRUD completo de **Clientes**
  - Tabelas dinâmicas que carregam da API
  - Formulários para adicionar/editar
  - Botões de deletar

- **`styles.css`** - Estilos do painel

**Funcionalidade**:
- Gerenciar catálogo de peças (adicionar, editar, remover)
- Gerenciar clientes (adicionar, editar, remover)
- Interface com tabelas e formulários

**Endpoints usados**:
- `/api/Peca` (GET, POST, PUT, DELETE)
- `/api/Cliente` (GET, POST, PUT, DELETE)

#### **servicos/** - Página de Serviços

- **`servicos.html`** - Página institucional
- **`servicos.css`** - Estilos
- **`script.js`** - Interatividade (se houver)

**Funcionalidade**: Página informativa sobre serviços oferecidos.

#### **css/** - Estilos Globais

- **`notifications.css`** - Estilos para notificações

---

## 🔄 Fluxos Principais do Sistema

### 1. **Fluxo de Agendamento**

```
Cliente acessa Agenda
    ↓
Escolhe data e horário
    ↓
Sistema valida disponibilidade (verifica API)
    ↓
Se disponível → Preenche formulário
    ↓
Envia para /api/Servico/SolicitarServico
    ↓
Backend valida conflitos
    ↓
Cria Servico no banco
    ↓
Cria OrdemServico (status: "Aguardando")
    ↓
Horário aparece em vermelho na agenda
    ↓
Aparece no Kanban (coluna "Aguardando")
```

### 2. **Fluxo de Kanban**

```
Abrir Kanban
    ↓
Carrega ordens da API
    ↓
Renderiza cards nas colunas (por status)
    ↓
Usuário arrasta card para outra coluna
    ↓
Atualiza status via API
    ↓
Card move para nova coluna
```

### 3. **Fluxo de Acompanhamento**

```
Cliente digita placa ou ID
    ↓
Busca na API (/api/OrdemServico/por-placa/{placa})
    ↓
Exibe status e informações
```

### 4. **Fluxo de Autenticação**

```
Usuário preenche login
    ↓
Frontend envia para /api/auth/login
    ↓
Backend valida email/senha
    ↓
Retorna dados do cliente (sem senha)
    ↓
Frontend salva no localStorage
    ↓
Redireciona para página principal
```

### 5. **Fluxo de Deleção (Cascade)**

```
Usuário deleta ordem no Kanban
    ↓
Frontend chama DELETE /api/OrdemServico/{id}
    ↓
Backend (OrdemServicoRepository) deleta ordem
    ↓
Backend também deleta Servico associado
    ↓
Serviço some da agenda (horário fica disponível)
```

---

## 🗄️ Banco de Dados (Supabase)

### Estrutura de Tabelas

#### **clientes**
```sql
- id (SERIAL PRIMARY KEY)
- nome, telefone, email, endereco
- senha (texto plano - em produção usar hash)
- admin (BOOLEAN)
- created_at, updated_at
```

#### **pecas**
```sql
- id (SERIAL PRIMARY KEY)
- nome, codigo
- quantidade (estoque)
- preco_unitario
- created_at, updated_at
```

#### **servicos**
```sql
- id (SERIAL PRIMARY KEY)
- descricao
- cliente_id (FK → clientes.id)
- valor_total
- cliente, tipo_servico, moto, placa, telefone
- data (TIMESTAMP), horario
- observacoes
- created_at, updated_at
```

#### **pecas_usadas**
```sql
- id (SERIAL PRIMARY KEY)
- servico_id (FK → servicos.id) ON DELETE CASCADE
- peca_id (FK → pecas.id) ON DELETE CASCADE
- quantidade
- UNIQUE(servico_id, peca_id)
```

#### **ordens_servico**
```sql
- id (SERIAL PRIMARY KEY)
- servico_id (FK → servicos.id) ON DELETE CASCADE
- data_emissao
- status (VARCHAR) - 'Aguardando', 'Em Andamento', 'Concluído'
- created_at, updated_at
```

### Relacionamentos

```
clientes (1) ──→ (N) servicos
servicos (1) ──→ (N) pecas_usadas
pecas (1) ──→ (N) pecas_usadas
servicos (1) ──→ (1) ordens_servico
```

---

## 🚀 Deploy e Configuração

### Dockerfile

**Multi-stage build**:
1. **Base**: Imagem runtime .NET 8.0
2. **Build**: Compila aplicação
3. **Final**: Copia binários para imagem final

**Porta**: 8080

### Variáveis de Ambiente (Render)

No Render, configure:
- `SUPABASE_URL` - URL do Supabase
- `SUPABASE_KEY` - API Key do Supabase

### Como Deployar

1. Push código para Git
2. Conecta repositório no Render
3. Configura Dockerfile como build command
4. Adiciona variáveis de ambiente
5. Deploy automático

---

## 🔐 Segurança

### Pontos de Atenção

1. **Senhas em texto plano**
   - Atualmente salvas sem hash
   - **Em produção**: Usar BCrypt ou similar

2. **CORS Aberto**
   - `AllowAnyOrigin()` permite qualquer origem
   - **Em produção**: Restringir para domínios específicos

3. **API Keys no Código**
   - Credenciais do Supabase hardcoded
   - **Em produção**: Usar variáveis de ambiente

---

## 📝 Convenções de Código

### Backend (C#)
- **PascalCase** para classes, métodos, propriedades
- **Async/Await** para operações de I/O
- **Repository Pattern** para acesso a dados
- **Dependency Injection** via construtor

### Frontend (JavaScript)
- **camelCase** para variáveis e funções
- **API_BASE_URL** centralizado em cada arquivo
- **localStorage** para persistir sessão
- **Fetch API** para requisições HTTP

### Nomenclatura
- Controllers: `[Entidade]Controller.cs`
- Repositories: `[Entidade]Repository.cs`
- Models: `[Entidade].cs`
- Views: Nomes descritivos (ex: `kanban.html`)

---

## 🧪 Testes e Validações

### Validações Implementadas

1. **Agendamento**
   - Impede agendamentos duplicados (mesma data/hora)
   - Valida horários disponíveis (8h-18h)

2. **Autenticação**
   - Email único no cadastro
   - Senha mínima 6 caracteres
   - Campos obrigatórios

3. **Deleção Cascade**
   - Ao deletar ordem, remove serviço também
   - Ao deletar serviço, remove peças_usadas

---

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro 500 ao fazer login**
   - Verificar se tabelas foram criadas no Supabase
   - Executar `schema.sql` no SQL Editor
   - Aguardar 10-30s para cache do PostgREST atualizar

2. **Horários não aparecem em vermelho**
   - Verificar se `/api/Servico` está retornando dados
   - Verificar console do navegador para erros

3. **Cards do Kanban sem dados**
   - Verificar se API está retornando `servico` (camelCase ou PascalCase)
   - Código normaliza ambos os formatos

4. **CORS Error**
   - Verificar se `AllowAll` está configurado no `Program.cs`
   - Verificar se API está rodando

---

## 📚 Tecnologias Utilizadas

### Backend
- **.NET 8.0** - Framework
- **Supabase.Client** - Cliente para Supabase
- **Swagger** - Documentação da API

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilos
- **JavaScript (Vanilla)** - Lógica
- **Fetch API** - Requisições HTTP
- **LocalStorage** - Persistência local

### Banco de Dados
- **Supabase** - PostgreSQL gerenciado
- **PostgREST** - API REST automática

### Deploy
- **Docker** - Containerização
- **Render** - Hospedagem

---

## 🎓 Conceitos Aplicados

1. **Repository Pattern** - Abstração de acesso a dados
2. **Dependency Injection** - Inversão de controle
3. **REST API** - Arquitetura de API
4. **Singleton Pattern** - Uma instância do SupabaseService
5. **Cascade Delete** - Deleção em cascata
6. **DTO (Data Transfer Object)** - Objetos para transferência
7. **Async/Await** - Programação assíncrona
8. **CORS** - Cross-Origin Resource Sharing

---

## 📞 Endpoints da API

### Base URL
```
Produção: https://labmotors-testedetraavis.onrender.com/api
Local: http://localhost:5284/api
```

### Endpoints Disponíveis

#### Autenticação
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login

#### Clientes
- `GET /api/Cliente` - Lista todos
- `GET /api/Cliente/{id}` - Busca por ID
- `POST /api/Cliente` - Cria novo
- `PUT /api/Cliente/{id}` - Atualiza
- `DELETE /api/Cliente/{id}` - Remove

#### Peças
- `GET /api/Peca` - Lista todas
- `GET /api/Peca/{id}` - Busca por ID
- `POST /api/Peca` - Adiciona nova
- `PUT /api/Peca/{id}` - Atualiza
- `DELETE /api/Peca/{id}` - Remove

#### Serviços
- `GET /api/Servico` - Lista todos
- `GET /api/Servico/{id}` - Busca por ID
- `POST /api/Servico/SolicitarServico` - Cria agendamento
- `DELETE /api/Servico/{id}` - Remove

#### Ordens de Serviço
- `GET /api/OrdemServico` - Lista todas
- `GET /api/OrdemServico/{id}` - Busca por ID
- `GET /api/OrdemServico/por-placa/{placa}` - Busca por placa
- `PUT /api/OrdemServico/{id}/status` - Atualiza status
- `DELETE /api/OrdemServico/{id}` - Remove (cascade)

---

## ✅ Checklist de Funcionalidades

- [x] Sistema de autenticação (login/registro)
- [x] Agendamento de serviços com validação
- [x] Kanban board com drag-and-drop
- [x] Rastreamento de serviços (por placa/ID)
- [x] Painel administrativo (CRUD peças/clientes)
- [x] Deleção em cascata (ordem → serviço)
- [x] Validação de horários duplicados
- [x] Interface responsiva
- [x] Notificações de sucesso/erro
- [x] Persistência no banco de dados

---

## 🔮 Melhorias Futuras

1. **Segurança**
   - Hash de senhas (BCrypt)
   - JWT tokens para autenticação
   - Rate limiting

2. **Funcionalidades**
   - Notificações por email
   - Relatórios e gráficos
   - Upload de imagens
   - Histórico de serviços

3. **Performance**
   - Cache de consultas frequentes
   - Paginação nas listagens
   - Lazy loading

4. **UX**
   - Loading states
   - Confirmações de ações
   - Melhor feedback visual

---

## 📖 Como Usar Este Guia

1. **Para Desenvolvedores Novos**: Comece pela seção "Estrutura de Pastas"
2. **Para Entender Funcionalidades**: Veja "Fluxos Principais"
3. **Para Configurar**: Veja "Deploy e Configuração"
4. **Para Debugar**: Veja "Troubleshooting"
5. **Para Referência Rápida**: Veja "Endpoints da API"

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0

