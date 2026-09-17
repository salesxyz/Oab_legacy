import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),
  APP_URL: z.string().default('http://localhost:3333'),
  WEB_URL: z.string().default('http://localhost:5173'),
  VIDEO_STORAGE_DIR: z.string().default('./storage/videos'),
  VIDEO_MAX_SIZE_MB: z.coerce.number().int().positive().default(500),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter pelo menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(16, 'REFRESH_TOKEN_SECRET deve ter pelo menos 16 caracteres'),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().default(30),

  PASSWORD_RESET_CODE_EXPIRES_IN_MINUTES: z.coerce.number().default(15),
  PASSWORD_RESET_MAX_ATTEMPTS: z.coerce.number().default(5),

  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().default(15),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS: z.coerce.number().default(5),

  EMAIL_PROVIDER: z.enum(['console', 'resend', 'sendgrid', 'smtp']).default('console'),
  EMAIL_API_KEY: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('OAB Mentoria <no-reply@oabmentoria.com.br>'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),

  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
  STRIPE_CURRENCY: z.string().length(3).default('brl'),
  STRIPE_BASIC_PRICE_CENTS: z.coerce.number().int().positive().default(9700),
  STRIPE_LIFETIME_PRICE_CENTS: z.coerce.number().int().positive().default(299799),

  SEED_TEST_USER_EMAIL: z.string().optional().default('teste@exemplo.com'),
  SEED_TEST_USER_PASSWORD: z.string().optional().default('SenhaTeste123!'),
  SEED_ADMIN_EMAIL: z.string().optional().default('admin@exemplo.com'),
  SEED_ADMIN_PASSWORD: z.string().optional().default('AdminTeste123!'),
  SEED_MENTOR_EMAIL: z.string().optional().default('professor@exemplo.com'),
  SEED_MENTOR_PASSWORD: z.string().optional().default('ProfessorTeste123!'),
}).superRefine((config, context) => {
  if (config.NODE_ENV !== 'production') return;

  const exampleSecrets = ['troque_este_valor_por_um_segredo_forte', 'troque_este_valor_por_outro_segredo_forte'];
  if (exampleSecrets.includes(config.JWT_SECRET) || config.JWT_SECRET === config.REFRESH_TOKEN_SECRET) {
    context.addIssue({ code: 'custom', path: ['JWT_SECRET'], message: 'Use segredos únicos e fortes em produção.' });
  }
  if (exampleSecrets.includes(config.REFRESH_TOKEN_SECRET)) {
    context.addIssue({ code: 'custom', path: ['REFRESH_TOKEN_SECRET'], message: 'Use segredos únicos e fortes em produção.' });
  }
  if (config.EMAIL_PROVIDER === 'console') {
    context.addIssue({ code: 'custom', path: ['EMAIL_PROVIDER'], message: 'EMAIL_PROVIDER=console não é permitido em produção.' });
  }
  if (!config.STRIPE_SECRET_KEY || !config.STRIPE_WEBHOOK_SECRET) {
    context.addIssue({ code: 'custom', path: ['STRIPE_SECRET_KEY'], message: 'Stripe deve estar configurado em produção.' });
  }
  if (config.CORS_ALLOWED_ORIGINS.split(',').some((origin) => origin.trim().includes('localhost'))) {
    context.addIssue({ code: 'custom', path: ['CORS_ALLOWED_ORIGINS'], message: 'CORS de localhost não é permitido em produção.' });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Variáveis de ambiente inválidas:', parsed.error.flatten().fieldErrors);
  throw new Error('Configuração de ambiente inválida. Verifique o arquivo .env');
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const isDevelopment = env.NODE_ENV === 'development';
