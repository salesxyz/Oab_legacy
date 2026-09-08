import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { gamification, achievements, userAchievements, users, profiles } from '../db/schema';

export const gamificationRepository = {
  async findByUserId(userId: string) {
    const [row] = await db.select().from(gamification).where(eq(gamification.userId, userId));
    return row;
  },

  async addXp(userId: string, amount: number, newLevel: number) {
    const [row] = await db
      .update(gamification)
      .set({ xp: sql`${gamification.xp} + ${amount}`, level: newLevel, updatedAt: new Date() })
      .where(eq(gamification.userId, userId))
      .returning();
    return row;
  },

  async updateStreak(userId: string, streakDays: number, lastStudyDate: Date) {
    const [row] = await db
      .update(gamification)
      .set({ streakDays, lastStudyDate, updatedAt: new Date() })
      .where(eq(gamification.userId, userId))
      .returning();
    return row;
  },

  async listAchievements() {
    return db.select().from(achievements);
  },

  async findAchievementByCode(code: string) {
    const [row] = await db.select().from(achievements).where(eq(achievements.code, code));
    return row;
  },

  async hasUnlocked(gamificationId: string, achievementId: string) {
    const [row] = await db
      .select()
      .from(userAchievements)
      .where(sql`${userAchievements.gamificationId} = ${gamificationId} AND ${userAchievements.achievementId} = ${achievementId}`);
    return Boolean(row);
  },

  async unlockAchievement(gamificationId: string, achievementId: string) {
    await db.insert(userAchievements).values({ gamificationId, achievementId }).onConflictDoNothing();
  },

  async listUnlockedForUser(gamificationId: string) {
    return db
      .select({
        id: achievements.id,
        code: achievements.code,
        title: achievements.title,
        description: achievements.description,
        icon: achievements.icon,
        unlockedAt: userAchievements.unlockedAt,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.gamificationId, gamificationId));
  },

  async ranking(limit: number) {
    return db
      .select({
        userId: users.id,
        name: users.name,
        photoUrl: users.photoUrl,
        xp: gamification.xp,
        level: gamification.level,
      })
      .from(gamification)
      .innerJoin(users, eq(gamification.userId, users.id))
      .innerJoin(profiles, eq(profiles.userId, users.id))
      .where(sql`${users.role} = 'ALUNO' AND ${profiles.publicRanking} = true AND ${users.status} = 'ATIVO'`)
      .orderBy(desc(gamification.xp))
      .limit(limit);
  },
};
