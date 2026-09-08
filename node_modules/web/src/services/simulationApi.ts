import { apiRequest } from './httpClient';
import type { Simulation, SimulationFinishResult, SimulationResultSummary, SimulationStartResponse } from '../types/student';

export const simulationApi = {
  list() {
    return apiRequest<Simulation[]>('/simulations', { method: 'GET' });
  },

  start(id: string) {
    return apiRequest<SimulationStartResponse>(`/simulations/${id}/start`, { method: 'POST' });
  },

  finish(id: string, answers: Array<{ questionId: string; alternativeId: string }>, timeSpentSeconds: number) {
    return apiRequest<SimulationFinishResult>(`/simulations/${id}/finish`, {
      method: 'POST',
      body: { answers, timeSpentSeconds },
    });
  },

  myResults() {
    return apiRequest<SimulationResultSummary[]>('/simulations/my-results', { method: 'GET' });
  },
};
