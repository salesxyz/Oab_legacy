import rateLimit from 'express-rate-limit';
import { env, isDevelopment, isTest } from '../config/env';

// Em ambiente de teste, desabilitamos o limite agressivo para não quebrar suítes
// que fazem múltiplas requisições rápidas de propósito.
const skip = () => isTest || isDevelopment;

export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { message: 'Muitas requisições. Tente novamente em alguns minutos.' },
});

// Limite mais rígido para login/registro/recuperação de senha, mitigando
// brute force e enumeração de usuários.
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { message: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.' },
});
