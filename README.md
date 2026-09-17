# OAB Mentoria

<<<<<<< HEAD
## Plataforma digital para preparação para a OAB

OAB Mentoria é uma plataforma educacional criada para acompanhar o aluno em toda a jornada de preparação para o Exame da Ordem: organização dos estudos, prática por questões, simulados, acompanhamento de desempenho e evolução contínua.

O produto reúne uma experiência web para alunos, professores e administradores, além de uma API estruturada para sustentar autenticação, conteúdo, avaliações, gamificação e gestão operacional.

> **Projeto proprietário:** este repositório apresenta uma solução comercial e não é open source. O código, os materiais, as regras de negócio e os dados pertencem ao projeto e não estão autorizados para redistribuição.

## Destaques do produto

- Jornada de estudos organizada por cursos, módulos, conteúdos e fases da preparação.
- Banco de questões com filtros, resolução, explicações e histórico de desempenho.
- Simulados com execução controlada, cronômetro e resultados por disciplina.
- Dashboard do aluno com progresso, XP, sequência de estudos, conquistas e ranking.
- Áreas específicas para administração e acompanhamento pedagógico por professores/mentores.
- Autenticação com sessão segura, recuperação de senha e controle de acesso por perfil.
- Base preparada para assinatura, pagamentos e evolução do produto em produção.

## Para apresentação e portfólio

Este README documenta a solução em nível de produto e engenharia. A publicação da documentação não concede acesso ao código-fonte, aos ambientes, às credenciais, aos dados dos usuários ou aos materiais protegidos da plataforma.

O projeto demonstra a construção de uma aplicação full stack com:

- arquitetura separada entre interface, API, regras de negócio e persistência;
- autenticação, autorização e proteção de rotas no backend;
- banco relacional com migrations versionadas;
- documentação de API com Swagger/OpenAPI;
- testes de integração e validação de build;
- estrutura preparada para deploy em ambiente de produção.

## Arquitetura do produto
=======
Plataforma de preparação para o exame da OAB, formada por uma API em Node.js/Express, banco PostgreSQL e aplicação web em React. O projeto é organizado como um monorepo npm com dois workspaces: `backend` e `web`.

A plataforma oferece autenticação, cursos, conteúdos, questões, simulados, progresso, gamificação, ranking, perfil do aluno, recursos administrativos e área do professor/mentor.

## Visão geral
>>>>>>> 67f607708ba738f9adee6119b6f169da9cb04592

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

<<<<<<< HEAD
## Ambiente de desenvolvimento
=======
## Instalação rápida
>>>>>>> 67f607708ba738f9adee6119b6f169da9cb04592

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

<<<<<<< HEAD
## Dados de demonstração

O ambiente de desenvolvimento possui um seed configurável para criar dados de teste, incluindo usuários com diferentes perfis de acesso, cursos, questões e simulados.

As credenciais não são publicadas neste documento. Consulte os arquivos de ambiente locais e a política interna de acesso ao projeto. Nenhuma credencial de desenvolvimento deve ser reutilizada em staging ou produção.
=======
## Primeiro acesso

O seed cria usuários de desenvolvimento. As credenciais padrão são:

| Perfil | Email | Senha |
|---|---|---|
| Aluno | `teste@exemplo.com` | `SenhaTeste123!` |
| Administrador | `admin@exemplo.com` | `AdminTeste123!` |
| Professor/mentor | `professor@exemplo.com` | `ProfessorTeste123!` |

Esses valores podem ser alterados no `backend/.env`. Eles são exclusivos para desenvolvimento e nunca devem ser usados em produção.
>>>>>>> 67f607708ba738f9adee6119b6f169da9cb04592

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
<<<<<<< HEAD
- Refresh token opaco em cookie `HttpOnly`, com `Secure` em produção, `SameSite=Strict`, rotação e revogação no backend
=======
- Refresh token com rotação e revogação no backend
>>>>>>> 67f607708ba738f9adee6119b6f169da9cb04592
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

<<<<<<< HEAD
A área de professor possui endpoints próprios para visão geral pedagógica, listagem de alunos, detalhe individual e desempenho por disciplina/período. A autoria de cursos, conteúdos, questões e simulados reutiliza os endpoints de conteúdo protegidos por `ADMIN` ou `MENTOR`.
=======
A área de professor possui atualmente o endpoint `GET /mentor/students`. Novos fluxos específicos de mentor podem ser ampliados conforme os endpoints de negócio forem implementados.
>>>>>>> 67f607708ba738f9adee6119b6f169da9cb04592

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
<<<<<<< HEAD
    http://localhost:3333/api/v1
