# Documentação da API — Gestão de Usuários

## Parte 1 — Modelagem da API

| Método | Endpoint | Finalidade | Autorização | Resposta esperada |
|---|---|---|---|---|
| POST | `/api/auth/login` | Autentica um usuário (e-mail + senha) e retorna um token JWT | Pública | `200 OK` (sucesso) / `401 Unauthorized` (credenciais inválidas) |
| GET | `/api/users` | Lista usuários — admin/operator veem todos, client vê apenas o próprio registro | admin, operator, client | `200 OK` |
| GET | `/api/users/:id` | Consulta um usuário específico | admin, operator, client (client só o próprio id) | `200 OK` / `403 Forbidden` / `404 Not Found` |
| POST | `/api/users` | Cria um novo usuário | admin | `201 Created` / `400 Bad Request` |
| PUT | `/api/users/:id` | Atualiza nome, e-mail, senha e (somente admin) perfil de um usuário | admin, operator, client (cada um dentro do seu escopo) | `200 OK` / `403 Forbidden` / `404 Not Found` |
| DELETE | `/api/users/:id` | Remove um usuário do sistema | admin | `204 No Content` / `403 Forbidden` / `404 Not Found` |

### Exemplo — POST /api/auth/login

Requisição:
```json
{ "email": "admin@empresa.com", "senha": "Admin@123" }
```

