# API REST Segura para Gestão de Usuários

Atividade da disciplina **Sistemas Web Seguros**: uma API REST para gerenciamento de usuários, com autenticação via JWT, controle de acesso por perfil (RBAC) e um front-end em React para demonstrar as funcionalidades.

## Objetivo do projeto

Disponibilizar uma API REST segura para cadastro, consulta, atualização e exclusão de usuários, aplicando na prática conceitos de autenticação, autorização e segurança de aplicações web estudados na disciplina. A aplicação possui três perfis de acesso — **Administrador**, **Operador** e **Cliente** — cada um com permissões distintas sobre os recursos da API.

A documentação completa dos endpoints, do funcionamento do JWT, do RBAC, da explicação conceitual de OAuth 2.0 e da análise de riscos de segurança está em [`docs/API.md`](docs/API.md).

## Tecnologias utilizadas

**Back-end** (`backend/`):
- Node.js + Express
- SQLite (`better-sqlite3`)
- JWT (`jsonwebtoken`) para autenticação
- `bcryptjs` para hash de senhas
- `helmet` e `cors` para segurança HTTP

**Front-end** (`src/`):
- React 19 + React Router

**Infraestrutura**:
- Docker / Docker Compose
- GitHub Actions (CI)

## Como instalar

Pré-requisitos: Node.js 20+ e npm (ou Docker, para rodar via `docker-compose`).

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

### Frontend

Na raiz do repositório:

```bash
npm install
```

## Como executar

### Opção 1 — manualmente (dois terminais)

Terminal 1 — backend (porta 3001):
```bash
cd backend
npm start
```

Terminal 2 — frontend (porta 3000):
```bash
npm start
```

Acesse [http://localhost:3000](http://localhost:3000).

### Opção 2 — Docker Compose

Na raiz do repositório:
```bash
docker-compose up --build
```

O front-end fica disponível em `http://localhost:3000` e a API em `http://localhost:3001`.

### Usuário administrador inicial

Ao subir pela primeira vez, o backend cria automaticamente um usuário administrador (seed), usando as variáveis de ambiente `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` (padrões em `backend/.env.example`: `admin@empresa.com` / `Admin@123`). Use essas credenciais para o primeiro login e, a partir dele, cadastre os usuários `operator` e `client`.

## Como testar a aplicação

### Pela interface web

1. Acesse `http://localhost:3000` e faça login com o usuário administrador.
2. Cadastre um usuário `operator` e um `client` na tela "Novo usuário".
3. Explore a listagem de usuários, edição e exclusão — as ações disponíveis mudam de acordo com o perfil logado.
4. Saia (`Sair`) e entre novamente com o `operator` e o `client` para observar as diferenças de permissão (RBAC).
5. A resposta bruta da última chamada à API é exibida em cada tela, para acompanhar o comportamento real do backend.

### Via Postman/Insomnia (ou curl)

Exemplo de login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","senha":"Admin@123"}'
```

Use o `token` retornado no header `Authorization: Bearer <token>` para acessar os demais endpoints descritos em [`docs/API.md`](docs/API.md).

## Estrutura do repositório

```
backend/       API REST (Express + SQLite + JWT)
src/           Front-end (React)
docs/API.md    Documentação da API (endpoints, JWT, RBAC, OAuth 2.0, riscos)
docker-compose.yml
```
