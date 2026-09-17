# OAB Mentoria — Frontend (Web)

Website da plataforma OAB Mentoria. Fases entregues até aqui: **design system + landing page**, **autenticação completa** e **área do aluno completa** — todas integradas à API real. Área administrativa é a próxima fase.

## Por que Vite + React em vez de HTML/CSS/TS puro

O documento de especificação original pede HTML5/CSS3/TypeScript sem framework. Combinado com você durante o planejamento, optamos por **Vite + React + TypeScript** em vez disso — mais rápido de construir e manter no médio prazo — mas seguindo à risca a identidade visual, a paleta de cores, a tipografia, a estrutura de páginas e o design system que o documento define. Nenhum framework de UI (Tailwind, Bootstrap) foi usado: os estilos são CSS puro, organizado em CSS Modules por componente, com os tokens centralizados em `src/styles/tokens.css` — o mesmo espírito de "design system centralizado" pedido no documento (seção 56), só que implementado como variáveis CSS reais em vez de arquivos `.css` soltos por página.

## Stack

- **Build tool**: Vite 8
- **Framework**: React 19 + TypeScript
- **Roteamento**: React Router
- **Estilos**: CSS puro + CSS Modules (sem Tailwind/Bootstrap) — tokens centralizados
- **Fontes**: Manrope (títulos) + Inter (corpo), self-hosted via `@fontsource` (subsets `latin` + `latin-ext`, cobrindo os acentos do português, sem carregar cyrillic/greek/vietnamese desnecessariamente)

## Autenticação

Integrada de ponta a ponta com o backend real (`POST /auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/verify-code`, `/reset-password`). Toda a lógica foi testada manualmente contra o servidor rodando de verdade (não apenas revisão de código) — ver seção "Validado nesta fase".

### Arquitetura de sessão

- **`src/services/tokenStore.ts`** — o access token vive **só em memória**. O refresh token nunca é exposto ao JavaScript: o backend o emite em cookie `httpOnly`, com `Secure` em produção e `SameSite=Strict`; o cliente envia credenciais automaticamente nas chamadas. "Lembrar acesso" controla se o cookie é de sessão ou persistente por 30 dias.
- **`src/services/httpClient.ts`** — cliente HTTP central. Anexa o `Authorization: Bearer`, e se uma chamada falha com `401` + `code: "INVALID_TOKEN"`, tenta renovar o access token **uma única vez** via refresh token e refaz a chamada original — sem o usuário perceber. Se o refresh também falhar, limpa a sessão e emite um evento (`sessionExpired`) que o `AuthContext` escuta para redirecionar ao login com aviso. Múltiplas chamadas que expiram ao mesmo tempo compartilham a mesma renovação em andamento (sem corrida de refreshes paralelos).
- **`src/contexts/AuthContext.tsx`** — ao carregar a aplicação, tenta restaurar a sessão silenciosamente chamando `/auth/refresh`; o navegador envia o cookie `httpOnly` sem que o frontend precise acessá-lo.
- **`src/components/auth/ProtectedRoute.tsx`** — redireciona para `/entrar` quem não está autenticado, preservando a rota de destino original. **O frontend nunca decide permissões reais** — isso sempre vem do backend; este componente só evita mostrar telas que dependem de dados do usuário antes de sabermos se há sessão.

### Páginas

- `/entrar` — login com mostrar/ocultar senha, "lembrar acesso", estados de carregamento/erro
- `/cadastro` — checklist de senha em tempo real (mesmas regras do backend: 8+ caracteres, maiúscula, minúscula, número)
- `/recuperar-senha` — assistente de 3 etapas (email → código de 6 dígitos → nova senha → sucesso) numa única rota com estado interno, em vez de 3 páginas separadas trocando dados sensíveis por URL. Inclui contador de expiração do código, reenvio com cooldown de 60s, e tratamento do limite de tentativas do backend (`RESET_ATTEMPTS_EXCEEDED`)
### Área do aluno (`/app/*`, protegida por login)

- `/app` — Dashboard: XP, nível, sequência de dias (dados reais de `/profile`), card "continue de onde parou" (calculado a partir do primeiro módulo incompleto do primeiro curso), atalhos e dica do dia
- `/app/cursos` → `/app/cursos/:id` → `.../modulos/:id` → `.../conteudos/:id` — navegação em cascata cursos → módulos → conteúdos, com estado visual concluído/atual/bloqueado (bloqueio é uma decisão só do frontend — o backend não restringe acesso sequencial) e marcação de progresso real (`POST /contents/:id/progress`), que credita XP
- `/app/questoes` → `/app/questoes/:id` — filtro por disciplina/dificuldade, resposta com feedback real (a API nunca devolve qual alternativa é a correta antes da resposta), explicação e XP ganho
- `/app/simulados` → `/app/simulados/:id` — fluxo completo: iniciar (busca as questões do simulado sem revelar respostas), navegar entre questões com cronômetro regressivo real (finaliza sozinho ao zerar), finalizar, e tela de resultado com desempenho por disciplina
- `/app/ranking` — ranking real, com o usuário logado destacado
- `/app/perfil` — dados reais, conquistas desbloqueadas, desempenho por disciplina, e toggle de privacidade (participar do ranking público) que persiste na API

Todas as páginas seguem os quatro estados exigidos (carregando/vazio/erro/sucesso) via o hook `src/hooks/useApiQuery.ts`, que centraliza esse padrão para não repetir boilerplate em cada tela.

## Estrutura de pastas

