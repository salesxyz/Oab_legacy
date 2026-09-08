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

export const mentorApi = {
  listStudents(search = '') {
    const params = new URLSearchParams({ page: '1', pageSize: '50' });
    if (search.trim()) params.set('search', search.trim());
    return apiRequest<{ rows: MentorStudent[]; total: number }>(`/mentor/students?${params.toString()}`, { method: 'GET' });
  },
};