import { boolean, integer, pgTable, timestamp, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { difficultyEnum } from './enums';
import { modules } from './content';
import { users } from './users';

export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  moduleId: uuid('module_id')
    .notNull()
    .references(() => modules.id, { onDelete: 'cascade' }),
  statement: text('statement').notNull(),
  explanation: text('explanation'),
  difficulty: difficultyEnum('difficulty').notNull().default('MEDIO'),
  subject: varchar('subject', { length: 150 }).notNull(),
  examBoard: varchar('exam_board', { length: 100 }),
  year: integer('year'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const alternatives = pgTable('alternatives', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  correct: boolean('correct').notNull().default(false),
  order: integer('order').notNull().default(0),
});

export const userAnswers = pgTable('user_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  alternativeId: uuid('alternative_id')
    .notNull()
    .references(() => alternatives.id, { onDelete: 'cascade' }),
  correct: boolean('correct').notNull(),
  responseTimeMs: integer('response_time_ms'),
  answeredAt: timestamp('answered_at', { withTimezone: true }).notNull().defaultNow(),
});

export const questionsRelations = relations(questions, ({ one, many }) => ({
  module: one(modules, { fields: [questions.moduleId], references: [modules.id] }),
  alternatives: many(alternatives),
}));

export const alternativesRelations = relations(alternatives, ({ one }) => ({
  question: one(questions, { fields: [alternatives.questionId], references: [questions.id] }),
}));