=======
http://localhost:3333/api/v1
>>>>>>> 67f607708ba738f9adee6119b6f169da9cb04592
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
<<<<<<< HEAD
GET    /mentor/dashboard           GET    /mentor/students
GET    /mentor/students/:id        GET    /mentor/students/:id/performance
GET    /mentor/students/:id/answers
GET    /mentor/students/:id/simulations
=======
GET    /mentor/students
>>>>>>> 67f607708ba738f9adee6119b6f169da9cb04592

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
<<<<<<< HEAD
- Refresh tokens armazenados como hash no banco, emitidos somente em cookie `HttpOnly`, com rotação e revogação
=======
- Refresh tokens armazenados como hash, com rotação e revogação
>>>>>>> 67f607708ba738f9adee6119b6f169da9cb04592
- Validação de entradas com Zod
- RBAC no backend para papéis `STUDENT`, `ADMIN` e `MENTOR`
- Erros sem stack trace ou detalhes internos para o cliente
- Códigos de recuperação com hash, expiração e limite de tentativas
- Access token mantido apenas em memória no frontend
<<<<<<< HEAD
- O frontend nunca lê ou persiste o refresh token; o navegador o envia automaticamente em requisições com `credentials: include`

O cookie de refresh usa duração de sessão quando “Lembrar acesso” está desmarcado e duração de 30 dias quando está marcado. Em produção, frontend e API devem estar em contexto compatível com `SameSite=Strict` e usar HTTPS.

## Testes e validação

A suíte do backend é de integração: usa Jest, Supertest e um PostgreSQL separado. Ela cobre autenticação, refresh e revogação de tokens, recuperação de senha, RBAC, conteúdos, questões, simulados, endpoints pedagógicos do mentor e tratamento de erros.
=======
- Refresh token persistido no storage do navegador por necessidade da implementação atual

A persistência do refresh token acessível por JavaScript é uma concessão conhecida. Para um endurecimento de produção, o backend deve migrar para cookie `httpOnly`, `Secure` e `SameSite=Strict`.

## Testes e validação

A suíte do backend é de integração: usa Jest, Supertest e um PostgreSQL separado. Ela cobre autenticação, refresh e revogação de tokens, recuperação de senha, RBAC, conteúdos, questões, simulados e tratamento de erros.
>>>>>>> 67f607708ba738f9adee6119b6f169da9cb04592

Comandos recomendados antes de enviar alterações:

```bash
npm run build
npm test
npm run lint --workspace=web
<<<<<<< HEAD
npm run test:visual --workspace=web
=======
>>>>>>> 67f607708ba738f9adee6119b6f169da9cb04592
```

Para uma validação manual completa, inicie o backend e o frontend com `npm run dev`, acesse a aplicação e verifique os fluxos de login, cursos, questões e simulados. O Swagger pode ser usado para inspecionar e exercitar diretamente a API.

<<<<<<< HEAD
### Validação visual no CI

O workflow `.github/workflows/visual.yml` executa automaticamente em pushes para `main` e pull requests. Ele instala o Chromium do Playwright, compila o frontend, inicia o build com `vite preview` e compara snapshots de:

- Landing page em viewport desktop
- Landing page em viewport mobile, incluindo abertura e fechamento do menu
- Tela de login em desktop e mobile

Relatórios HTML, screenshots, traces e vídeos de falhas são publicados como artefatos do GitHub Actions. Para atualizar snapshots intencionalmente:

```bash
npm run test:visual --workspace=web -- --update-snapshots
```

=======
>>>>>>> 67f607708ba738f9adee6119b6f169da9cb04592
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

<<<<<<< HEAD
- Revisar os dados do controlador, do encarregado e do canal de privacidade nas páginas legais antes da publicação.

## Uso interno e operação

- Este repositório deve ser mantido em ambiente controlado, restrito ao time responsável pela solução.
- Não deve ser publicado em plataformas públicas de código ou repositórios open source.
- Segredos, credenciais e chaves de produção devem permanecer fora do controle de versão.
- A operação, deploy e manutenção devem seguir os padrões internos da organização e da arquitetura do produto.

## Contato comercial

Para demonstrações, propostas, implantação ou informações sobre a solução, utilize o canal comercial oficial do projeto. Detalhes de contato, credenciais e configurações de ambientes não são mantidos neste repositório.
=======
- Completar e ampliar os endpoints específicos da área de professor/mentor.
- Integrar assinaturas e pagamentos reais.
- Migrar refresh token para cookie `httpOnly`.
- Adicionar páginas de Termos de Uso e Política de Privacidade (LGPD).
- Configurar validação visual automatizada com navegador headless no pipeline de CI.

## Licença

O projeto ainda não define uma licença de distribuição pública no repositório.
>>>>>>> 67f607708ba738f9adee6119b6f169da9cb04592
