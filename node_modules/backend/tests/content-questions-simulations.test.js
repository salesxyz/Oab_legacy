"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const client_1 = require("../src/db/client");
const schema_1 = require("../src/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
describe('Conteúdos, questões e simulados', () => {
    afterAll(async () => {
        await client_1.pool.end();
    });
    let adminToken;
    let studentToken;
    let courseId;
    let moduleId;
    let contentId;
    let questionId;
    let alternativeIds;
    beforeAll(async () => {
        await (0, supertest_1.default)(app_1.app).post('/auth/register').send({ name: 'Admin CQS', email: 'jest.admin.cqs@teste.com', password: 'SenhaForte1' });
        await client_1.db.update(schema_1.users).set({ role: 'ADMIN' }).where((0, drizzle_orm_1.eq)(schema_1.users.email, 'jest.admin.cqs@teste.com'));
        const adminLogin = await (0, supertest_1.default)(app_1.app).post('/auth/login').send({ email: 'jest.admin.cqs@teste.com', password: 'SenhaForte1' });
        adminToken = adminLogin.body.accessToken;
        const studentReg = await (0, supertest_1.default)(app_1.app)
            .post('/auth/register')
            .send({ name: 'Aluno CQS', email: 'jest.aluno.cqs@teste.com', password: 'SenhaForte1' });
        studentToken = studentReg.body.accessToken;
    });
    it('admin cria curso, módulo e conteúdo', async () => {
        const course = await (0, supertest_1.default)(app_1.app)
            .post('/courses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ title: 'Direito Penal', status: 'PUBLICADO' });
        courseId = course.body.id;
        expect(course.status).toBe(201);
        const module = await (0, supertest_1.default)(app_1.app)
            .post('/modules')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ courseId, title: 'Teoria do Crime' });
        moduleId = module.body.id;
        expect(module.status).toBe(201);
        const content = await (0, supertest_1.default)(app_1.app)
            .post('/contents')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ moduleId, title: 'Conceito de crime', type: 'TEXTO', body: 'Texto...', status: 'PUBLICADO' });
        contentId = content.body.id;
        expect(content.status).toBe(201);
    });
    it('aluno consegue listar cursos publicados sem autenticação', async () => {
        const res = await (0, supertest_1.default)(app_1.app).get('/courses');
        expect(res.status).toBe(200);
        expect(res.body.some((c) => c.id === courseId)).toBe(true);
    });
    it('aluno marca progresso de um conteúdo e ganha XP', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .post(`/contents/${contentId}/progress`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ percent: 100 });
        expect(res.status).toBe(200);
        expect(res.body.completed).toBe(true);
        const profile = await (0, supertest_1.default)(app_1.app).get('/profile').set('Authorization', `Bearer ${studentToken}`);
        expect(profile.body.gamification.xp).toBeGreaterThan(0);
    });
    it('admin cria questão com validação de alternativa única correta', async () => {
        const invalid = await (0, supertest_1.default)(app_1.app)
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
        const valid = await (0, supertest_1.default)(app_1.app)
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
        const res = await (0, supertest_1.default)(app_1.app).get(`/questions/${questionId}`);
        expect(res.status).toBe(200);
        for (const alt of res.body.alternatives) {
            expect(alt).not.toHaveProperty('correct');
        }
        alternativeIds = res.body.alternatives.map((a) => a.id);
    });
    it('aluno responde a questão e recebe feedback correto', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .post(`/questions/${questionId}/answer`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ alternativeId: alternativeIds[0] });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('correct');
        expect(res.body).toHaveProperty('correctAlternativeId');
        expect(res.body).toHaveProperty('explanation');
    });
    it('aluno NÃO consegue editar a questão diretamente', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .patch(`/questions/${questionId}`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ statement: 'Tentativa de alterar' });
        expect(res.status).toBe(403);
    });
    it('fluxo completo de simulado: criar, iniciar e finalizar', async () => {
        const sim = await (0, supertest_1.default)(app_1.app)
            .post('/simulations')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            title: 'Simulado de teste',
            questionCount: 1,
            timeLimitMinutes: 10,
            questionIds: [questionId],
        });
        expect(sim.status).toBe(201);
        const start = await (0, supertest_1.default)(app_1.app).post(`/simulations/${sim.body.id}/start`).set('Authorization', `Bearer ${studentToken}`);
        expect(start.status).toBe(200);
        expect(start.body.questions).toHaveLength(1);
        expect(start.body.questions[0].alternatives[0]).not.toHaveProperty('correct');
        const finish = await (0, supertest_1.default)(app_1.app)
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
//# sourceMappingURL=content-questions-simulations.test.js.map