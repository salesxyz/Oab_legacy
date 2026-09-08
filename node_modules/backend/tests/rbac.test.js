"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const client_1 = require("../src/db/client");
const client_2 = require("../src/db/client");
const schema_1 = require("../src/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
describe('RBAC e painel administrativo', () => {
    afterAll(async () => {
        await client_1.pool.end();
    });
    const student = { name: 'Aluno RBAC', email: 'jest.aluno@teste.com', password: 'SenhaForte1' };
    let studentToken;
    let adminToken;
    beforeAll(async () => {
        const reg = await (0, supertest_1.default)(app_1.app).post('/auth/register').send(student);
        studentToken = reg.body.accessToken;
        // Promove um usuário a ADMIN diretamente no banco para simular um admin
        // já existente (o backend nunca permite auto-promoção via API).
        await (0, supertest_1.default)(app_1.app)
            .post('/auth/register')
            .send({ name: 'Admin RBAC', email: 'jest.admin@teste.com', password: 'SenhaForte1' });
        await client_2.db.update(schema_1.users).set({ role: 'ADMIN' }).where((0, drizzle_orm_1.eq)(schema_1.users.email, 'jest.admin@teste.com'));
        const adminLogin = await (0, supertest_1.default)(app_1.app)
            .post('/auth/login')
            .send({ email: 'jest.admin@teste.com', password: 'SenhaForte1' });
        adminToken = adminLogin.body.accessToken;
    });
    it('aluno NÃO consegue acessar o dashboard administrativo', async () => {
        const res = await (0, supertest_1.default)(app_1.app).get('/admin/dashboard').set('Authorization', `Bearer ${studentToken}`);
        expect(res.status).toBe(403);
    });
    it('aluno NÃO consegue listar usuários do admin', async () => {
        const res = await (0, supertest_1.default)(app_1.app).get('/admin/users').set('Authorization', `Bearer ${studentToken}`);
        expect(res.status).toBe(403);
    });
    it('admin consegue acessar o dashboard com estatísticas reais', async () => {
        const res = await (0, supertest_1.default)(app_1.app).get('/admin/dashboard').set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(typeof res.body.totalStudents).toBe('number');
        expect(typeof res.body.averageAccuracyPercent).toBe('number');
    });
    it('aluno NÃO consegue criar curso (somente admin)', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .post('/courses')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ title: 'Curso Hacker' });
        expect(res.status).toBe(403);
    });
    it('admin consegue criar curso', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .post('/courses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ title: 'Curso via teste', status: 'PUBLICADO' });
        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Curso via teste');
    });
    it('admin consegue desativar um usuário', async () => {
        const studentRow = await client_2.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, student.email));
        const res = await (0, supertest_1.default)(app_1.app)
            .patch(`/admin/users/${studentRow[0].id}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'INATIVO' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('INATIVO');
    });
    it('usuário desativado não consegue mais fazer login', async () => {
        const res = await (0, supertest_1.default)(app_1.app).post('/auth/login').send({ email: student.email, password: student.password });
        expect(res.status).toBe(403);
        expect(res.body.code).toBe('ACCOUNT_INACTIVE');
    });
    it('rota inexistente autenticada retorna 404 (e não vaza stack trace)', async () => {
        const res = await (0, supertest_1.default)(app_1.app).get('/rota-que-nao-existe').set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(404);
        expect(res.body.message).not.toMatch(/at Object|node_modules/);
    });
});
//# sourceMappingURL=rbac.test.js.map