/* eslint-disable no-console */
import { and, eq } from 'drizzle-orm';
import { db, pool } from './client';
import { users, profiles } from './schema/users';
import { courses, modules, contents, progress, tips } from './schema/content';
import { questions, alternatives, userAnswers } from './schema/questions';
import { simulations, simulationQuestions } from './schema/simulations';
import { achievements, gamification } from './schema/gamification';
import { hashPassword } from '../utils/hash';
import { env, isProduction } from '../config/env';

async function seed() {
  if (isProduction) {
    console.error('❌ Seed de desenvolvimento não deve ser executado em produção. Abortando.');
    process.exit(1);
  }

  console.log('🌱 Iniciando seed do banco de dados...');

  // ---------- Conquistas (catálogo fixo referenciado pelo código) ----------
  const achievementDefs = [
    { code: 'FIRST_QUESTION', title: 'Primeira questão', description: 'Respondeu a primeira questão da plataforma.', icon: '🎯' },
    { code: 'QUESTIONS_10', title: '10 questões respondidas', description: 'Respondeu 10 questões.', icon: '📘' },
    { code: 'QUESTIONS_100', title: '100 questões respondidas', description: 'Respondeu 100 questões.', icon: '📚' },
    { code: 'FIRST_SIMULATION', title: 'Primeiro simulado', description: 'Concluiu o primeiro simulado.', icon: '📝' },
    { code: 'STREAK_7_DAYS', title: '7 dias consecutivos', description: 'Estudou por 7 dias seguidos.', icon: '🔥' },
    { code: 'STREAK_30_DAYS', title: '30 dias consecutivos', description: 'Estudou por 30 dias seguidos.', icon: '🏆' },
    { code: 'ACCURACY_80', title: '80% de aproveitamento', description: 'Atingiu 80% de acerto em um simulado.', icon: '⭐' },
    { code: 'MODULE_COMPLETED', title: 'Módulo concluído', description: 'Concluiu todos os conteúdos de um módulo.', icon: '✅' },
  ];

  for (const def of achievementDefs) {
    await db.insert(achievements).values(def).onConflictDoNothing();
  }
  console.log(`✅ ${achievementDefs.length} conquistas semeadas.`);

  // ---------- Usuários de teste e admin ----------
  async function upsertUser(name: string, email: string, password: string, role: 'ALUNO' | 'ADMIN' | 'MENTOR') {
    const existing = await db.select().from(users).where(eq(users.email, email));
    let user = existing[0];

    if (!user) {
      const passwordHash = await hashPassword(password);
      [user] = await db.insert(users).values({ name, email, passwordHash, role }).returning();
    }

    // Garante perfil e gamificação mesmo se o usuário já existia de uma
    // execução anterior parcial do seed (idempotência real, não só no user).
    await db.insert(profiles).values({ userId: user.id }).onConflictDoNothing();
    await db.insert(gamification).values({ userId: user.id }).onConflictDoNothing();
    return user;
  }

  const seedUsers = [
    { name: 'Usuário de Teste', email: env.SEED_TEST_USER_EMAIL, password: env.SEED_TEST_USER_PASSWORD, role: 'ALUNO' as const },
    { name: 'Administrador', email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD, role: 'ADMIN' as const },
    { name: 'Professor Mentor', email: env.SEED_MENTOR_EMAIL, password: env.SEED_MENTOR_PASSWORD, role: 'MENTOR' as const },
    ...Array.from({ length: 7 }, (_, index) => ({
      name: `Aluno de Teste ${index + 1}`,
      email: `aluno${index + 1}@exemplo.com`,
      password: `AlunoTeste${index + 1}123!`,
      role: 'ALUNO' as const,
    })),
  ];

  for (const user of seedUsers) {
    await upsertUser(user.name, user.email, user.password, user.role);
  }
  console.log(`✅ ${seedUsers.length} usuários de teste semeados.`);

  // ---------- Curso, módulo e conteúdos ----------
  const [course] = await db
    .insert(courses)
    .values({
      title: 'Preparatório OAB — 1ª Fase',
      description: 'Curso completo de preparação para a primeira fase do Exame de Ordem.',
      status: 'PUBLICADO',
      order: 1,
    })
    .returning();

  const [module1] = await db
    .insert(modules)
    .values({
      courseId: course.id,
      title: 'Direito Constitucional',
      description: 'Princípios fundamentais, direitos e garantias, organização do Estado.',
      order: 1,
    })
    .returning();

  const [module2] = await db
    .insert(modules)
    .values({
      courseId: course.id,
      title: 'Direito Civil',
      description: 'Parte geral, obrigações e contratos.',
      order: 2,
    })
    .returning();

  await db.insert(contents).values([
    {
      moduleId: module1.id,
      title: 'Princípios Fundamentais',
      description: 'Os fundamentos da Constituição de 1988.',
      type: 'TEXTO',
      body: 'Conteúdo introdutório sobre os princípios fundamentais da Constituição Federal de 1988...',
      order: 1,
      status: 'PUBLICADO',
    },
    {
      moduleId: module1.id,
      title: 'Direitos e Garantias Fundamentais',
      description: 'Artigo 5º da Constituição Federal.',
      type: 'VIDEO',
      videoUrl: 'https://example.com/videos/direitos-fundamentais',
      order: 2,
      status: 'PUBLICADO',
    },
    {
      moduleId: module2.id,
      title: 'Pessoas Naturais e Jurídicas',
      description: 'Capacidade civil e personalidade jurídica.',
      type: 'TEXTO',
      body: 'Conteúdo sobre pessoas naturais e jurídicas no Código Civil...',
      order: 1,
      status: 'PUBLICADO',
    },
  ]);
  console.log('✅ Curso, módulos e conteúdos semeados.');

  const seededContents = await db
    .select()
    .from(contents)
    .where(eq(contents.status, 'PUBLICADO'));

  // ---------- Questões ----------
  const questionSeeds = [
    {
      moduleId: module1.id,
      statement: 'De acordo com a Constituição Federal de 1988, são fundamentos da República Federativa do Brasil, EXCETO:',
      explanation: 'Os fundamentos estão previstos no art. 1º da CF/88: soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho e da livre iniciativa, e pluralismo político.',
      difficulty: 'MEDIO' as const,
      subject: 'Direito Constitucional',
      examBoard: 'FGV',
      year: 2024,
      alternatives: [
        { text: 'Soberania', correct: false },
        { text: 'Cidadania', correct: false },
        { text: 'Separação absoluta entre os poderes', correct: true },
        { text: 'Dignidade da pessoa humana', correct: false },
      ],
    },
    {
      moduleId: module1.id,
      statement: 'O remédio constitucional cabível para proteger direito líquido e certo, não amparado por habeas corpus ou habeas data, é:',
      explanation: 'O mandado de segurança, previsto no art. 5º, LXIX, da CF/88, protege direito líquido e certo não amparado por habeas corpus ou habeas data.',
      difficulty: 'FACIL' as const,
      subject: 'Direito Constitucional',
      examBoard: 'FGV',
      year: 2023,
      alternatives: [
        { text: 'Mandado de injunção', correct: false },
        { text: 'Mandado de segurança', correct: true },
        { text: 'Ação popular', correct: false },
        { text: 'Ação civil pública', correct: false },
      ],
    },
    {
      moduleId: module2.id,
      statement: 'Segundo o Código Civil, a personalidade civil da pessoa começa:',
      explanation: 'Art. 2º do Código Civil: a personalidade civil da pessoa começa do nascimento com vida, mas a lei põe a salvo, desde a concepção, os direitos do nascituro.',
      difficulty: 'FACIL' as const,
      subject: 'Direito Civil',
      examBoard: 'FGV',
      year: 2024,
      alternatives: [
        { text: 'Do nascimento com vida', correct: true },
        { text: 'Da concepção', correct: false },
        { text: 'Do registro civil', correct: false },
        { text: 'Da maioridade', correct: false },
      ],
    },
  ];

  const createdQuestions = [];
  for (const q of questionSeeds) {
    const { alternatives: alts, ...data } = q;
    const [question] = await db.insert(questions).values(data).returning();
    await db.insert(alternatives).values(alts.map((a, idx) => ({ ...a, order: idx, questionId: question.id })));
    createdQuestions.push(question);
  }
  console.log(`✅ ${createdQuestions.length} questões semeadas.`);

  // ---------- Atividade genérica para a visão do mentor ----------
  const students = await db.select().from(users).where(eq(users.role, 'ALUNO'));
  const seededQuestions = await db.select().from(questions).where(eq(questions.active, true));
  const progressPresets = [100, 80, 55, 25];

  for (const [studentIndex, student] of students.entries()) {
    for (const [contentIndex, content] of seededContents.entries()) {
      const percent = progressPresets[(studentIndex + contentIndex) % progressPresets.length];
      const startedAt = new Date(Date.now() - (studentIndex + contentIndex + 1) * 86_400_000);
      await db
        .insert(progress)
        .values({
          userId: student.id,
          contentId: content.id,
          percent,
          completed: percent === 100,
          startedAt,
          completedAt: percent === 100 ? new Date(startedAt.getTime() + 45 * 60 * 1000) : null,
        })
        .onConflictDoUpdate({
          target: [progress.userId, progress.contentId],
          set: { percent, completed: percent === 100, startedAt, completedAt: percent === 100 ? new Date(startedAt.getTime() + 45 * 60 * 1000) : null },
        });
    }

    for (const [questionIndex, question] of seededQuestions.entries()) {
      const questionAlternatives = await db.select().from(alternatives).where(eq(alternatives.questionId, question.id));
      const correctAlternative = questionAlternatives.find((alternative) => alternative.correct);
      if (!correctAlternative) continue;

      const existingAnswer = await db
        .select()
        .from(userAnswers)
        .where(and(eq(userAnswers.userId, student.id), eq(userAnswers.questionId, question.id)));
      if (existingAnswer.length > 0) continue;

      const answeredCorrectly = (studentIndex + questionIndex) % 4 !== 0;
      const selectedAlternative = answeredCorrectly
        ? correctAlternative
        : questionAlternatives.find((alternative) => !alternative.correct) ?? correctAlternative;
      await db.insert(userAnswers).values({
        userId: student.id,
        questionId: question.id,
        alternativeId: selectedAlternative.id,
        correct: answeredCorrectly,
        responseTimeMs: 20_000 + ((studentIndex + questionIndex) % 4) * 5_000,
        answeredAt: new Date(Date.now() - (studentIndex + questionIndex + 1) * 86_400_000),
      });
    }
  }
  console.log(`✅ Atividade genérica criada para ${students.length} alunos.`);

  // ---------- Simulado ----------
  const [simulation] = await db
    .insert(simulations)
    .values({
      title: 'Simulado de Diagnóstico — 1ª Fase',
      description: 'Simulado inicial para diagnóstico de nível do aluno.',
      questionCount: createdQuestions.length,
      timeLimitMinutes: 30,
      active: true,
    })
    .returning();

  await db.insert(simulationQuestions).values(
    createdQuestions.map((q, idx) => ({ simulationId: simulation.id, questionId: q.id, order: idx })),
  );
  console.log('✅ Simulado semeado.');

  // ---------- Dicas ----------
  await db.insert(tips).values([
    {
      title: 'Técnica Pomodoro para concursos',
      content: 'Estude em blocos de 25 minutos com 5 minutos de pausa. A cada 4 blocos, faça uma pausa maior de 15-30 minutos.',
      category: 'Organização de estudos',
      active: true,
    },
    {
      title: 'Como memorizar prazos processuais',
      content: 'Crie associações visuais e utilize flashcards de revisão espaçada para fixar prazos do CPC.',
      category: 'Memorização',
      active: true,
    },
    {
      title: 'Erro comum: marcar a primeira alternativa "óbvia"',
      content: 'Bancas costumam incluir "pegadinhas" na primeira alternativa que parece óbvia. Leia todas antes de marcar.',
      category: 'Estratégia de prova',
      active: true,
    },
  ]);
  console.log('✅ Dicas semeadas.');

  console.log('🌱 Seed concluído com sucesso!');
}

seed()
  .catch((err) => {
    console.error('❌ Erro ao executar seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
