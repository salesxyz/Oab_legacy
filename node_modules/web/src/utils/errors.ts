import { ApiError } from '../services/httpClient';

/** Extrai uma mensagem amigável de um erro de API para exibir ao usuário.
 * Nunca expõe stack traces ou detalhes internos — apenas a mensagem que o
 * backend já formatou para exibição (ver middlewares/error.middleware.ts). */
export function getErrorMessage(error: unknown, fallback = 'Ocorreu um problema. Tente novamente.'): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}
