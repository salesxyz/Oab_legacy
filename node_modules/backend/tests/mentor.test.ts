import request from 'supertest';
import { app } from '../src/app';
import { db, pool } from '../src/db/client';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';

describe('Área do professor e mentor', () => {
  afterAll(async () => { await pool.end(); });
  const student = { name: 'Aluno Mentor', email: 'jest.aluno.mentor@teste.com', password: 'SenhaForte1' };
  let mentorToken: string;
  let studentToken: string;
  let studentId: string;

  beforeAll(async () => {
    const mentorRegistration = await request(app).post('/auth/register').send({ name: 'Mentor de Teste', email: 'jest.mentor@teste.com', password: 'SenhaForte1' });
    await db.update(users).set({ role: 'MENTOR' }).where(eq(users.email, 'jest.mentor@teste.com'));
    const mentorLogin = await request(app).post('/auth/login').send({ email: 'jest.mentor@teste.com', password: 'SenhaForte1' });
    mentorToken = mentorLogin.body.accessToken;
    const studentRegistration = await request(app).post('/auth/register').send(student);
    studentToken = studentRegistration.body.accessToken;
    const [studentRow] = await db.select({ id: users.id }).from(users).where(eq(users.email, student.email));
    studentId = studentRow.id;
    expect(mentorRegistration.status).toBe(201);
    expect(studentRegistration.status).toBe(201);
  });

  it('mentor acessa o dashboard pedagógico agregado', async () => {
    const response = await request(app).get('/mentor/dashboard').set('Authorization', `Bearer ${mentorToken}`);
    expect(response.status).toBe(200);
    expect(response.body.students.total).toBeGreaterThanOrEqual(1);
    expect(typeof response.body.students.pending).toBe('number');
    expect(typeof response.body.content.publishedContents).toBe('number');
    expect(typeof response.body.questions.averageAccuracyPercent).toBe('number');
    expect(typeof response.body.simulations.averagePercent).toBe('number');
  });

  it('mentor consulta o detalhe e o desempenho de um aluno', async () => {
    const detail = await request(app).get(`/mentor/students/${studentId}`).set('Authorization', `Bearer ${mentorToken}`);
    expect(detail.status).toBe(200);
    expect(detail.body.student.id).toBe(studentId);
    expect(detail.body.summary.progressPercent).toBe(0);
    expect(Array.isArray(detail.body.modules)).toBe(true);
    expect(Array.isArray(detail.body.performanceBySubject)).toBe(true);
    expect(Array.isArray(detail.body.simulationResults)).toBe(true);
    const performance = await request(app).get(`/mentor/students/${studentId}/performance`).set('Authorization', `Bearer ${mentorToken}`);
    expect(performance.status).toBe(200);
    expect(performance.body.student.id).toBe(studentId);
    expect(Array.isArray(performance.body.bySubject)).toBe(true);
    expect(Array.isArray(performance.body.timeline)).toBe(true);
  });

  it('mentor consulta respostas e simulados do aluno com paginação', async () => {
    const answers = await request(app)
      .get(`/mentor/students/${studentId}/answers?page=1&pageSize=10`)
      .set('Authorization', `Bearer ${mentorToken}`);
    expect(answers.status).toBe(200);
    expect(answers.body.student.id).toBe(studentId);
    expect(answers.body.page).toBe(1);
    expect(answers.body.pageSize).toBe(10);
    expect(Array.isArray(answers.body.rows)).toBe(true);
    expect(typeof answers.body.total).toBe('number');

    const simulations = await request(app)
      .get(`/mentor/students/${studentId}/simulations?page=1&pageSize=10`)
      .set('Authorization', `Bearer ${mentorToken}`);
    expect(simulations.status).toBe(200);
    expect(simulations.body.student.id).toBe(studentId);
    expect(Array.isArray(simulations.body.rows)).toBe(true);
    expect(typeof simulations.body.total).toBe('number');
  });

  it('aluno não acessa endpoints de mentor', async () => {
    const response = await request(app).get('/mentor/dashboard').set('Authorization', `Bearer ${studentToken}`);
    expect(response.status).toBe(403);
  });

  it('retorna 404 ao consultar usuário inexistente', async () => {
    const response = await request(app).get('/mentor/students/00000000-0000-4000-8000-000000000000').set('Authorization', `Bearer ${mentorToken}`);
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('STUDENT_NOT_FOUND');
  });
});
