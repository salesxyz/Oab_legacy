# OAB Mentoria — Backend / API

Backend da plataforma OAB Mentoria: autenticação, conteúdos, questões, simulados, gamificação e painel administrativo.

> Esta é a **primeira fase** do projeto (backend + banco de dados). Website, aplicativo mobile e painel administrativo (frontend) são fases seguintes, que consumirão esta mesma API.

## Stack

- **Runtime**: Node.js 20+ (testado com Node 22)
- **Framework**: Express **5** (async/await nativo — não é mais necessário `express-async-errors`)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) (ver nota abaixo)
- **Banco de dados**: PostgreSQL
- **Autenticação**: JWT (access token) + refresh token opaco com rotação, armazenado com hash
- **Validação**: Zod **4**
- **Segurança**: Helmet, rate limiting, CORS configurável, bcrypt (senhas), hashing de código de recuperação
- **Logs**: Winston
- **Dev runner**: [tsx](https://tsx.is/) (hot-reload rápido baseado em esbuild)
- **Testes**: Jest + Supertest
- **Documentação**: Swagger / OpenAPI em `/docs`

### Notas sobre versões (por que não "a mais nova de tudo, sempre")

Esta seção documenta escolhas deliberadas onde "mais recente" foi pesado contra "não quebra":

- **Express 5**: migrado de v4. Principal mudança de comportamento: `req.query` passou a ser uma propriedade somente-leitura (getter) — qualquer atribuição direta (`req.query = ...`) agora lança `TypeError` em runtime. O middleware de validação (`src/middlewares/validate.middleware.ts`) foi ajustado para usar `Object.defineProperty` em vez de atribuição direta. Rotas com parâmetros (`req.params.id`) também mudaram de tipo (`string` → `string | string[]`, pois o `path-to-regexp` v8 agora suporta parâmetros repetidos); centralizamos isso no helper `src/utils/params.ts` (`paramId`) em vez de espalhar `as string` pelo código.
- **Zod 4**: migrado de v3. `AnyZodObject` foi removido do pacote; usamos `z.ZodType` no lugar. O restante da API (`.parse`, `.safeParse`, `.flatten()`, `z.coerce`, `.email()`, `.uuid()`) permaneceu compatível.
- **`ts-node-dev` → `tsx`**: `ts-node-dev` não recebe publicações desde 2022 (projeto efetivamente abandonado). Trocado pelo `tsx`, hoje o padrão de facto para rodar TypeScript em desenvolvimento com hot-reload.
- **TypeScript fixado em `^5.9.3` (não `7.x`)**: o TypeScript 7 já foi lançado, mas o `ts-jest@29` (usado pelos testes) declara `peerDependencies: { typescript: '>=4.3 <7' }` — ou seja, exclui explicitamente a v7. Atualizar quebraria a suíte de testes. Ficamos na última versão estável da série 5.x até o ecossistema de testes suportar a v7.
- **`@types/node` fixado em `^22.x` (não `26.x`)**: o pacote de tipos mais recente descreve APIs de uma versão do Node ainda mais nova que a runtime realmente instalada neste projeto (Node 22 LTS). Usar tipos de uma versão futura do Node pode fazer o TypeScript "aceitar" APIs que não existem de fato no ambiente de execução. Se você fizer deploy em Node 24/26, atualize `@types/node` de acordo.
- **`uuid` removido**: não era utilizado em nenhum lugar do código — o Drizzle já gera UUIDs via `defaultRandom()` no próprio Postgres. Dependência morta removida para reduzir superfície de ataque e tamanho do `node_modules`.
- **Vulnerabilidade conhecida e aceita**: `npm audit` reporta uma vulnerabilidade moderada em `esbuild`, usada internamente pelo `drizzle-kit` (ferramenta de desenvolvimento) para carregar o arquivo de configuração — nunca roda em produção. `npm audit fix --force` rebaixaria o `drizzle-kit` para `0.18.1` (bem mais antigo que o atual `0.31.10`), o que seria um retrocesso real de funcionalidade para mitigar um risco que não existe no seu ambiente de produção. Deixamos como está; reavalie quando o `drizzle-kit` publicar uma versão com o `esbuild` corrigido internamente.

### Por que Drizzle em vez de Prisma?

O escopo original sugere Prisma. Prisma depende de um binário nativo ("query engine") baixado de `binaries.prisma.sh` durante a instalação. Em alguns ambientes corporativos/CI com bloqueio de rede a esse domínio, isso impede completamente o `prisma generate`/`migrate`. Drizzle é 100% TypeScript, usa o driver `pg` puro (sem binário nativo) e é uma ORM madura e amplamente adotada — uma alternativa direta e sem essa dependência de rede. Se o seu ambiente não tiver essa restrição, a migração para Prisma é possível, mas não é necessária.

## Estrutura do projeto

```
backend/
├── src/
│   ├── app.ts                 # montagem do Express (middlewares + rotas)
│   ├── server.ts              # bootstrap: sobe o servidor HTTP
│   ├── config/                # env, logger
│   ├── controllers/           # camada HTTP (request/response)
│   ├── services/               # regras de negócio
│   ├── repositories/          # acesso direto ao banco (Drizzle)
│   ├── routes/                 # definição de rotas + validação + RBAC
│   ├── middlewares/            # auth, rbac, validação, rate limit, erros
│   ├── schemas/                 # schemas Zod
│   ├── db/
│   │   ├── client.ts           # pool + instância do Drizzle
│   │   ├── schema/              # definição das tabelas
│   │   └── seed.ts              # dados iniciais de desenvolvimento
│   ├── docs/swagger.ts
│   └── utils/
├── drizzle/                    # migrations SQL geradas
├── tests/                      # testes de integração (Jest + Supertest)
├── drizzle.config.ts
├── .env.example
└── package.json
```

## Pré-requisitos

- Node.js 20+
- PostgreSQL 14+ rodando localmente ou acessível via rede

## Instalação

```bash
cd backend
npm install
```

## Configuração do `.env`

```bash
cp .env.example .env
```

Edite o `.env` com seus valores. Principais variáveis:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `VIDEO_STORAGE_DIR` | Diretório local dos uploads de vídeo; em produção, substitua por um storage de objetos |
| `VIDEO_MAX_SIZE_MB` | Tamanho máximo de cada videoaula (padrão: 500 MB) |
| `JWT_SECRET` / `REFRESH_TOKEN_SECRET` | Segredos para assinatura de tokens — **gere valores fortes e únicos em produção** |
| `EMAIL_PROVIDER` | `console` (padrão, apenas loga) \| `resend` \| `sendgrid` \| `smtp` |
| `EMAIL_API_KEY` | Chave da API do provedor de email escolhido |
| `CORS_ALLOWED_ORIGINS` | Origens permitidas, separadas por vírgula |
| `SEED_TEST_USER_EMAIL` / `SEED_TEST_USER_PASSWORD` | Credenciais do usuário de teste (seed) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Credenciais do admin (seed) |
| `SEED_MENTOR_EMAIL` / `SEED_MENTOR_PASSWORD` | Credenciais do mentor/professor (seed) |

⚠️ **As credenciais de seed são apenas para desenvolvimento.** Nunca as utilize como padrão em produção — o script de seed recusa-se a rodar se `NODE_ENV=production`.

## Banco de dados

Crie o banco (exemplo local):

```bash
createdb oab_mentoria
createdb oab_mentoria_test   # usado pelos testes automatizados
```

Gere e aplique as migrations:

```bash
npm run db:generate   # gera SQL a partir do schema em src/db/schema
npm run db:migrate    # aplica as migrations no banco definido em DATABASE_URL
```

Popule com dados iniciais (usuário de teste, admin, curso, questões, simulado, dicas, conquistas):

```bash
npm run db:seed
```

Após o seed, você pode logar com:
- **Aluno de teste**: `teste@exemplo.com` / `SenhaTeste123!`
- **Admin**: `admin@exemplo.com` / `AdminTeste123!`
- **Mentor/Professor**: `professor@exemplo.com` / `ProfessorTeste123!` — usuário real no banco com `role: MENTOR`, RBAC já bloqueia esse papel de rotas `/admin/*`. **Não existem endpoints específicos de mentor ainda** (ex.: "meus alunos", "dúvidas") — isso é trabalho futuro; hoje o papel só existe para autenticação e diferenciação de permissões.

(valores configuráveis via `.env`)

## Rodando em desenvolvimento

```bash
npm run dev
```

A API sobe em `http://localhost:3333` (ou a porta definida em `PORT`).

- Health check: `GET /health`
- Documentação Swagger: `GET /docs`

## Build e execução em produção

```bash
npm run build
npm start
```

## Testes

Os testes rodam contra um banco PostgreSQL **real** (não usam mocks), definido em `.env.test`. Crie/aponte para um banco de testes dedicado antes de rodar:

```bash
cp .env .env.test
# edite .env.test para apontar DATABASE_URL para oab_mentoria_test e NODE_ENV=test

npm run db:migrate -- (com DATABASE_URL de .env.test)
npm test
```

Os testes cobrem: cadastro/login/logout, refresh com rotação e revogação, recuperação de senha, RBAC (aluno vs admin), CRUD de conteúdo, criação e resposta de questões (garantindo que a alternativa correta nunca é revelada antes da resposta), fluxo completo de simulado, e tratamento de erros sem vazamento de stack trace.

## Endpoints principais

Documentação interativa completa em `/docs`. Resumo:

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/logout-all
POST   /auth/forgot-password
POST   /auth/verify-code
POST   /auth/reset-password
POST   /auth/change-password

GET    /courses                        GET    /courses/:id
POST   /courses (admin)                 PATCH  /courses/:id (admin)
GET    /courses/:courseId/modules       POST   /modules (admin)
GET    /modules/:moduleId/contents      POST   /contents (admin)
POST   /contents/:id/progress           (aluno autenticado)

GET    /questions                       GET    /questions/:id
POST   /questions (admin)               POST   /questions/:id/answer
GET    /questions/history               GET    /questions/performance

GET    /simulations                     POST   /simulations (admin)
POST   /simulations/:id/start           POST   /simulations/:id/finish
GET    /simulations/my-results

GET    /tips/of-the-day                 GET/POST/PATCH/DELETE /tips (admin)

GET    /profile                         PATCH  /profile
GET    /progress                        GET    /achievements
GET    /ranking

GET    /admin/dashboard                 GET    /admin/users
PATCH  /admin/users/:id/status          PATCH  /admin/users/:id/role

GET    /health
```

## Segurança implementada

- Senhas com bcrypt (12 rounds); nunca armazenadas em texto puro
- Refresh tokens opacos, armazenados apenas como hash SHA-256, com rotação e revogação
- Códigos de recuperação de senha hasheados, com expiração e limite de tentativas; nunca logados
- Respostas de login/recuperação de senha genéricas — não permitem enumerar usuários cadastrados
- Bloqueio temporário de conta após múltiplas tentativas de login falhas
- RBAC real no backend (nunca confia em validações do frontend); todo endpoint administrativo exige token + papel `ADMIN`
- Rate limiting geral e um limite mais rígido específico para rotas de autenticação
- Helmet, CORS configurável por ambiente, sanitização/validação de todas as entradas via Zod
- Erros nunca vazam stack trace ou detalhes internos ao cliente
- `.env.example` documentado; nenhum segredo real no repositório

## Próximos passos (fora do escopo desta fase)

- Website (React + Tailwind) consumindo esta API
- App mobile (Expo + React Native)
- Painel administrativo (frontend) consumindo os endpoints `/admin/*`
- Envio real de email em produção (basta configurar `EMAIL_PROVIDER` e `EMAIL_API_KEY`)
- Termos de Uso / Política de Privacidade (LGPD) como conteúdo estático no frontend
