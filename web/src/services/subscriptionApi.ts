import { apiRequest } from './httpClient';

export type SubscriptionPlan = 'BASICO' | 'VITALICIO';

export const subscriptionApi = {
  createCheckout(plan: SubscriptionPlan) {
    return apiRequest<{ sessionId: string; checkoutUrl: string }>('/payments/checkout', { method: 'POST', body: { plan } });
  },
};