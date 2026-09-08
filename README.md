# OAB Mentoria

Plataforma de preparação para o exame da OAB, formada por uma API em Node.js/Express, banco PostgreSQL e aplicação web em React. O projeto é organizado como um monorepo npm com dois workspaces: `backend` e `web`.

A plataforma oferece autenticação, cursos, conteúdos, questões, simulados, progresso, gamificação, ranking, perfil do aluno, recursos administrativos e área do professor/mentor.

## Visão geral

```text
OAB Mentoria
├── backend/   API REST, regras de negócio, banco e testes de integração
├── web/       Aplicação React para alunos, administradores e professores
└── scripts/   Automação de configuração inicial do ambiente
```

### Stack principal

- **Runtime:** Node.js 20+
- **Gerenciador:** npm com workspaces
- **Backend:** Express 5 + TypeScript
- **Banco:** PostgreSQL
- **ORM e migrations:** Drizzle ORM / Drizzle Kit
- **Validação:** Zod 4
- **Autenticação:** JWT de curta duração + refresh token com rotação
- **Frontend:** React 19 + TypeScript + Vite
- **Roteamento:** React Router
- **Estilos:** CSS puro e CSS Modules
- **Testes:** Jest + Supertest
- **Documentação da API:** Swagger/OpenAPI

## Pré-requisitos

- Node.js 20 ou superior
- npm
- PostgreSQL 14 ou superior
- Git

O PostgreSQL precisa estar acessível pela `DATABASE_URL`. Em uma instalação local, também é útil ter os comandos `createdb` e `psql` disponíveis no `PATH`, pois o script de setup pode criar os bancos automaticamente.

## Instalação rápida

Na raiz do projeto:

```bash
npm install
npm run setup
npm run dev
```

O comando `npm run setup`:

1. Verifica Node.js, npm e ferramentas do PostgreSQL.
2. Cria `backend/.env` e `web/.env` a partir dos arquivos `.env.example`, sem sobrescrever arquivos existentes.
3. Tenta criar os bancos de desenvolvimento e teste.
4. Aplica as migrations.
5. Popula o banco de desenvolvimento com dados de exemplo.

Depois disso:

- Aplicação web: http://localhost:5173
- API: http://localhost:3333
- Health check: http://localhost:3333/health
- Swagger: http://localhost:3333/docs

Se o PostgreSQL estiver em outro computador, container ou serviço gerenciado, crie os bancos manualmente e ajuste `backend/.env` antes de executar as migrations.

## Primeiro acesso

O seed cria usuários de desenvolvimento. As credenciais padrão são:

| Perfil | Email | Senha |
|---|---|---|
| Aluno | `teste@exemplo.com` | `SenhaTeste123!` |
| Administrador | `admin@exemplo.com` | `AdminTeste123!` |
| Professor/mentor | `professor@exemplo.com` | `ProfessorTeste123!` |

Esses valores podem ser alterados no `backend/.env`. Eles são exclusivos para desenvolvimento e nunca devem ser usados em produção.

## Comandos

### Raiz do projeto

| Comando | Função |
|---|---|
| `npm install` | Instala as dependências dos dois workspaces |
| `npm run setup` | Configura o ambiente, banco, migrations e seed |
| `npm run dev` | Sobe backend e frontend simultaneamente |
| `npm run dev:backend` | Sobe somente a API |
| `npm run dev:web` | Sobe somente o frontend |
| `npm run build` | Compila backend e frontend para produção |
| `npm test` | Executa os testes de integração do backend |
| `npm run db:migrate` | Aplica migrations no banco configurado |
| `npm run db:seed` | Popula o banco com dados de desenvolvimento |

### Backend

Execute a partir de `backend/` ou use os comandos equivalentes com `--workspace=backend`:

```bash
npm run dev          # desenvolvimento com hot reload
npm run build        # type-check e compilação para dist/
npm start            # executa dist/server.js
npm test             # Jest + Supertest
npm run db:generate  # gera uma nova migration a partir do schema
npm run db:migrate   # aplica migrations
npm run db:studio    # abre o Drizzle Studio
npm run db:seed      # insere dados de exemplo
```

### Frontend

Execute a partir de `web/` ou use `npm run <comando> --workspace=web`:

```bash
npm run dev       # servidor Vite
npm run build     # tsc -b + build de produção
npm run lint      # Oxlint
npm run preview   # visualiza o build de produção
```

## Configuração de ambiente

Os arquivos de exemplo ficam em:

- `backend/.env.example`
- `backend/.env.test.example`
- `web/.env.example`

### Backend

As variáveis mais importantes são:

