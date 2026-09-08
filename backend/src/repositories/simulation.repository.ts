import { asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { simulations, simulationQuestions, simulationResults, questions, alternatives } from '../db/schema';

export const simulationRepository = {
  async list(activeOnly: boolean) {
    return db
      .select()
      .from(simulations)
      .where(activeOnly ? eq(simulations.active, true) : undefined)
      .orderBy(desc(simulations.createdAt));
  },

  async findById(id: string) {
    const [row] = await db.select().from(simulations).where(eq(simulations.id, id));
    return row;
  },

  async create(data: typeof simulations.$inferInsert, questionIds: string[]) {
    const [simulation] = await db.insert(simulations).values(data).returning();
    if (questionIds.length) {
      await db.insert(simulationQuestions).values(
        questionIds.map((questionId, idx) => ({ simulationId: simulation.id, questionId, order: idx })),
      );
    }
    return simulation;
  },

  async update(id: string, data: Partial<typeof simulations.$inferInsert>) {
    const [row] = await db.update(simulations).set({ ...data, updatedAt: new Date() }).where(eq(simulations.id, id)).returning();
    return row;
  },

  async delete(id: string) {
    await db.delete(simulations).where(eq(simulations.id, id));
  },

  async getQuestionsForSimulation(simulationId: string) {
    const links = await db
      .select({ questionId: simulationQuestions.questionId, order: simulationQuestions.order })
      .from(simulationQuestions)
      .where(eq(simulationQuestions.simulationId, simulationId))
      .orderBy(asc(simulationQuestions.order));

    if (links.length === 0) return [];

    const qs = await db
      .select()
      .from(questions)
      .where(inArray(questions.id, links.map((l) => l.questionId)));

    const altsByQuestion = await db
      .select()
      .from(alternatives)
      .where(inArray(alternatives.questionId, links.map((l) => l.questionId)));

    const order = new Map(links.map((l) => [l.questionId, l.order]));

    return qs
      .map((q) => ({
        ...q,
        order: order.get(q.id) ?? 0,
        alternatives: altsByQuestion.filter((a) => a.questionId === q.id).sort((a, b) => a.order - b.order),
      }))
      .sort((a, b) => a.order - b.order);
  },

  async saveResult(data: {
    userId: string;
    simulationId: string;
    correctCount: number;
    wrongCount: number;
    percent: number;
    timeSpentSeconds: number;
    answersJson: unknown;
  }) {
    const [row] = await db.insert(simulationResults).values(data).returning();
    return row;
  },

  async countResultsForUser(userId: string) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(simulationResults)
      .where(eq(simulationResults.userId, userId));
    return count;
  },

  async listResultsForUser(userId: string) {
    return db.select().from(simulationResults).where(eq(simulationResults.userId, userId)).orderBy(desc(simulationResults.createdAt));
  },

  async getResultById(id: string) {
    const [row] = await db.select().from(simulationResults).where(eq(simulationResults.id, id));
    return row;
  },
};
