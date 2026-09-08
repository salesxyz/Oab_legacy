import { and, asc, eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { courses, modules, contents, progress } from '../db/schema';

export const contentRepository = {
  // ---------- Cursos ----------
  async listCourses(publishedOnly: boolean) {
    return db
      .select()
      .from(courses)
      .where(publishedOnly ? eq(courses.status, 'PUBLICADO') : undefined)
      .orderBy(asc(courses.order));
  },

  async findCourseById(id: string) {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  },

  async createCourse(data: { title: string; description?: string; imageUrl?: string; order?: number }) {
    const [course] = await db.insert(courses).values(data).returning();
    return course;
  },

  async updateCourse(id: string, data: Partial<typeof courses.$inferInsert>) {
    const [course] = await db.update(courses).set({ ...data, updatedAt: new Date() }).where(eq(courses.id, id)).returning();
    return course;
  },

  async deleteCourse(id: string) {
    await db.delete(courses).where(eq(courses.id, id));
  },

  // ---------- Módulos ----------
  async listModulesByCourse(courseId: string) {
    return db.select().from(modules).where(eq(modules.courseId, courseId)).orderBy(asc(modules.order));
  },

  async findModuleById(id: string) {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  },

  async createModule(data: { courseId: string; title: string; description?: string; order?: number }) {
    const [module] = await db.insert(modules).values(data).returning();
    return module;
  },

  async updateModule(id: string, data: Partial<typeof modules.$inferInsert>) {
    const [module] = await db.update(modules).set({ ...data, updatedAt: new Date() }).where(eq(modules.id, id)).returning();
    return module;
  },

  async deleteModule(id: string) {
    await db.delete(modules).where(eq(modules.id, id));
  },

  async reorderModules(items: Array<{ id: string; order: number }>) {
    for (const item of items) {
      await db.update(modules).set({ order: item.order }).where(eq(modules.id, item.id));
    }
  },

  // ---------- Conteúdos ----------
  async listContentsByModule(moduleId: string, publishedOnly: boolean) {
    return db
      .select()
      .from(contents)
      .where(publishedOnly ? and(eq(contents.moduleId, moduleId), eq(contents.status, 'PUBLICADO')) : eq(contents.moduleId, moduleId))
      .orderBy(asc(contents.order));
  },

  async findContentById(id: string) {
    const [content] = await db.select().from(contents).where(eq(contents.id, id));
    return content;
  },

  async createContent(data: typeof contents.$inferInsert) {
    const [content] = await db.insert(contents).values(data).returning();
    return content;
  },

  async updateContent(id: string, data: Partial<typeof contents.$inferInsert>) {
    const [content] = await db.update(contents).set({ ...data, updatedAt: new Date() }).where(eq(contents.id, id)).returning();
    return content;
  },

  async deleteContent(id: string) {
    await db.delete(contents).where(eq(contents.id, id));
  },

  // ---------- Contagens para progresso ----------
  async countPublishedContentsByModule(moduleId: string) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contents)
      .where(and(eq(contents.moduleId, moduleId), eq(contents.status, 'PUBLICADO')));
    return count;
  },

  async countCompletedContentsByModuleForUser(moduleId: string, userId: string) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(progress)
      .innerJoin(contents, eq(progress.contentId, contents.id))
      .where(and(eq(contents.moduleId, moduleId), eq(progress.userId, userId), eq(progress.completed, true)));
    return count;
  },
};