| Variável | Uso |
|---|---|
| `NODE_ENV` | `development`, `test`, `staging` ou `production` |
| `PORT` | Porta HTTP da API; padrão `3333` |
| `DATABASE_URL` | String de conexão PostgreSQL |
| `JWT_SECRET` | Segredo do access token; mínimo de 16 caracteres |
| `JWT_EXPIRES_IN` | Validade do access token; padrão `15m` |
| `REFRESH_TOKEN_SECRET` | Segredo usado no fluxo de refresh |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | Validade do refresh token; padrão `30` dias |
| `EMAIL_PROVIDER` | `console`, `resend`, `sendgrid` ou `smtp` |
| `EMAIL_API_KEY` | Chave do provedor de email, quando aplicável |
| `CORS_ALLOWED_ORIGINS` | Origens permitidas, separadas por vírgula |
| `VIDEO_STORAGE_DIR` | Diretório local dos vídeos enviados |
| `VIDEO_MAX_SIZE_MB` | Tamanho máximo de cada vídeo |

Em produção, use segredos fortes e únicos, storage de objetos para vídeos, banco gerenciado e um provedor real de email. Não versione arquivos `.env`.

### Frontend

```env
VITE_API_URL=http://localhost:3333
```

O frontend usa essa URL para chamar a API. O cliente HTTP também trabalha com as rotas versionadas `/api/v1` e mantém compatibilidade com os aliases sem versão.

## Banco de dados

O banco de desenvolvimento padrão é `oab_mentoria`. A suíte de testes usa um banco separado, normalmente `oab_mentoria_test`.

Criação manual dos bancos:

```bash
createdb oab_mentoria
createdb oab_mentoria_test
```

Aplicação das migrations no banco de desenvolvimento:

```bash
npm run db:migrate
```

Para executar os testes, crie `backend/.env.test` a partir de `backend/.env.test.example` e garanta que `DATABASE_URL` aponte para o banco de teste. Os testes usam PostgreSQL real e podem limpar/recriar dados durante a execução; nunca aponte esse arquivo para o banco de desenvolvimento ou produção.

## Funcionalidades

### Autenticação e sessão

- Cadastro, login, logout e logout de todas as sessões
- Access token JWT em memória no frontend
- Refresh token com rotação e revogação no backend
- Recuperação e troca de senha
- Código de recuperação com expiração e limite de tentativas
- Proteção contra enumeração de usuários
- Bloqueio temporário após tentativas de login malsucedidas

### Área do aluno

- Dashboard com XP, nível, sequência de dias e dica do dia
- Cursos, módulos e conteúdos
- Registro de progresso e crédito de XP
- Questões por disciplina e dificuldade
- Feedback e explicação após responder uma questão
- Simulados com cronômetro, finalização e resultado por disciplina
- Ranking e privacidade do perfil
- Conquistas e desempenho por disciplina
- Tela de assinatura preparada para a evolução do produto

### Administração e professores

- Dashboard administrativo
- Gestão de usuários e papéis
- Recursos para professor/mentor
- Consulta de alunos e progresso
- Gestão de aulas, questões e simulados no frontend
- RBAC aplicado no backend para proteger operações administrativas

A área de professor possui atualmente o endpoint `GET /mentor/students`. Novos fluxos específicos de mentor podem ser ampliados conforme os endpoints de negócio forem implementados.

## Rotas da aplicação web

### Públicas

| Rota | Tela |
|---|---|
| `/` | Landing page |
| `/entrar` | Login |
| `/cadastro` | Cadastro |
| `/recuperar-senha` | Recuperação de senha |

### Aluno, com autenticação

| Rota | Tela |
|---|---|
| `/app` | Dashboard |
| `/app/cursos` | Lista de cursos |
| `/app/cursos/:courseId` | Detalhes do curso |
| `/app/cursos/:courseId/modulos/:moduleId` | Módulo |
| `/app/cursos/:courseId/modulos/:moduleId/conteudos/:contentId` | Conteúdo |
| `/app/questoes` | Lista de questões |
| `/app/questoes/:questionId` | Resolução de questão |
| `/app/simulados` | Lista de simulados |
| `/app/simulados/:simulationId` | Execução e resultado do simulado |
| `/app/ranking` | Ranking |
| `/app/perfil` | Perfil e desempenho |
| `/app/assinatura` | Assinatura |

### Backoffice

| Rota | Tela |
|---|---|
| `/admin` | Dashboard administrativo |
| `/admin/usuarios` | Usuários |
| `/admin/perfil` | Perfil do administrador |
| `/professor` | Dashboard do professor |
| `/professor/alunos` | Alunos e progresso |
| `/professor/materias` | Matérias |
| `/professor/aulas` | Conteúdos/aulas |
| `/professor/questoes` | Questões |
| `/professor/simulados` | Simulados |
| `/professor/desempenho` | Desempenho |
| `/professor/perfil` | Perfil do professor |

A proteção visual dessas rotas não substitui autorização: as permissões reais são sempre verificadas pela API.

## API

A API está disponível com prefixo versionado:

```text
http://localhost:3333/api/v1
```

Também existe um alias compatível sem prefixo de versão, por exemplo `POST /auth/login`.

Principais grupos de endpoints:

