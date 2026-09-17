import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter ao menos um número');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto').max(150),
  email: z.string().trim().email('Email inválido').max(255),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
  remember: z.boolean().default(true),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Email inválido'),
});

export const verifyCodeSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
  newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
