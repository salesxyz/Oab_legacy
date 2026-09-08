import { apiRequest } from './httpClient';
import type { AnswerResult, Question, QuestionListResponse, SubjectPerformance } from '../types/student';

export interface QuestionFilters {
  subject?: string;
  difficulty?: 'FACIL' | 'MEDIO' | 'DIFICIL';
  onlyUnanswered?: boolean;
  onlyWrong?: boolean;
  page?: number;
  pageSize?: number;
}

function toQueryString(filters: QuestionFilters): string {
  const params = new URLSearchParams();
  if (filters.subject) params.set('subject', filters.subject);
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.onlyUnanswered) params.set('onlyUnanswered', 'true');
  if (filters.onlyWrong) params.set('onlyWrong', 'true');
  params.set('page', String(filters.page ?? 1));
  params.set('pageSize', String(filters.pageSize ?? 20));
  return params.toString();
}

export const questionApi = {
  list(filters: QuestionFilters = {}) {
    return apiRequest<QuestionListResponse>(`/questions?${toQueryString(filters)}`, { method: 'GET' });
  },

  getSubjects() {
    return apiRequest<string[]>('/questions/subjects', { method: 'GET' });
  },

  get(id: string) {
    return apiRequest<Question & { alternatives: Array<{ id: string; text: string; order: number }> }>(`/questions/${id}`, {
      method: 'GET',
    });
  },

  answer(id: string, alternativeId: string, responseTimeMs?: number) {
    return apiRequest<AnswerResult>(`/questions/${id}/answer`, {
      method: 'POST',
      body: { alternativeId, responseTimeMs },
    });
  },

  getPerformance() {
    return apiRequest<SubjectPerformance[]>('/questions/performance', { method: 'GET' });
  },
};