```
web/
├── index.html                  # SEO: title, meta description, Open Graph
├── src/
│   ├── main.tsx                 # entry point: fontes + cascata de estilos + montagem do router
│   ├── App.tsx                  # definição de rotas, providers (Auth, Toast)
│   ├── styles/
│   │   ├── tokens.css           # design tokens (cor, tipografia, espaçamento, sombra, transições)
│   │   ├── reset.css            # reset moderno
│   │   └── global.css           # estilos base, foco visível, skip-link, utilitário .container
│   ├── components/
│   │   ├── ui/                  # Button, Input, Checkbox, Alert, Toast, CodeInput, Accordion, Container
│   │   ├── illustrations/       # ilustração autoral do "mapa de aprendizado" (SVG)
│   │   └── auth/                # ProtectedRoute
│   ├── layouts/
│   │   ├── public/              # Header (com menu mobile) e Footer da área pública
│   │   └── auth/                # AuthLayout (split-screen com painel de marca)
│   ├── pages/
│   │   ├── public/               # LandingPage + sections/
│   │   ├── auth/                 # LoginPage, RegisterPage, ForgotPasswordPage
│   │   └── aluno/                # DashboardPlaceholder (próxima fase: dashboard completo)
│   ├── contexts/                 # AuthContext, ToastContext
│   ├── services/                 # httpClient, tokenStore, authApi, studentApi
│   ├── data/                     # copy da landing, separado dos componentes
│   ├── types/                    # tipos compartilhados com as respostas da API
│   ├── utils/                    # validation.ts, errors.ts
│   ├── hooks/                    # (próxima fase)
│   └── mock/                     # (próxima fase) dados mockados desacoplados dos componentes
└── .env.example                 # VITE_API_URL
```

## Decisões de design

- **Paleta**: os valores exatos definidos no documento (seção 56) — `--color-primary: #0b1f3a`, `--color-secondary: #1d4ed8`, `--color-accent: #d4af37` (dourado, usado com moderação para conquista/premium), `--color-success: #16a34a`, `--color-danger: #dc2626` — sem inventar tons alternativos.
- **Ilustração de assinatura**: o hero usa uma ilustração autoral do "mapa de aprendizado" (módulos concluídos, módulo atual, módulos bloqueados) — o próprio conceito central do produto (seção 18 do documento) — em vez de um gráfico genérico de dashboard.
- **Sem "cards de SaaS genérico"**: a seção de funcionalidades usa uma grade editorial com divisórias finas, não cards idênticos com sombra uniforme.
- **Numeração só onde é sequência real**: "Como funciona" é numerado porque é literalmente um passo a passo; nenhuma outra seção usa números decorativos.
- **Mobile-first de verdade**: todo layout em grid é definido primeiro para telas estreitas (1 coluna) e só ganha colunas extras dentro de media queries `min-width`, conforme pedido na seção 49 do documento.

## Acessibilidade implementada nesta fase

- Skip-link ("Pular para o conteúdo") visível ao navegar por teclado
- Foco visível (`:focus-visible`) nunca removido
- Menu mobile: fecha com `Esc`, trava o scroll do body enquanto aberto, `aria-expanded`/`aria-controls`/`aria-label` corretos
- Acordeão do FAQ com `aria-expanded`, `aria-controls`, `role="region"` — navegável e operável 100% por teclado
- Ilustração do hero marcada como decorativa (`aria-label` descritivo, mas a informação real já está no texto ao lado, em prosa)
- `prefers-reduced-motion` respeitado tanto nos tokens de transição quanto no reset global

## Rodando localmente

```bash
# 1. Suba o backend primeiro (ver /backend/README.md)
cd backend && npm run dev   # http://localhost:3333

# 2. Em outro terminal, suba o frontend
cd web
npm install
cp .env.example .env   # ajuste VITE_API_URL se o backend não estiver em localhost:3333
npm run dev             # http://localhost:5173
```

## Build de produção

```bash
npm run build      # gera web/dist
npm run preview    # serve o build de produção localmente para conferência
```

## Validado nesta fase

- `tsc -b` — type-check completo sem erros
- `vite build` — build de produção sem erros
- `oxlint` — 0 erros (3 avisos aceitos: os 2 hooks de Context de sempre, mais um falso-positivo do linter sobre `Date.now()` sendo chamado dentro de um handler de clique — não durante o render, então é seguro)
- **Toda a cadeia cursos → módulos → conteúdos → progresso, questões → resposta, e simulado → iniciar → finalizar → resultado testada de ponta a ponta contra o backend real**, comparando cada resposta com os tipos declarados em `src/types/student.ts`. Isso incluiu confirmar que conquistas são desbloqueadas automaticamente como efeito colateral de responder questões e completar simulados — não é só front bonito, o motor de gamificação reagiu de verdade
- Suíte de testes do backend (27/27) re-executada após esta fase para garantir que nada quebrou
- Banco de dados de desenvolvimento resetado e re-semeado antes da entrega, para você começar com dados limpos

**Ainda não foi possível** fazer verificação visual com navegador headless (Playwright) — bloqueado pela política de rede deste ambiente de desenvolvimento. Recomendo abrir `npm run dev` (com o backend rodando em paralelo) e navegar pela área do aluno visualmente antes de produção, especialmente o fluxo do simulado (cronômetro) e a responsividade em mobile.

## Próximas fases

1. Área administrativa (frontend conectado aos endpoints `/admin/*`, que já existem e estão testados no backend)
2. Sistema do professor/mentor (backend ainda não tem os endpoints — precisa ser criado do zero)
3. Assinaturas/pagamento (não existe em lugar nenhum ainda — só simulado visualmente nos protótipos)
4. Páginas de Termos de Uso e Política de Privacidade (LGPD)
