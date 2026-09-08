import { apiRequest } from './httpClient';
import type {
  Achievement,
  FullProfile,
  ProgressRecord,
  RankingEntry,
  SimulationResultSummary,
} from '../types/student';

export const profileApi = {
  getProfile() {
    return apiRequest<FullProfile>('/profile', { method: 'GET' });
  },

  updateProfile(data: { name?: string; photoUrl?: string; goal?: string }) {
    return apiRequest<{ message: string }>('/profile', { method: 'PATCH', body: data });
  },

  updatePreferences(data: {
    publicRanking?: boolean;
    accessibilitySettings?: Record<string, unknown>;
  }) {
    return apiRequest('/profile/preferences', { method: 'PATCH', body: data });
  },

  getProgress() {
    return apiRequest<ProgressRecord[]>('/progress', { method: 'GET' });
  },

  getAchievements() {
    return apiRequest<Achievement[]>('/achievements', { method: 'GET' });
  },

  getRanking() {
    return apiRequest<RankingEntry[]>('/ranking', { method: 'GET' });
  },

  getQuestionHistory() {
    return apiRequest('/history/questions', { method: 'GET' });
  },

  getSimulationHistory() {
    return apiRequest<SimulationResultSummary[]>('/history/simulations', { method: 'GET' });
  },
};
