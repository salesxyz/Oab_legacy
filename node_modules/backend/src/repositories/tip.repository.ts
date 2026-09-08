import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { tips } from '../db/schema';

export const tipRepository = {
  async list(activeOnly: boolean) {
    return db
      .select()
      .from(tips)
      .where(activeOnly ? eq(tips.active, true) : undefined)
      .orderBy(desc(tips.createdAt));
  },

  async findById(id: string) {
    const [row] = await db.select().from(tips).where(eq(tips.id, id));
    return row;
  },

  async tipOfTheDay() {
    // Determinístico por dia (mesma dica o dia inteiro para todos os usuários),
    // sem depender de estado externo.
    const active = await this.list(true);
    if (active.length === 0) return undefined;
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return active[dayIndex % active.length];
  },

  async create(data: { title: string; content: string; category?: string }) {
    const [row] = await db.insert(tips).values(data).returning();
    return row;
  },

  async update(id: string, data: Partial<typeof tips.$inferInsert>) {
    const [row] = await db.update(tips).set({ ...data, updatedAt: new Date() }).where(eq(tips.id, id)).returning();
    return row;
  },

  async delete(id: string) {
    await db.delete(tips).where(eq(tips.id, id));
  },
};
