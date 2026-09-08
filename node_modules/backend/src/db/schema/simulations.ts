import { boolean, doublePrecision, integer, jsonb, pgTable, timestamp, unique, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { questions } from './questions';
import { users } from './users';

export const simulations = pgTable('simulations', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  questionCount: integer('question_count').notNull(),
  timeLimitMinutes: integer('time_limit_minutes').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const simulationQuestions = pgTable(
  'simulation_questions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    simulationId: uuid('simulation_id')
      .notNull()
      .references(() => simulations.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    order: integer('order').notNull().default(0),
  },
  (table) => ({
    simQuestionUnique: unique().on(table.simulationId, table.questionId),
  }),
);

export const simulationResults = pgTable('simulation_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  simulationId: uuid('simulation_id')
    .notNull()
    .references(() => simulations.id, { onDelete: 'cascade' }),
  correctCount: integer('correct_count').notNull(),
  wrongCount: integer('wrong_count').notNull(),
  percent: doublePrecision('percent').notNull(),
  timeSpentSeconds: integer('time_spent_seconds').notNull(),
  answersJson: jsonb('answers_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const simulationsRelations = relations(simulations, ({ many }) => ({
  questions: many(simulationQuestions),
  results: many(simulationResults),
}));

export const simulationQuestionsRelations = relations(simulationQuestions, ({ one }) => ({
  simulation: one(simulations, { fields: [simulationQuestions.simulationId], references: [simulations.id] }),
  question: one(questions, { fields: [simulationQuestions.questionId], references: [questions.id] }),
}));