Resposta (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "name": "Administrador", "email": "admin@empresa.com", "role": "admin" }
}
```

### Exemplo — POST /api/users (requer header `Authorization: Bearer <token>`)

Requisição:
```json
{ "name": "Cliente Um", "email": "cliente@empresa.com", "senha": "Cliente@123", "role": "client" }
```

Resposta (201):
```json
{ "id": 3, "name": "Cliente Um", "email": "cliente@empresa.com", "role": "client", "created_at": "2026-09-21 23:06:36" }
```

## Parte 2 — Segurança com JWT

**Processo de login**: o usuário envia `email` e `senha` em `POST /api/auth/login`. O backend busca o usuário pelo e-mail e compara a senha informada com o hash armazenado usando `bcrypt.compareSync`. Se não houver correspondência, a API responde `401` com uma mensagem genérica ("Credenciais inválidas"), sem revelar se o e-mail existe ou não.

**Geração do token**: em caso de sucesso, o backend assina um JWT com `jsonwebtoken`, usando um segredo (`JWT_SECRET`) mantido apenas no servidor (variável de ambiente, nunca no código-fonte).

**Informações armazenadas no token (payload)**:
- `sub`: id do usuário;
- `name`: nome do usuário;
- `role`: perfil de acesso (`admin`, `operator` ou `client`);
- `iat`: data/hora de emissão (adicionada automaticamente pela biblioteca).

A senha e o hash da senha **nunca** são incluídos no payload.

**Política de expiração**: o token expira em **1 hora** (`JWT_EXPIRES_IN=1h`). Essa escolha busca equilibrar usabilidade (o usuário não precisa logar a cada poucos minutos) com segurança (em caso de roubo do token, a janela de uso indevido é curta). Ao expirar, o middleware `authenticateToken` rejeita a requisição com `401` e o front-end força um novo login.

## Parte 3 — Controle de acesso (RBAC)

| Perfil | Listar usuários | Consultar usuário | Criar usuário | Atualizar usuário | Excluir usuário |
|---|---|---|---|---|---|
| **Administrador** | Todos | Qualquer um | Sim | Qualquer um, incluindo o perfil (`role`) | Sim |
| **Operador** | Todos | Qualquer um | Não | Qualquer um, exceto o campo `role` | Não |
| **Cliente** | Apenas o próprio registro | Apenas o próprio id | Não | Apenas os próprios dados, sem alterar o próprio `role` | Não |

A aplicação dessas regras acontece em duas camadas no backend:
1. **Middleware `authorize(...roles)`** (`backend/src/middleware/auth.js`): bloqueia o acesso à rota inteira para perfis não permitidos (ex.: `POST /api/users` só passa por `authorize('admin')`).
2. **Regras finas no controller** (`backend/src/routes/users.js`): mesmo com o perfil autorizado a acessar a rota, o código verifica se o `client` está operando sobre o próprio `id`, e impede que qualquer perfil que não seja `admin` altere o campo `role`.

No front-end, os componentes (`UsersList`, `UserForm`) escondem botões e campos que o usuário logado não tem permissão de usar (ex.: botão "Excluir" só aparece para admin), mas a garantia real de segurança está no backend — a interface é apenas uma conveniência de UX.

## Parte 4 — OAuth 2.0 (explicação conceitual)

A API atual usa autenticação direta com JWT (o próprio usuário fornece e-mail/senha). Para permitir que uma **aplicação parceira** acesse a API em nome de um usuário, sem que esse usuário compartilhe sua senha com a aplicação parceira, o cenário recomendado é o fluxo **Authorization Code** do OAuth 2.0:

1. **Concessão de acesso**: a aplicação parceira redireciona o usuário para uma tela de autorização hospedada pela nossa aplicação (o "Authorization Server"). Nessa tela, o usuário faz login com suas credenciais (que só a nossa aplicação vê) e confirma explicitamente quais permissões está concedendo à aplicação parceira (ex.: "ler meus dados de usuário"). Após a confirmação, nossa aplicação redireciona de volta para a aplicação parceira com um `authorization code` de uso único.
2. **Utilização de tokens**: a aplicação parceira troca esse `authorization code` por um `access_token` (e opcionalmente um `refresh_token`) em uma chamada servidor-a-servidor. A partir daí, toda requisição da aplicação parceira à API inclui `Authorization: Bearer <access_token>`, exatamente como o JWT já usado hoje — o `access_token` funciona como um JWT com escopo e validade próprios, e pode ser revogado ou renovado sem afetar a senha do usuário.
3. **Benefícios**:
   - **Não compartilhamento de senha**: a aplicação parceira nunca vê a senha do usuário, apenas o token concedido.
   - **Delegação de permissões (escopos)**: o token pode carregar escopos restritos (ex.: `users:read`), limitando o que a aplicação parceira pode fazer, mesmo que o usuário tenha permissões mais amplas.
   - **Maior segurança**: tokens podem ter validade curta e ser revogados individualmente, sem exigir troca de senha; um vazamento do token de uma aplicação parceira não compromete a conta do usuário como um todo.

Esse fluxo não foi implementado no código desta atividade (conforme permitido pelo enunciado) — a API atual segue com autenticação direta via JWT.

## Parte 5 — Análise de segurança

| Risco | Descrição | Mitigação aplicada |
|---|---|---|
| Roubo/interceptação do token JWT | Um token capturado (ex.: em uma rede insegura) permite personificar o usuário até a expiração | Expiração curta (1 hora); em produção, a API deve ser servida exclusivamente via HTTPS para impedir a interceptação em trânsito |
| Senhas armazenadas em texto puro | Vazamento do banco de dados exporia as senhas de todos os usuários | Senhas nunca são armazenadas em texto puro — usamos hash com `bcrypt` (salt automático) antes de gravar no banco, e o hash nunca é retornado nas respostas da API |
| Acesso indevido a endpoints (escalonamento de privilégio) | Um usuário `client` ou `operator` poderia tentar criar/editar/excluir usuários fora do seu escopo | Controle de acesso baseado em perfis (RBAC) aplicado em middleware por rota e reforçado por verificações de propriedade (`client` só acessa o próprio registro) nos controllers |
| Injeção de SQL | Entradas maliciosas no `email`/`nome` poderiam manipular consultas ao banco | Todas as consultas usam *prepared statements* parametrizados do `better-sqlite3` (`db.prepare(...).run(valor)`), nunca concatenação de strings SQL |
| Força bruta no login | Tentativas repetidas de senha poderiam comprometer contas fracas | Mensagens de erro genéricas no login (não revelam se o e-mail existe); recomenda-se, para produção, adicionar um limitador de taxa (*rate limiting*) por IP/e-mail no endpoint de login |
