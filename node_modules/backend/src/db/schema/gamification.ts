import { integer, pgTable, timestamp, unique, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const gamification = pgTable('gamification', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  xp: integer('xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  streakDays: integer('streak_days').notNull().default(0),
  lastStudyDate: timestamp('last_study_date', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const achievements = pgTable('achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
});

export const userAchievements = pgTable(
  'user_achievements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    gamificationId: uuid('gamification_id')
      .notNull()
      .references(() => gamification.id, { onDelete: 'cascade' }),
    achievementId: uuid('achievement_id')
      .notNull()
      .references(() => achievements.id, { onDelete: 'cascade' }),
    unlockedAt: timestamp('unlocked_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    gamificationAchievementUnique: unique().on(table.gamificationId, table.achievementId),
  }),
);

export const gamificationRelations = relations(gamification, ({ one, many }) => ({
  user: one(users, { fields: [gamification.userId], references: [users.id] }),
  achievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  gamification: one(gamification, { fields: [userAchievements.gamificationId], references: [gamification.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));
