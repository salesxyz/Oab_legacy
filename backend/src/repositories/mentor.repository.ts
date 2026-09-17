import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { users } from '../db/schema';

function asNumber(value: unknown): number {
  return Number(value ?? 0);
}

export const mentorRepository = {
  async ensureStudent(id: string) {
    const [student] = await db.select({ id: users.id, name: users.name, role: users.role }).from(users).where(and(eq(users.id, id), eq(users.role, 'ALUNO')));
    return student;
  },

  async getDashboard() {
    const result = await db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE role = 'ALUNO') AS "totalStudents",
        (SELECT COUNT(*)::int FROM users WHERE role = 'ALUNO' AND status = 'ATIVO') AS "activeStudents",
        (SELECT COUNT(*)::int FROM users WHERE role = 'ALUNO' AND approved = true) AS "approvedStudents",
        (SELECT COUNT(*)::int FROM users WHERE role = 'ALUNO' AND approved = false) AS "pendingStudents",
        (SELECT COUNT(*)::int FROM courses) AS "totalCourses",
        (SELECT COUNT(*)::int FROM courses WHERE status = 'PUBLICADO') AS "publishedCourses",
        (SELECT COUNT(*)::int FROM contents WHERE status = 'PUBLICADO') AS "publishedContents",
        (SELECT COUNT(*)::int FROM questions WHERE active = true) AS "activeQuestions",
        (SELECT COUNT(*)::int FROM user_answers) AS "answeredQuestions",
        (SELECT COALESCE(ROUND(AVG(CASE WHEN correct THEN 100 ELSE 0 END)), 0)::int FROM user_answers) AS "averageAccuracyPercent",
        (SELECT COUNT(*)::int FROM simulations WHERE active = true) AS "activeSimulations",
        (SELECT COUNT(*)::int FROM simulation_results) AS "simulationAttempts",
        (SELECT COALESCE(ROUND(AVG(percent)), 0)::int FROM simulation_results) AS "averageSimulationPercent",
        (SELECT COUNT(*)::int FROM users WHERE role = 'ALUNO' AND last_login_at >= NOW() - INTERVAL '30 days') AS "activeStudentsLast30Days"
    `);
    const [row] = result.rows as Array<Record<string, unknown>>;
    return {
      students: { total: asNumber(row.totalStudents), active: asNumber(row.activeStudents), approved: asNumber(row.approvedStudents), pending: asNumber(row.pendingStudents), activeLast30Days: asNumber(row.activeStudentsLast30Days) },
      content: { totalCourses: asNumber(row.totalCourses), publishedCourses: asNumber(row.publishedCourses), publishedContents: asNumber(row.publishedContents) },
      questions: { active: asNumber(row.activeQuestions), answered: asNumber(row.answeredQuestions), averageAccuracyPercent: asNumber(row.averageAccuracyPercent) },
      simulations: { active: asNumber(row.activeSimulations), attempts: asNumber(row.simulationAttempts), averagePercent: asNumber(row.averageSimulationPercent) },
    };
  },

  async findStudentById(id: string) {
    const [student] = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status, photoUrl: users.photoUrl, subscriptionPlan: users.subscriptionPlan, accessExpiresAt: users.accessExpiresAt, approved: users.approved, approvedAt: users.approvedAt, createdAt: users.createdAt, lastLoginAt: users.lastLoginAt }).from(users).where(and(eq(users.id, id), eq(users.role, 'ALUNO')));
    if (!student) return undefined;
    const [moduleResult, performanceResult, simulationResult] = await Promise.all([
      db.execute(sql`SELECT c.id AS "courseId", c.title AS "courseTitle", m.id AS "moduleId", m.title AS "moduleTitle", COUNT(DISTINCT content.id) FILTER (WHERE content.status = 'PUBLICADO')::int AS "totalContents", COUNT(DISTINCT p.content_id) FILTER (WHERE p.completed = true)::int AS "completedContents", COALESCE(ROUND(AVG(p.percent) FILTER (WHERE content.status = 'PUBLICADO')), 0)::int AS "progressPercent", MAX(p.started_at) AS "lastActivityAt" FROM modules m INNER JOIN courses c ON c.id = m.course_id LEFT JOIN contents content ON content.module_id = m.id LEFT JOIN progress p ON p.content_id = content.id AND p.user_id = ${id} GROUP BY c.id, c.title, c.order, m.id, m.title, m.order ORDER BY c.order, m.order`),
      db.execute(sql`SELECT q.subject, COUNT(*)::int AS total, SUM(CASE WHEN ua.correct THEN 1 ELSE 0 END)::int AS correct, COALESCE(ROUND(AVG(CASE WHEN ua.correct THEN 100 ELSE 0 END)), 0)::int AS percent FROM user_answers ua INNER JOIN questions q ON q.id = ua.question_id WHERE ua.user_id = ${id} GROUP BY q.subject ORDER BY total DESC, q.subject`),
      db.execute(sql`SELECT sr.id, sr.simulation_id AS "simulationId", s.title, sr.correct_count AS "correctCount", sr.wrong_count AS "wrongCount", sr.percent, sr.time_spent_seconds AS "timeSpentSeconds", sr.created_at AS "createdAt" FROM simulation_results sr INNER JOIN simulations s ON s.id = sr.simulation_id WHERE sr.user_id = ${id} ORDER BY sr.created_at DESC LIMIT 20`),
    ]);
    const modules = moduleResult.rows as Array<Record<string, unknown>>;
    const performanceBySubject = performanceResult.rows as Array<Record<string, unknown>>;
    const simulationResults = simulationResult.rows as Array<Record<string, unknown>>;
    const totalContents = modules.reduce((sum, module) => sum + asNumber(module.totalContents), 0);
    const completedContents = modules.reduce((sum, module) => sum + asNumber(module.completedContents), 0);
    const answeredQuestions = performanceBySubject.reduce((sum, subject) => sum + asNumber(subject.total), 0);
    const correctAnswers = performanceBySubject.reduce((sum, subject) => sum + asNumber(subject.correct), 0);
    return { student, summary: { totalContents, completedContents, progressPercent: totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0, answeredQuestions, correctAnswers, accuracyPercent: answeredQuestions > 0 ? Math.round((correctAnswers / answeredQuestions) * 100) : 0, simulationAttempts: simulationResults.length, averageSimulationPercent: simulationResults.length > 0 ? Math.round(simulationResults.reduce((sum, result) => sum + asNumber(result.percent), 0) / simulationResults.length) : 0 }, modules, performanceBySubject, simulationResults };
  },

  async getStudentPerformance(id: string) {
    const student = await this.ensureStudent(id);
    if (!student) return undefined;
    const [subjects, timeline] = await Promise.all([
      db.execute(sql`SELECT q.subject, COUNT(*)::int AS total, SUM(CASE WHEN ua.correct THEN 1 ELSE 0 END)::int AS correct, COALESCE(ROUND(AVG(CASE WHEN ua.correct THEN 100 ELSE 0 END)), 0)::int AS percent FROM user_answers ua INNER JOIN questions q ON q.id = ua.question_id WHERE ua.user_id = ${id} GROUP BY q.subject ORDER BY total DESC, q.subject`),
      db.execute(sql`SELECT DATE(ua.answered_at) AS date, COUNT(*)::int AS total, SUM(CASE WHEN ua.correct THEN 1 ELSE 0 END)::int AS correct, COALESCE(ROUND(AVG(CASE WHEN ua.correct THEN 100 ELSE 0 END)), 0)::int AS percent FROM user_answers ua WHERE ua.user_id = ${id} AND ua.answered_at >= NOW() - INTERVAL '90 days' GROUP BY DATE(ua.answered_at) ORDER BY date DESC`),
    ]);
    return { student, bySubject: subjects.rows, timeline: timeline.rows };
  },

  async listStudentAnswers(id: string, params: { page: number; pageSize: number; subject?: string }) {
    const student = await this.ensureStudent(id);
    if (!student) return undefined;
    const offset = (params.page - 1) * params.pageSize;
    const subjectFilter = params.subject?.trim() ? sql`AND q.subject = ${params.subject.trim()}` : sql``;
    const result = await db.execute(sql`
      SELECT
        ua.id,
        ua.question_id AS "questionId",
        q.subject,
        q.statement,
        ua.alternative_id AS "alternativeId",
        ua.correct,
        ua.response_time_ms AS "responseTimeMs",
        ua.answered_at AS "answeredAt"
      FROM user_answers ua
      INNER JOIN questions q ON q.id = ua.question_id
      WHERE ua.user_id = ${id} ${subjectFilter}
      ORDER BY ua.answered_at DESC
      LIMIT ${params.pageSize} OFFSET ${offset}
    `);
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(sql`user_answers ua INNER JOIN questions q ON q.id = ua.question_id`).where(sql`ua.user_id = ${id} ${subjectFilter}`);
    return { student, page: params.page, pageSize: params.pageSize, total: count, rows: result.rows };
  },

  async listStudentSimulations(id: string, params: { page: number; pageSize: number }) {
    const student = await this.ensureStudent(id);
    if (!student) return undefined;
    const offset = (params.page - 1) * params.pageSize;
    const result = await db.execute(sql`
      SELECT
        sr.id,
        sr.simulation_id AS "simulationId",
        s.title,
        s.question_count AS "questionCount",
        sr.correct_count AS "correctCount",
        sr.wrong_count AS "wrongCount",
        sr.percent,
        sr.time_spent_seconds AS "timeSpentSeconds",
        sr.created_at AS "createdAt"
      FROM simulation_results sr
      INNER JOIN simulations s ON s.id = sr.simulation_id
      WHERE sr.user_id = ${id}
      ORDER BY sr.created_at DESC
      LIMIT ${params.pageSize} OFFSET ${offset}
    `);
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(sql`simulation_results sr`).where(sql`sr.user_id = ${id}`);
    return { student, page: params.page, pageSize: params.pageSize, total: count, rows: result.rows };
  },
};
