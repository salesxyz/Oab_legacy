import { and, desc, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { questions, alternatives, userAnswers } from '../db/schema';

interface QuestionFilters {
  subject?: string;
  difficulty?: 'FACIL' | 'MEDIO' | 'DIFICIL';
  examBoard?: string;
  year?: number;
  moduleId?: string;
  onlyUnanswered?: string; // userId
  onlyWrong?: string; // userId
  page: number;
  pageSize: number;
}

export const questionRepository = {
  async list(filters: QuestionFilters) {
    const conditions = [eq(questions.active, true)];
    if (filters.subject) conditions.push(eq(questions.subject, filters.subject));
    if (filters.difficulty) conditions.push(eq(questions.difficulty, filters.difficulty));
    if (filters.examBoard) conditions.push(eq(questions.examBoard, filters.examBoard));
    if (filters.year) conditions.push(eq(questions.year, filters.year));
    if (filters.moduleId) conditions.push(eq(questions.moduleId, filters.moduleId));

    let answeredIds: string[] = [];
    let wrongIds: string[] = [];

    if (filters.onlyUnanswered || filters.onlyWrong) {
      const userId = filters.onlyUnanswered ?? filters.onlyWrong!;
      const rows = await db
        .select({ questionId: userAnswers.questionId, correct: userAnswers.correct })
        .from(userAnswers)
        .where(eq(userAnswers.userId, userId));
      answeredIds = rows.map((r) => r.questionId);
      wrongIds = rows.filter((r) => !r.correct).map((r) => r.questionId);
    }

    if (filters.onlyUnanswered && answeredIds.length > 0) {
      conditions.push(notInArray(questions.id, answeredIds));
    }
    if (filters.onlyWrong) {
      if (wrongIds.length === 0) return { rows: [], total: 0 };
      conditions.push(inArray(questions.id, wrongIds));
    }

    const offset = (filters.page - 1) * filters.pageSize;

    const rows = await db
      .select()
      .from(questions)
      .where(and(...conditions))
      .orderBy(desc(questions.createdAt))
      .limit(filters.pageSize)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(questions)
      .where(and(...conditions));

    return { rows, total: count };
  },

  async findById(id: string) {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  },

  async findWithAlternatives(id: string) {
    const question = await this.findById(id);
    if (!question) return undefined;
    const alts = await db.select().from(alternatives).where(eq(alternatives.questionId, id)).orderBy(alternatives.order);
    return { ...question, alternatives: alts };
  },

  async create(data: typeof questions.$inferInsert, alts: Array<{ text: string; correct: boolean; order?: number }>) {
    const [question] = await db.insert(questions).values(data).returning();
    if (alts.length) {
      await db.insert(alternatives).values(alts.map((a, idx) => ({ ...a, order: a.order ?? idx, questionId: question.id })));
    }
    return question;
  },

  async update(id: string, data: Partial<typeof questions.$inferInsert>) {
    const [question] = await db.update(questions).set({ ...data, updatedAt: new Date() }).where(eq(questions.id, id)).returning();
    return question;
  },

  async delete(id: string) {
    await db.delete(questions).where(eq(questions.id, id));
  },

  async replaceAlternatives(questionId: string, alts: Array<{ text: string; correct: boolean; order?: number }>) {
    await db.delete(alternatives).where(eq(alternatives.questionId, questionId));
    if (alts.length) {
      await db.insert(alternatives).values(alts.map((a, idx) => ({ ...a, order: a.order ?? idx, questionId })));
    }
  },

  async findAlternativeById(id: string) {
    const [alt] = await db.select().from(alternatives).where(eq(alternatives.id, id));
    return alt;
  },

  async recordAnswer(data: {
    userId: string;
    questionId: string;
    alternativeId: string;
    correct: boolean;
    responseTimeMs?: number;
  }) {
    const [row] = await db.insert(userAnswers).values(data).returning();
    return row;
  },

  async countAnswersForUser(userId: string) {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(userAnswers).where(eq(userAnswers.userId, userId));
    return count;
  },

  async listAnswersForUser(userId: string, limit = 50) {
    return db.select().from(userAnswers).where(eq(userAnswers.userId, userId)).orderBy(desc(userAnswers.answeredAt)).limit(limit);
  },

  async performanceBySubjectForUser(userId: string) {
    return db.execute<{ subject: string; total: number; correct: number }>(sql`
      SELECT q.subject as subject,
             COUNT(*)::int as total,
             SUM(CASE WHEN ua.correct THEN 1 ELSE 0 END)::int as correct
      FROM user_answers ua
      INNER JOIN questions q ON q.id = ua.question_id
      WHERE ua.user_id = ${userId}
      GROUP BY q.subject
      ORDER BY total DESC
    `);
  },

  async listDistinctSubjects() {
    const rows = await db.selectDistinct({ subject: questions.subject }).from(questions).where(eq(questions.active, true));
    return rows.map((r) => r.subject);
  },
};
