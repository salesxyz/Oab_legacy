export const nav = [
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Disciplinas', href: '#disciplinas' },
  { label: 'Planos', href: '#planos' },
  { label: 'Perguntas frequentes', href: '#faq' },
];

export const heroStats = [
  { value: '12.400+', label: 'questões comentadas' },
  { value: '9', label: 'disciplinas do edital' },
  { value: '2010–2026', label: 'provas anteriores da FGV' },
];

export const features = [
  {
    title: 'Questões comentadas',
    description:
      'Banco com mais de 12 mil questões de provas anteriores, filtráveis por disciplina, banca, ano e dificuldade — cada uma com explicação de por que a alternativa certa é certa.',
  },
  {
    title: 'Videoaulas por módulo',
    description:
      'Aulas curtas e diretas, organizadas na mesma estrutura dos módulos de estudo, com transcrição e legenda disponíveis.',
  },
  {
    title: 'Simulados cronometrados',
    description:
      'Provas completas nas condições e no tempo do exame real, com correção imediata e desempenho detalhado por disciplina.',
  },
  {
    title: 'Progresso mensurável',
    description:
      'Um painel que mostra exatamente o que você já estudou, sua taxa de acerto por disciplina e o que precisa de mais atenção.',
  },
  {
    title: 'Sequência de estudos',
    description:
      'Acompanhe sua constância dia após dia. Estudar um pouco todos os dias rende mais do que maratonas às vésperas da prova.',
  },
  {
    title: 'Ranking entre estudantes',
    description:
      'Compare seu desempenho com o de outros candidatos se preparando para a mesma prova — participação é opcional.',
  },
];

export const howItWorks = [
  {
    title: 'Monte seu plano de estudo',
    description: 'Escolha por onde começar entre as 9 disciplinas do edital, ou siga a trilha recomendada pela plataforma.',
  },
  {
    title: 'Estude o módulo e assista à aula',
    description: 'Conteúdo direto ao ponto — o essencial para a prova, sem enrolação — com videoaula de apoio.',
  },
  {
    title: 'Pratique com questões reais',
    description: 'Responda questões de provas anteriores, com explicação completa logo após cada resposta.',
  },
  {
    title: 'Feche com um simulado',
    description: 'Teste-se em condições reais de prova, com tempo cronometrado e correção por disciplina.',
  },
];

export const disciplines = [
  'Direito Constitucional',
  'Direito Administrativo',
  'Direito Civil',
  'Direito Penal',
  'Direito Processual Civil',
  'Direito Processual Penal',
  'Direito do Trabalho',
  'Direito Tributário',
  'Ética Profissional',
];

export const plans = {
  basic: {
    name: 'Básico',
    price: 'R$ 97,00',
    period: '/90 dias',
    description: 'Acesso completo à plataforma por 90 dias para sua preparação.',
    features: [
      'Módulos iniciais de cada disciplina',
      'Banco de questões limitado por dia',
      'Acompanhamento básico de progresso',
      'Alguns desafios semanais',
    ],
  },
  lifetime: {
    name: 'Vitalício',
    price: 'R$ 2.997,99',
    period: 'até a aprovação',
    description: 'Estude até passar na prova da OAB, com 60 dias extras após a aprovação.',
    features: [
      'Todos os módulos e disciplinas do edital',
      'Banco completo de questões comentadas',
      'Todas as videoaulas',
      'Simulados ilimitados',
      'Estatísticas avançadas de desempenho',
      'Desafios e recomendações personalizadas',
      'Ranking completo entre estudantes',
    ],
  },
};

export const faq = [
  {
    question: 'A plataforma segue o edital atual da OAB?',
    answer:
      'Sim. Os módulos e disciplinas acompanham o edital vigente da 1ª fase, e o banco de questões é atualizado a cada novo exame aplicado.',
  },
  {
    question: 'Os simulados têm o mesmo tempo da prova real?',
    answer:
      'Sim, os simulados completos seguem a mesma quantidade de questões e o mesmo tempo de prova do Exame de Ordem, para você treinar o ritmo real.',
  },
  {
    question: 'Preciso pagar para começar a estudar?',
    answer:
      'Não. O plano Básico é gratuito e dá acesso aos módulos iniciais de cada disciplina, com parte do banco de questões liberada todos os dias.',
  },
  {
    question: 'As questões são de provas anteriores reais?',
    answer:
      'Sim. O banco é formado por questões já aplicadas em exames anteriores, cada uma com explicação de por que a alternativa correta está certa — e por que as demais estão erradas.',
  },
  {
    question: 'Posso estudar pelo celular?',
    answer:
      'Sim. A plataforma web é totalmente responsiva, e um aplicativo dedicado para Android e iOS também está disponível.',
  },
  {
    question: 'Como funciona o acesso após a aprovação?',
    answer:
      'Ao confirmar sua aprovação, a equipe registra o resultado e libera mais 60 dias de acesso à plataforma para você revisar e comemorar essa conquista.',
  },
];

export const footerLinks = {
  plataforma: [
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Disciplinas', href: '#disciplinas' },
    { label: 'Planos', href: '#planos' },
    { label: 'Perguntas frequentes', href: '#faq' },
  ],
  legal: [
    { label: 'Termos de Uso', href: '/termos' },
    { label: 'Política de Privacidade', href: '/privacidade' },
  ],
};