```text
POST   /auth/register              POST   /auth/login
POST   /auth/refresh               POST   /auth/logout
POST   /auth/logout-all            POST   /auth/forgot-password
POST   /auth/verify-code           POST   /auth/reset-password
POST   /auth/change-password

GET    /courses                    GET    /courses/:id
GET    /courses/:courseId/modules  GET    /modules/:moduleId/contents
POST   /contents/:id/progress

GET    /questions                  GET    /questions/:id
POST   /questions/:id/answer       GET    /questions/history
GET    /questions/performance

GET    /simulations                POST   /simulations/:id/start
POST   /simulations/:id/finish     GET    /simulations/my-results

GET    /tips/of-the-day
GET    /profile                    PATCH  /profile
GET    /progress                   GET    /achievements
GET    /ranking

GET    /admin/dashboard            GET    /admin/users
PATCH  /admin/users/:id/status     PATCH  /admin/users/:id/role
GET    /mentor/students

GET    /health                     GET    /docs
```

A especificação interativa e os schemas das requisições estão disponíveis no Swagger em `/docs`.

## Arquitetura

### Backend

```text
backend/src/
├── app.ts                 # Express, middlewares e montagem das rotas
├── server.ts              # inicialização do servidor HTTP
├── config/                # ambiente e logger
├── controllers/           # entrada HTTP e respostas
├── services/               # regras de negócio
├── repositories/          # acesso ao PostgreSQL via Drizzle
├── routes/                # rotas, autenticação, validação e RBAC
├── middlewares/            # segurança, validação, upload e erros
├── schemas/               # schemas Zod
├── db/schema/             # tabelas do banco
├── db/seed.ts              # dados de desenvolvimento
├── docs/swagger.ts         # especificação OpenAPI
└── utils/                 # erros e utilitários compartilhados
```

### Frontend

```text
web/src/
├── App.tsx                # providers e rotas
├── components/            # componentes reutilizáveis e autenticação
├── contexts/              # sessão e notificações
├── hooks/                 # hooks de consulta e estado
├── layouts/               # layouts público, aluno e backoffice
├── pages/                 # páginas públicas, aluno e backoffice
├── services/              # cliente HTTP e APIs de domínio
├── styles/                # tokens, reset e estilos globais
├── types/                 # contratos TypeScript
├── data/                  # textos e dados da interface
└── utils/                 # validações e tratamento de erros
```

## Segurança

- Helmet, CORS configurável, compressão e rate limiting
- Senhas armazenadas com bcrypt
- Refresh tokens armazenados como hash, com rotação e revogação
- Validação de entradas com Zod
- RBAC no backend para papéis `STUDENT`, `ADMIN` e `MENTOR`
- Erros sem stack trace ou detalhes internos para o cliente
- Códigos de recuperação com hash, expiração e limite de tentativas
- Access token mantido apenas em memória no frontend
- Refresh token persistido no storage do navegador por necessidade da implementação atual

A persistência do refresh token acessível por JavaScript é uma concessão conhecida. Para um endurecimento de produção, o backend deve migrar para cookie `httpOnly`, `Secure` e `SameSite=Strict`.

## Testes e validação

A suíte do backend é de integração: usa Jest, Supertest e um PostgreSQL separado. Ela cobre autenticação, refresh e revogação de tokens, recuperação de senha, RBAC, conteúdos, questões, simulados e tratamento de erros.

Comandos recomendados antes de enviar alterações:

```bash
npm run build
npm test
npm run lint --workspace=web
```

Para uma validação manual completa, inicie o backend e o frontend com `npm run dev`, acesse a aplicação e verifique os fluxos de login, cursos, questões e simulados. O Swagger pode ser usado para inspecionar e exercitar diretamente a API.

## Produção

O build completo é gerado com:

```bash
npm run build
```

Depois, o backend pode ser iniciado com:

```bash
npm start --workspace=backend
```

O frontend gera os arquivos estáticos em `web/dist`, que devem ser publicados em um servidor web ou CDN. Configure `VITE_API_URL`, `DATABASE_URL`, segredos JWT, CORS, email e storage de vídeos conforme o ambiente de deploy.

Antes de publicar:

- Troque todos os segredos e credenciais de seed.
- Não use `EMAIL_PROVIDER=console` para recuperação de senha real.
- Configure HTTPS e cookies seguros quando a estratégia de sessão for migrada.
- Use PostgreSQL e storage de vídeos adequados para produção.
- Restrinja `CORS_ALLOWED_ORIGINS` aos domínios reais.
- Execute migrations de forma controlada e faça backup do banco.

## Próximos passos conhecidos

- Completar e ampliar os endpoints específicos da área de professor/mentor.
- Integrar assinaturas e pagamentos reais.
- Migrar refresh token para cookie `httpOnly`.
- Adicionar páginas de Termos de Uso e Política de Privacidade (LGPD).
- Configurar validação visual automatizada com navegador headless no pipeline de CI.

## Licença

O projeto ainda não define uma licença de distribuição pública no repositório.
