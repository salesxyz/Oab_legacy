import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['ALUNO', 'ADMIN', 'MENTOR']);
export const userStatusEnum = pgEnum('user_status', ['ATIVO', 'INATIVO']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['BASICO', 'VITALICIO']);
export const contentStatusEnum = pgEnum('content_status', ['RASCUNHO', 'PUBLICADO']);
export const contentTypeEnum = pgEnum('content_type', ['VIDEO', 'TEXTO', 'PDF', 'QUIZ']);
export const difficultyEnum = pgEnum('difficulty', ['FACIL', 'MEDIO', 'DIFICIL']);
