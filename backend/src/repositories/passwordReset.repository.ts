import { and, desc, eq, gt } from 'drizzle-orm';
import { db } from '../db/client';
import { passwordResets } from '../db/schema';

export const passwordResetRepository = {
  async create(userId: string, codeHash: string, expiresAt: Date) {
    const [row] = await db.insert(passwordResets).values({ userId, codeHash, expiresAt }).returning();
    return row;
  },

  async findLatestActiveForUser(userId: string) {
    const [row] = await db
      .select()
      .from(passwordResets)
      .where(and(eq(passwordResets.userId, userId), eq(passwordResets.used, false), gt(passwordResets.expiresAt, new Date())))
      .orderBy(desc(passwordResets.createdAt))
      .limit(1);
    return row;
  },

  async bumpAttempts(id: string, attempts: number) {
    await db.update(passwordResets).set({ attempts }).where(eq(passwordResets.id, id));
  },

  async markUsed(id: string) {
    await db.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, id));
  },
};
