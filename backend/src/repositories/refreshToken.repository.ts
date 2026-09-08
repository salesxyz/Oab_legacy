import { and, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { refreshTokens } from '../db/schema';

export const refreshTokenRepository = {
  async create(userId: string, tokenHash: string, expiresAt: Date) {
    const [row] = await db.insert(refreshTokens).values({ userId, tokenHash, expiresAt }).returning();
    return row;
  },

  async findValidByHash(tokenHash: string) {
    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.tokenHash, tokenHash), eq(refreshTokens.revoked, false)));
    return row;
  },

  async revoke(id: string, replacedBy?: string) {
    await db.update(refreshTokens).set({ revoked: true, replacedBy }).where(eq(refreshTokens.id, id));
  },

  async revokeAllForUser(userId: string) {
    await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.userId, userId));
  },
};
