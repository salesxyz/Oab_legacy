import { boolean, integer, pgTable, timestamp, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { contentStatusEnum, contentTypeEnum } from './enums';
import { users } from './users';

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  phase: varchar('phase', { length: 20 }).notNull().default('OBJETIVA'),
  status: contentStatusEnum('status').notNull().default('RASCUNHO'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const modules = pgTable('modules', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const contents = pgTable('contents', {
  id: uuid('id').defaultRandom().primaryKey(),
  moduleId: uuid('module_id')
    .notNull()
    .references(() => modules.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  type: contentTypeEnum('type').notNull(),
  body: text('body'),
  videoUrl: text('video_url'),
  materialUrl: text('material_url'),
  order: integer('order').notNull().default(0),
  status: contentStatusEnum('status').notNull().default('RASCUNHO'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const progress = pgTable(
  'progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    contentId: uuid('content_id')
      .notNull()
      .references(() => contents.id, { onDelete: 'cascade' }),
    percent: integer('percent').notNull().default(0),
    completed: boolean('completed').notNull().default(false),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    userContentUnique: unique().on(table.userId, table.contentId),
  }),
);

export const tips = pgTable('tips', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, { fields: [modules.courseId], references: [courses.id] }),
  contents: many(contents),
}));

export const contentsRelations = relations(contents, ({ one, many }) => ({
  module: one(modules, { fields: [contents.moduleId], references: [modules.id] }),
  progress: many(progress),
}));
