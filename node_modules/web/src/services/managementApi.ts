import { apiRequest } from './httpClient';
import type { Content, Course, Question, QuestionListResponse, Simulation, Tip } from '../types/student';
import type { AdminUsersResponse } from './adminApi';

export interface ModuleSummary { id: string; courseId: string; title: string; description: string | null; order: number; totalContents: number; completedContents: number; progressPercent: number; }
export interface QuestionInput { moduleId: string; statement: string; subject: string; explanation?: string; difficulty?: 'FACIL' | 'MEDIO' | 'DIFICIL'; examBoard?: string; year?: number; alternatives: Array<{ text: string; correct: boolean; order: number }>; }
export interface SimulationInput { title: string; description?: string; questionCount: number; timeLimitMinutes: number; questionIds: string[]; }
export interface TipRecord extends Tip { active: boolean; }

export const managementApi = {
  listUsers(search = '') { const params = new URLSearchParams({ page: '1', pageSize: '50' }); if (search) params.set('search', search); return apiRequest<AdminUsersResponse>(`/admin/users?${params}`, { method: 'GET' }); },
  listCourses() { return apiRequest<Course[]>('/courses', { method: 'GET' }); },
  createCourse(body: Partial<Course> & { title: string }) { return apiRequest<Course>('/courses', { method: 'POST', body }); },
  updateCourse(id: string, body: Partial<Course>) { return apiRequest<Course>(`/courses/${id}`, { method: 'PATCH', body }); },
  removeCourse(id: string) { return apiRequest<void>(`/courses/${id}`, { method: 'DELETE' }); },
  listModules(courseId: string) { return apiRequest<ModuleSummary[]>(`/courses/${courseId}/modules`, { method: 'GET' }); },
  createModule(body: { courseId: string; title: string; description?: string }) { return apiRequest<ModuleSummary>('/modules', { method: 'POST', body }); },
  listContents(moduleId: string) { return apiRequest<Content[]>(`/modules/${moduleId}/contents`, { method: 'GET' }); },
  createContent(body: { moduleId: string; title: string; type: Content['type']; description?: string; body?: string; videoUrl?: string; materialUrl?: string; status?: Content['status'] }) { return apiRequest<Content>('/contents', { method: 'POST', body }); },
  uploadVideo(body: { moduleId: string; title: string; description?: string; video: File; status?: Content['status'] }) {
    const formData = new FormData();
    formData.append('moduleId', body.moduleId);
    formData.append('title', body.title);
    if (body.description) formData.append('description', body.description);
    if (body.status) formData.append('status', body.status);
    formData.append('video', body.video);
    return apiRequest<Content>('/contents/upload-video', { method: 'POST', body: formData });
  },
  listQuestions() { return apiRequest<QuestionListResponse>('/questions?page=1&pageSize=100', { method: 'GET' }); },
  createQuestion(body: QuestionInput) { return apiRequest<Question>('/questions', { method: 'POST', body }); },
  updateQuestion(id: string, body: Partial<QuestionInput> & { active?: boolean }) { return apiRequest<Question>(`/questions/${id}`, { method: 'PATCH', body }); },
  removeQuestion(id: string) { return apiRequest<void>(`/questions/${id}`, { method: 'DELETE' }); },
  listSimulations() { return apiRequest<Simulation[]>('/simulations', { method: 'GET' }); },
  createSimulation(body: SimulationInput) { return apiRequest<Simulation>('/simulations', { method: 'POST', body }); },
  updateSimulation(id: string, body: Partial<Simulation>) { return apiRequest<Simulation>(`/simulations/${id}`, { method: 'PATCH', body }); },
  removeSimulation(id: string) { return apiRequest<void>(`/simulations/${id}`, { method: 'DELETE' }); },
  listTips() { return apiRequest<TipRecord[]>('/tips', { method: 'GET' }); },
  createTip(body: { title: string; content: string; category?: string }) { return apiRequest<TipRecord>('/tips', { method: 'POST', body }); },
  updateTip(id: string, body: Partial<TipRecord>) { return apiRequest<TipRecord>(`/tips/${id}`, { method: 'PATCH', body }); },
  removeTip(id: string) { return apiRequest<void>(`/tips/${id}`, { method: 'DELETE' }); },
};