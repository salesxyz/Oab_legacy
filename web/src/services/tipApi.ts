import { apiRequest } from './httpClient';
import type { Tip } from '../types/student';

export const tipApi = {
  ofTheDay() {
    return apiRequest<Tip>('/tips/of-the-day', { method: 'GET' });
  },
};
