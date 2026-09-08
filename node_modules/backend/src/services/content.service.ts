import { contentRepository } from '../repositories/content.repository';
import { progressRepository } from '../repositories/progress.repository';
import { gamificationService } from './gamification.service';
import { XP_RULES } from '../utils/gamificationRules';
import { ApiError } from '../utils/ApiError';

export const contentService = {
  // ---------- Cursos ----------
  async listCourses(isAdmin: boolean) {
    return contentRepository.listCourses(!isAdmin);
  },

  async getCourse(id: string, isAdmin: boolean) {
    const course = await contentRepository.findCourseById(id);
    if (!course) throw ApiError.notFound('Curso não encontrado.');
    if (!isAdmin && course.status !== 'PUBLICADO') throw ApiError.notFound('Curso não encontrado.');
    return course;
  },

  createCourse: contentRepository.createCourse,
  updateCourse: contentRepository.updateCourse,
  deleteCourse: contentRepository.deleteCourse,

  // ---------- Módulos (com progresso calculado a partir de dados reais) ----------
  async listModulesWithProgress(courseId: string, userId: string | undefined, isAdmin: boolean) {
    const rawModules = await contentRepository.listModulesByCourse(courseId);

    return Promise.all(
      rawModules.map(async (module) => {
        const totalPublished = await contentRepository.countPublishedContentsByModule(module.id);
        const completed = userId ? await contentRepository.countCompletedContentsByModuleForUser(module.id, userId) : 0;
        const percent = totalPublished > 0 ? Math.round((completed / totalPublished) * 100) : 0;

        return {
          ...module,
          totalContents: totalPublished,
          completedContents: completed,
          progressPercent: percent,
        };
      }),
    );
  },

  async getModule(id: string) {
    const module = await contentRepository.findModuleById(id);
    if (!module) throw ApiError.notFound('Módulo não encontrado.');
    return module;
  },

  createModule: contentRepository.createModule,
  updateModule: contentRepository.updateModule,
  deleteModule: contentRepository.deleteModule,
  reorderModules: contentRepository.reorderModules,

  // ---------- Conteúdos ----------
  async listContents(moduleId: string, isAdmin: boolean) {
    return contentRepository.listContentsByModule(moduleId, !isAdmin);
  },

  async getContent(id: string, isAdmin: boolean) {
    const content = await contentRepository.findContentById(id);
    if (!content) throw ApiError.notFound('Conteúdo não encontrado.');
    if (!isAdmin && content.status !== 'PUBLICADO') throw ApiError.notFound('Conteúdo não encontrado.');
    return content;
  },

  createContent: contentRepository.createContent,
  updateContent: contentRepository.updateContent,
  deleteContent: contentRepository.deleteContent,

  // ---------- Progresso do aluno (sempre baseado em dados reais) ----------
  async markContentProgress(userId: string, contentId: string, percent: number) {
    const content = await contentRepository.findContentById(contentId);
    if (!content || content.status !== 'PUBLICADO') throw ApiError.notFound('Conteúdo não encontrado.');

    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    const { row, justCompleted } = await progressRepository.upsert(userId, contentId, clamped);

    if (justCompleted) {
      await gamificationService.awardXp(userId, XP_RULES.CONTENT_COMPLETED);
      await gamificationService.registerStudyActivity(userId);

      const totalPublished = await contentRepository.countPublishedContentsByModule(content.moduleId);
      const completedInModule = await contentRepository.countCompletedContentsByModuleForUser(content.moduleId, userId);
      if (totalPublished > 0 && completedInModule >= totalPublished) {
        await gamificationService.checkModuleCompletionAchievement(userId);
      }
    }

    return row;
  },

  async getUserProgressOverview(userId: string) {
    return progressRepository.listForUser(userId);
  },
};
