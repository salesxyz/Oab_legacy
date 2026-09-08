import { apiRequest } from './httpClient';
import type { Content, Course, ModuleWithProgress, ProgressRecord } from '../types/student';

export const courseApi = {
  listCourses() {
    return apiRequest<Course[]>('/courses', { method: 'GET' });
  },

  getCourse(id: string) {
    return apiRequest<Course>(`/courses/${id}`, { method: 'GET' });
  },

  listModules(courseId: string) {
    return apiRequest<ModuleWithProgress[]>(`/courses/${courseId}/modules`, { method: 'GET' });
  },

  listContents(moduleId: string) {
    return apiRequest<Content[]>(`/modules/${moduleId}/contents`, { method: 'GET' });
  },

  getContent(id: string) {
    return apiRequest<Content>(`/contents/${id}`, { method: 'GET' });
  },

  markProgress(contentId: string, percent: number) {
    return apiRequest<ProgressRecord>(`/contents/${contentId}/progress`, {
      method: 'POST',
      body: { percent },
    });
  },
};
