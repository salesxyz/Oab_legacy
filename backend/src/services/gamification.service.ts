import { gamificationRepository } from '../repositories/gamification.repository';
import { calculateLevel, isConsecutiveDay, isNewDay } from '../utils/gamificationRules';
import { logger } from '../config/logger';

export const gamificationService = {
  async awardXp(userId: string, amount: number) {
    const current = await gamificationRepository.findByUserId(userId);
    if (!current) return null;

    const newXp = current.xp + amount;
    const newLevel = calculateLevel(newXp);
    return gamificationRepository.addXp(userId, amount, newLevel);
  },

  async registerStudyActivity(userId: string) {
    const current = await gamificationRepository.findByUserId(userId);
    if (!current) return;

    const now = new Date();
    if (!isNewDay(current.lastStudyDate, now)) return; // já contabilizou hoje

    const consecutive = isConsecutiveDay(current.lastStudyDate, now);
    const newStreak = consecutive ? current.streakDays + 1 : 1;
    await gamificationRepository.updateStreak(userId, newStreak, now);

    await this.checkStreakAchievements(userId, newStreak);
  },

  async checkStreakAchievements(userId: string, streakDays: number) {
    const gam = await gamificationRepository.findByUserId(userId);
    if (!gam) return;

    if (streakDays >= 7) await this.tryUnlock(gam.id, 'STREAK_7_DAYS');
    if (streakDays >= 30) await this.tryUnlock(gam.id, 'STREAK_30_DAYS');
  },

  async checkQuestionAchievements(userId: string, totalAnswered: number, isFirstOverall: boolean) {
    const gam = await gamificationRepository.findByUserId(userId);
    if (!gam) return;

    if (isFirstOverall) await this.tryUnlock(gam.id, 'FIRST_QUESTION');
    if (totalAnswered === 10) await this.tryUnlock(gam.id, 'QUESTIONS_10');
    if (totalAnswered === 100) await this.tryUnlock(gam.id, 'QUESTIONS_100');
  },

  async checkSimulationAchievements(userId: string, isFirstSimulation: boolean, percent: number) {
    const gam = await gamificationRepository.findByUserId(userId);
    if (!gam) return;

    if (isFirstSimulation) await this.tryUnlock(gam.id, 'FIRST_SIMULATION');
    if (percent >= 80) await this.tryUnlock(gam.id, 'ACCURACY_80');
  },

  async checkModuleCompletionAchievement(userId: string) {
    const gam = await gamificationRepository.findByUserId(userId);
    if (!gam) return;
    await this.tryUnlock(gam.id, 'MODULE_COMPLETED');
  },

  async tryUnlock(gamificationId: string, achievementCode: string) {
    const achievement = await gamificationRepository.findAchievementByCode(achievementCode);
    if (!achievement) {
      logger.warn(`Conquista "${achievementCode}" não encontrada no seed. Pulei desbloqueio.`);
      return;
    }
    const already = await gamificationRepository.hasUnlocked(gamificationId, achievement.id);
    if (already) return;
    await gamificationRepository.unlockAchievement(gamificationId, achievement.id);
  },

  async getProfileSummary(userId: string) {
    const gam = await gamificationRepository.findByUserId(userId);
    if (!gam) return null;
    const unlocked = await gamificationRepository.listUnlockedForUser(gam.id);
    return { xp: gam.xp, level: gam.level, streakDays: gam.streakDays, achievements: unlocked };
  },

  async getRanking(limit = 50) {
    return gamificationRepository.ranking(limit);
  },
};
