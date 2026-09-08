import { apiRequest } from './httpClient';

export type SubscriptionPlan = 'BASICO' | 'VITALICIO';

export const subscriptionApi = {
  activate(plan: SubscriptionPlan) {
    return apiRequest<{ plan: SubscriptionPlan; accessExpiresAt: string | null }>('/subscription', { method: 'PATCH', body: { plan } });
  },
};