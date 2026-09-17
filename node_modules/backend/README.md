# OAB Mentoria API

API backend da plataforma de preparação para a OAB, desenvolvida para uso interno do produto e operação comercial da solução.

> Este projeto é privado e não é open source. O conteúdo deste repositório deve ser usado apenas para desenvolvimento, manutenção e operação da aplicação sob a propriedade e autorização do projeto.

## Visão geral

- Node.js + Express
- TypeScript
- PostgreSQL + Drizzle ORM
- JWT para autenticação
- Swagger/OpenAPI em `/docs`
- Middleware de segurança, validação e RBAC
- Stack interna de produção para operação do produto

## Stack

- Runtime: Node.js 20+
- Framework: Express 5
- ORM: Drizzle ORM
- Banco: PostgreSQL
- Validação: Zod
- Segurança: Helmet, CORS, rate limiting, bcrypt
- Documentação: Swagger UI
- Testes: Jest + Supertest

## Estrutura principal

```bash
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── docs/
│   ├── middlewares/
│   ├── repositories/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   └── utils/
├── drizzle/
├── tests/
├── .env.example
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Requisitos

- Node.js 20+
- PostgreSQL em execução
- npm ou pnpm

## Instalação

```bash
cd backend
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

As variáveis principais são:

```env
PORT=3333
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:5432/oab_mentoria
JWT_SECRET=troque_este_valor
JWT_REFRESH_SECRET=troque_este_valor
APP_URL=http://localhost:3333
WEB_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
EMAIL_PROVIDER=console
EMAIL_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
VIDEO_STORAGE_DIR=./storage/videos
VIDEO_MAX_SIZE_MB=500
```

> Em produção, os secrets devem ser reais e fortes. Nunca deixar valores padrão ou de exemplo em produção.

## Banco de dados

Gerar e aplicar migrations:

```bash
npm run db:generate
npm run db:migrate
```

Seed inicial:

```bash
npm run db:seed
```

## Execução local

```bash
npm run dev
```

A API fica em:
- http://localhost:3333
- Swagger em http://localhost:3333/docs
- health check em http://localhost:3333/health

## Build

```bash
npm run build
```

Executar em produção:

```bash
npm start
```

## Swagger / OpenAPI

A documentação interativa está disponível em:

```text
/docs
```

Ela expõe endpoints de:
- Auth
- Courses
- Questions
- Simulations
- Profile
- Tips
- Admin
- Health

## Endpoints principais

### Autenticação

```http
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/logout-all
POST /auth/forgot-password
POST /auth/verify-code
POST /auth/reset-password
POST /auth/change-password
```

### Conteúdo

```http
GET /courses
GET /courses/:id
POST /courses
PATCH /courses/:id
DELETE /courses/:id

GET /courses/:courseId/modules
GET /modules/:id
POST /modules
PATCH /modules/:id
DELETE /modules/:id
POST /modules/reorder

GET /modules/:moduleId/contents
GET /contents/:id
POST /contents
PATCH /contents/:id
DELETE /contents/:id
POST /contents/upload-video
POST /contents/:id/progress
```

### Questões

```http
GET /questions
GET /questions/:id
GET /questions/subjects
GET /questions/history
GET /questions/performance
POST /questions
PATCH /questions/:id
DELETE /questions/:id
POST /questions/:id/answer
```

### Simulados

```http
GET /simulations
GET /simulations/:id
GET /simulations/my-results
POST /simulations
PATCH /simulations/:id
DELETE /simulations/:id
POST /simulations/:id/start
POST /simulations/:id/finish
```

### Perfil e gamificação

```http
GET /profile
PATCH /profile
PATCH /profile/preferences
GET /progress
GET /achievements
GET /ranking
GET /history/questions
GET /history/simulations
```

### Dicas

```http
GET /tips/of-the-day
GET /tips
POST /tips
PATCH /tips/:id
DELETE /tips/:id
```

### Admin

```http
GET /admin/dashboard
GET /admin/users
GET /admin/users/:id
PATCH /admin/users/:id/status
PATCH /admin/users/:id/role
PATCH /admin/users/:id/approval
```

### Pagamentos

```http
POST /payments/checkout
POST /payments/webhook/stripe
```

## Segurança

- Tokens JWT com expiração curta
- Refresh token com rotação e armazenamento seguro
- Senhas com bcrypt
- CORS configurado por ambiente
- Rate limiting nas rotas sensíveis
- Controle de acesso por RBAC
- Validação rigorosa com Zod
- Logs e erros sem expor stack trace em produção
- Proteção de dados e segredos conforme política interna do projeto

## Testes

```bash
npm test
```

A suíte valida fluxos importantes de autenticação, permissões, conteúdo e simulado.

## Observações de produção

- Defina `NODE_ENV=production` em servidor real.
- Use PostgreSQL real e não o banco local de desenvolvimento.
- Configure `EMAIL_PROVIDER` e Stripe com chaves reais.
- Ajuste `CORS_ALLOWED_ORIGINS` para seu domínio real.
- Garanta armazenamento persistente para vídeos. 
- Use PM2 + Nginx para atender em produção.

## Uso interno e operação

- manter este repositório em ambiente controlado
- usar apenas para desenvolvimento, manutenção e operação do produto
- não publicar código-fonte em repositórios públicos ou plataformas de código aberto
- manter segredos e credenciais fora do controle de versão
- seguir a política de deploy interna e de ambiente de produção do projeto

## Próximos passos

- configurar variáveis de produção
- conectar banco de produção
- subir backend em VPS/Hostinger
- publicar frontend
- configurar SSL e domínio
- validar fluxo completo de assinatura e webhook
