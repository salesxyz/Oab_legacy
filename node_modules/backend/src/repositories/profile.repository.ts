import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { profiles } from '../db/schema';

export const profileRepository = {
  async findByUserId(userId: string) {
    const [row] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return row;
  },

  async update(userId: string, data: Partial<typeof profiles.$inferInsert>) {
    const [row] = await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return row;
  },
};
