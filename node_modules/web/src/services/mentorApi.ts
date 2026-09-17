import { apiRequest } from './httpClient';
import type { AdminUser } from './adminApi';

export type StudentModuleProgress = {
  id: string;
  title: string;
  progressPercent: number;
  completedContents: number;
  totalContents: number;
  accuracyPercent: number | null;
  lastActivityAt: string | null;
};

export type MentorStudent = AdminUser & { modules: StudentModuleProgress[] };
export type MentorAnswer = { id: string; questionId: string; subject: string; statement: string; alternativeId: string; correct: boolean; responseTimeMs: number | null; answeredAt: string };
export type MentorSimulationResult = { id: string; simulationId: string; title: string; questionCount: number; correctCount: number; wrongCount: number; percent: number; timeSpentSeconds: number; createdAt: string };

type Paginated<T> = { student: Pick<AdminUser, 'id' | 'name' | 'role'>; page: number; pageSize: number; total: number; rows: T[] };

export const mentorApi = {
  listStudents(search = '') {
    const params = new URLSearchParams({ page: '1', pageSize: '50' });
    if (search.trim()) params.set('search', search.trim());
    return apiRequest<{ rows: MentorStudent[]; total: number }>(`/mentor/students?${params.toString()}`, { method: 'GET' });
  },
  getStudent(id: string) {
    return apiRequest(`/mentor/students/${id}`, { method: 'GET' });
  },
  getStudentPerformance(id: string) {
    return apiRequest(`/mentor/students/${id}/performance`, { method: 'GET' });
  },
  listStudentAnswers(id: string, page = 1, pageSize = 20, subject?: string) {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (subject?.trim()) params.set('subject', subject.trim());
    return apiRequest<Paginated<MentorAnswer>>(`/mentor/students/${id}/answers?${params}`, { method: 'GET' });
  },
  listStudentSimulations(id: string, page = 1, pageSize = 20) {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    return apiRequest<Paginated<MentorSimulationResult>>(`/mentor/students/${id}/simulations?${params}`, { method: 'GET' });
  },
};