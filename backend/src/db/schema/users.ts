import { boolean, integer, jsonb, pgTable, timestamp, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { roleEnum, subscriptionPlanEnum, userStatusEnum } from './enums';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  photoUrl: text('photo_url'),
  role: roleEnum('role').notNull().default('ALUNO'),
  status: userStatusEnum('status').notNull().default('ATIVO'),
  subscriptionPlan: subscriptionPlanEnum('subscription_plan'),
  accessExpiresAt: timestamp('access_expires_at', { withTimezone: true }),
  approved: boolean('approved').notNull().default(false),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  birthDate: timestamp('birth_date', { withTimezone: true }),
  goal: text('goal'),
  preferences: jsonb('preferences'),
  accessibilitySettings: jsonb('accessibility_settings'),
  publicRanking: boolean('public_ranking').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  revoked: boolean('revoked').notNull().default(false),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  replacedBy: uuid('replaced_by'),
});

export const passwordResets = pgTable('password_resets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  codeHash: varchar('code_hash', { length: 255 }).notNull(),
  attempts: integer('attempts').notNull().default(0),
  used: boolean('used').notNull().default(false),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  refreshTokens: many(refreshTokens),
  passwordResets: many(passwordResets),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));
