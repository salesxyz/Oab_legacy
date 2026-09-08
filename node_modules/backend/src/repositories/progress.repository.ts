import { and, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { progress } from '../db/schema';

export const progressRepository = {
  async findByUserAndContent(userId: string, contentId: string) {
    const [row] = await db.select().from(progress).where(and(eq(progress.userId, userId), eq(progress.contentId, contentId)));
    return row;
  },

  async upsert(userId: string, contentId: string, percent: number) {
    const existing = await this.findByUserAndContent(userId, contentId);
    const completed = percent >= 100;

    if (existing) {
      const [row] = await db
        .update(progress)
        .set({
          percent,
          completed,
          completedAt: completed && !existing.completed ? new Date() : existing.completedAt,
        })
        .where(eq(progress.id, existing.id))
        .returning();
      return { row, justCompleted: completed && !existing.completed };
    }

    const [row] = await db
      .insert(progress)
      .values({ userId, contentId, percent, completed, completedAt: completed ? new Date() : null })
      .returning();
    return { row, justCompleted: completed };
  },

  async listForUser(userId: string) {
    return db.select().from(progress).where(eq(progress.userId, userId));
  },
};
