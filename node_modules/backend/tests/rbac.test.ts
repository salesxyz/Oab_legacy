import request from 'supertest';
import { app } from '../src/app';
import { pool } from '../src/db/client';
import { db } from '../src/db/client';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';

describe('RBAC e painel administrativo', () => {
  afterAll(async () => {
    await pool.end();
  });

  const student = { name: 'Aluno RBAC', email: 'jest.aluno@teste.com', password: 'SenhaForte1' };
  let studentToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const reg = await request(app).post('/auth/register').send(student);
    studentToken = reg.body.accessToken;

    // Promove um usuário a ADMIN diretamente no banco para simular um admin
    // já existente (o backend nunca permite auto-promoção via API).
    await request(app)
      .post('/auth/register')
      .send({ name: 'Admin RBAC', email: 'jest.admin@teste.com', password: 'SenhaForte1' });
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.email, 'jest.admin@teste.com'));

    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'jest.admin@teste.com', password: 'SenhaForte1' });
    adminToken = adminLogin.body.accessToken;
  });

  it('aluno NÃO consegue acessar o dashboard administrativo', async () => {
    const res = await request(app).get('/admin/dashboard').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it('aluno NÃO consegue listar usuários do admin', async () => {
    const res = await request(app).get('/admin/users').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it('admin consegue acessar o dashboard com estatísticas reais', async () => {
    const res = await request(app).get('/admin/dashboard').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.totalStudents).toBe('number');
    expect(typeof res.body.averageAccuracyPercent).toBe('number');
  });

  it('aluno NÃO consegue criar curso (somente admin)', async () => {
    const res = await request(app)
      .post('/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Curso Hacker' });
    expect(res.status).toBe(403);
  });

  it('admin consegue criar curso', async () => {
    const res = await request(app)
      .post('/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Curso via teste', status: 'PUBLICADO' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Curso via teste');
  });

  it('admin consegue desativar um usuário', async () => {
    const studentRow = await db.select().from(users).where(eq(users.email, student.email));
    const res = await request(app)
      .patch(`/admin/users/${studentRow[0].id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'INATIVO' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('INATIVO');
  });

  it('usuário desativado não consegue mais fazer login', async () => {
    const res = await request(app).post('/auth/login').send({ email: student.email, password: student.password });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ACCOUNT_INACTIVE');
  });

  it('rota inexistente autenticada retorna 404 (e não vaza stack trace)', async () => {
    const res = await request(app).get('/rota-que-nao-existe').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(res.body.message).not.toMatch(/at Object|node_modules/);
  });
});
