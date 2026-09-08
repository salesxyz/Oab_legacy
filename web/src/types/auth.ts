export type UserRole = 'ALUNO' | 'ADMIN' | 'MENTOR';
export type UserStatus = 'ATIVO' | 'INATIVO';
export type SubscriptionPlan = 'BASICO' | 'VITALICIO' | null;

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  photoUrl: string | null;
  subscriptionPlan: SubscriptionPlan;
  accessExpiresAt: string | null;
  approved: boolean;
  approvedAt: string | null;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

/** Formato de erro devolvido pelo middleware central de erros do backend. */
export interface ApiErrorBody {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}
