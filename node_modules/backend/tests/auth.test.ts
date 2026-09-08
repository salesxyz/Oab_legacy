import request from 'supertest';
import { app } from '../src/app';
import { pool } from '../src/db/client';

describe('Auth', () => {
  afterAll(async () => {
    await pool.end();
  });

  const user = { name: 'Teste Jest', email: 'jest.auth@teste.com', password: 'SenhaForte1' };

  it('registra um novo usuário e retorna tokens', async () => {
    const res = await request(app).post('/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.role).toBe('ALUNO');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('não permite cadastro duplicado com o mesmo email', async () => {
    const res = await request(app).post('/auth/register').send(user);
    expect(res.status).toBe(409);
  });

  it('faz login com credenciais corretas', async () => {
    const res = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('rejeita login com senha incorreta com mensagem genérica', async () => {
    const res = await request(app).post('/auth/login').send({ email: user.email, password: 'senhaErrada1' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejeita login de usuário inexistente com a MESMA mensagem genérica (anti-enumeração)', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'naoexiste@teste.com', password: 'qualquerSenha1' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('bloqueia acesso a rota protegida sem token', async () => {
    const res = await request(app).get('/profile');
    expect(res.status).toBe(401);
  });

  it('permite acesso a rota protegida com token válido', async () => {
    const login = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
    const res = await request(app).get('/profile').set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user.email);
  });

  it('rotaciona o refresh token e invalida o antigo', async () => {
    const login = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
    const oldRefresh = login.body.refreshToken;

    const refreshRes = await request(app).post('/auth/refresh').send({ refreshToken: oldRefresh });
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.refreshToken).not.toBe(oldRefresh);

    // O token antigo não deve mais funcionar (rotação com revogação).
    const reuseRes = await request(app).post('/auth/refresh').send({ refreshToken: oldRefresh });
    expect(reuseRes.status).toBe(401);
  });

  it('fluxo de recuperação de senha responde de forma genérica mesmo para email inexistente', async () => {
    const res = await request(app).post('/auth/forgot-password').send({ email: 'ninguem@teste.com' });
    expect(res.status).toBe(200);
  });

  it('rejeita código de verificação inválido', async () => {
    await request(app).post('/auth/forgot-password').send({ email: user.email });
    const res = await request(app).post('/auth/verify-code').send({ email: user.email, code: '000000' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_RESET_CODE');
  });

  it('não confia em dados de administrador vindos do corpo da requisição de registro', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Hacker', email: 'hacker@teste.com', password: 'SenhaForte1', role: 'ADMIN' });
    expect(res.status).toBe(201);
    // Mesmo enviando role=ADMIN no corpo, o backend ignora e força ALUNO.
    expect(res.body.user.role).toBe('ALUNO');
  });
});
