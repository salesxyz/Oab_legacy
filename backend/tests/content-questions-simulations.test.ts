import request from 'supertest';
import { app } from '../src/app';
import { pool, db } from '../src/db/client';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';

describe('Conteúdos, questões e simulados', () => {
  afterAll(async () => {
    await pool.end();
  });

  let adminToken: string;
  let studentToken: string;
  let courseId: string;
  let moduleId: string;
  let contentId: string;
  let questionId: string;
  let alternativeIds: string[];

  beforeAll(async () => {
    await request(app).post('/auth/register').send({ name: 'Admin CQS', email: 'jest.admin.cqs@teste.com', password: 'SenhaForte1' });
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.email, 'jest.admin.cqs@teste.com'));
    const adminLogin = await request(app).post('/auth/login').send({ email: 'jest.admin.cqs@teste.com', password: 'SenhaForte1' });
    adminToken = adminLogin.body.accessToken;

    const studentReg = await request(app)
      .post('/auth/register')
      .send({ name: 'Aluno CQS', email: 'jest.aluno.cqs@teste.com', password: 'SenhaForte1' });
    studentToken = studentReg.body.accessToken;
  });

  it('admin cria curso, módulo e conteúdo', async () => {
    const course = await request(app)
      .post('/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Direito Penal', status: 'PUBLICADO' });
    courseId = course.body.id;
    expect(course.status).toBe(201);

    const module = await request(app)
      .post('/modules')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ courseId, title: 'Teoria do Crime' });
    moduleId = module.body.id;
    expect(module.status).toBe(201);

    const content = await request(app)
      .post('/contents')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ moduleId, title: 'Conceito de crime', type: 'TEXTO', body: 'Texto...', status: 'PUBLICADO' });
    contentId = content.body.id;
    expect(content.status).toBe(201);
  });

  it('aluno consegue listar cursos publicados sem autenticação', async () => {
    const res = await request(app).get('/courses');
    expect(res.status).toBe(200);
    expect(res.body.some((c: any) => c.id === courseId)).toBe(true);
  });

  it('aluno marca progresso de um conteúdo e ganha XP', async () => {
    const res = await request(app)
      .post(`/contents/${contentId}/progress`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ percent: 100 });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);

    const profile = await request(app).get('/profile').set('Authorization', `Bearer ${studentToken}`);
    expect(profile.body.gamification.xp).toBeGreaterThan(0);
  });

  it('admin cria questão com validação de alternativa única correta', async () => {
    const invalid = await request(app)
      .post('/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        moduleId,
        statement: 'Questão inválida?',
        subject: 'Direito Penal',
        alternatives: [
          { text: 'A', correct: true },
          { text: 'B', correct: true },
        ],
      });
    expect(invalid.status).toBe(400);

    const valid = await request(app)
      .post('/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        moduleId,
        statement: 'O que é fato típico?',
        explanation: 'Explicação da questão.',
        subject: 'Direito Penal',
        alternatives: [
          { text: 'Conduta, resultado, nexo e tipicidade', correct: true },
          { text: 'Apenas a conduta', correct: false },
          { text: 'Apenas o resultado', correct: false },
        ],
      });
    expect(valid.status).toBe(201);
    questionId = valid.body.id;
  });

  it('alternativas retornadas ao aluno NUNCA revelam qual é a correta', async () => {
    const res = await request(app).get(`/questions/${questionId}`);
    expect(res.status).toBe(200);
    for (const alt of res.body.alternatives) {
      expect(alt).not.toHaveProperty('correct');
    }
    alternativeIds = res.body.alternatives.map((a: any) => a.id);
  });

  it('aluno responde a questão e recebe feedback correto', async () => {
    const res = await request(app)
      .post(`/questions/${questionId}/answer`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ alternativeId: alternativeIds[0] });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('correct');
    expect(res.body).toHaveProperty('correctAlternativeId');
    expect(res.body).toHaveProperty('explanation');
  });

  it('aluno NÃO consegue editar a questão diretamente', async () => {
    const res = await request(app)
      .patch(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ statement: 'Tentativa de alterar' });
    expect(res.status).toBe(403);
  });

  it('fluxo completo de simulado: criar, iniciar e finalizar', async () => {
    const sim = await request(app)
      .post('/simulations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Simulado de teste',
        questionCount: 1,
        timeLimitMinutes: 10,
        questionIds: [questionId],
      });
    expect(sim.status).toBe(201);

    const start = await request(app).post(`/simulations/${sim.body.id}/start`).set('Authorization', `Bearer ${studentToken}`);
    expect(start.status).toBe(200);
    expect(start.body.questions).toHaveLength(1);
    expect(start.body.questions[0].alternatives[0]).not.toHaveProperty('correct');

    const finish = await request(app)
      .post(`/simulations/${sim.body.id}/finish`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: [{ questionId, alternativeId: alternativeIds[0] }],
        timeSpentSeconds: 60,
      });
    expect(finish.status).toBe(200);
    expect(finish.body.result.correctCount + finish.body.result.wrongCount).toBe(1);
  });
});
