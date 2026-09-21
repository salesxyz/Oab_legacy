import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { comparePassword, compareCode, generateNumericCode, hashCode, hashPassword } from '../utils/hash';
import {
  generateRefreshTokenValue,
  hashRefreshToken,
  refreshTokenExpiryDate,
  signAccessToken,
} from '../utils/jwt';
import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { passwordResetRepository } from '../repositories/passwordReset.repository';
import { emailService } from './email.service';
import { logger } from '../config/logger';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'node:crypto';

const LOGIN_LOCK_MINUTES = 15;

function googleClient() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw ApiError.serviceUnavailable('Login com Google não está configurado.', 'GOOGLE_AUTH_NOT_CONFIGURED');
  }
  return new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI || `${env.APP_URL}/auth/google/callback`);
}

function toPublicUser(user: { id: string; name: string; email: string; role: 'ALUNO' | 'ADMIN' | 'MENTOR'; status: string; photoUrl: string | null; subscriptionPlan?: string | null; accessExpiresAt?: Date | null; approved?: boolean; approvedAt?: Date | null }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    photoUrl: user.photoUrl,
    subscriptionPlan: user.subscriptionPlan ?? null,
    accessExpiresAt: user.accessExpiresAt ?? null,
    approved: user.approved ?? false,
    approvedAt: user.approvedAt ?? null,
  };
}

async function issueTokenPair(user: { id: string; name: string; role: 'ALUNO' | 'ADMIN' | 'MENTOR' }) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, name: user.name });
  const refreshTokenValue = generateRefreshTokenValue();
  await refreshTokenRepository.create(user.id, hashRefreshToken(refreshTokenValue), refreshTokenExpiryDate());
  return { accessToken, refreshToken: refreshTokenValue };
}

export const authService = {
  async register(input: { name: string; email: string; password: string }) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      // Mensagem genérica: evita confirmar/enumerar quais emails já existem no sistema.
      throw ApiError.conflict('Não foi possível concluir o cadastro com os dados informados.', 'EMAIL_IN_USE');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({ name: input.name, email: input.email, passwordHash });

    emailService.sendWelcomeEmail(user.email, user.name).catch((err) => logger.error('Falha ao enviar email de boas-vindas', err));

    const tokens = await issueTokenPair(user);
    return { user: toPublicUser(user), ...tokens };
  },

  async login(input: { email: string; password: string; remember?: boolean }) {
    const user = await userRepository.findByEmail(input.email);

    // Mensagem idêntica para "usuário não existe" e "senha incorreta": evita
    // enumeração de usuários cadastrados.
    const genericError = () => ApiError.unauthorized('Email ou senha inválidos.', 'INVALID_CREDENTIALS');

    if (!user) throw genericError();

    if (user.status === 'INATIVO') {
      throw ApiError.forbidden('Esta conta está desativada. Entre em contato com o suporte.', 'ACCOUNT_INACTIVE');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw ApiError.tooManyRequests(
        'Conta temporariamente bloqueada por excesso de tentativas. Tente novamente mais tarde.',
        'ACCOUNT_LOCKED',
      );
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      await userRepository.registerFailedLogin(user.id, env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS, LOGIN_LOCK_MINUTES);
      throw genericError();
    }

    await userRepository.updateLastLogin(user.id);
    const tokens = await issueTokenPair(user);
    return { user: toPublicUser(user), ...tokens };
  },

  googleAuthorizationUrl(state: string) {
    return googleClient().generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'select_account',
    });
  },

  async loginWithGoogle(code: string) {
    const client = googleClient();
    const { tokens: googleTokens } = await client.getToken(code);
    if (!googleTokens.id_token) throw ApiError.unauthorized('Não foi possível validar a conta Google.', 'GOOGLE_AUTH_FAILED');

    const ticket = await client.verifyIdToken({ idToken: googleTokens.id_token, audience: env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email || payload.email_verified !== true) {
      throw ApiError.unauthorized('A conta Google não possui um email verificado.', 'GOOGLE_EMAIL_NOT_VERIFIED');
    }

    let user = await userRepository.findByEmail(payload.email);
    if (!user) {
      user = await userRepository.create({
        name: payload.name?.trim() || payload.email.split('@')[0],
        email: payload.email,
        passwordHash: await hashPassword(randomBytes(32).toString('hex')),
      });
    } else if (user.status === 'INATIVO') {
      throw ApiError.forbidden('Esta conta está desativada. Entre em contato com o suporte.', 'ACCOUNT_INACTIVE');
    }

    if (payload.picture && user.photoUrl !== payload.picture) {
      user = (await userRepository.updateProfileBasics(user.id, { photoUrl: payload.picture })) ?? user;
    }
    await userRepository.updateLastLogin(user.id);
    const tokens = await issueTokenPair(user);
    return { user: toPublicUser(user), ...tokens };
  },

  async refresh(refreshTokenValue: string) {
    const tokenHash = hashRefreshToken(refreshTokenValue);
    const stored = await refreshTokenRepository.findValidByHash(tokenHash);

    if (!stored || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized('Sessão expirada. Faça login novamente.', 'INVALID_REFRESH_TOKEN');
    }

    const user = await userRepository.findById(stored.userId);
    if (!user || user.status === 'INATIVO') {
      throw ApiError.unauthorized('Sessão inválida.', 'INVALID_REFRESH_TOKEN');
    }

    // Rotação: revoga o token usado e emite um novo par, prevenindo reuso
    // (replay attack) caso um refresh token vazado seja usado por um atacante.
    const newTokens = await issueTokenPair(user);
    await refreshTokenRepository.revoke(stored.id);

    return { user: toPublicUser(user), ...newTokens };
  },

  async logout(refreshTokenValue: string) {
    const tokenHash = hashRefreshToken(refreshTokenValue);
    const stored = await refreshTokenRepository.findValidByHash(tokenHash);
    if (stored) {
      await refreshTokenRepository.revoke(stored.id);
    }
  },

  async logoutAllSessions(userId: string) {
    await refreshTokenRepository.revokeAllForUser(userId);
  },

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);

    // Resposta sempre genérica e de sucesso, exista ou não o email, para não
    // permitir enumeração de contas cadastradas.
    if (!user) {
      logger.info('Solicitação de recuperação de senha para email não cadastrado (ignorada silenciosamente).');
      return;
    }

    const code = generateNumericCode(6);
    const codeHash = await hashCode(code);
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_CODE_EXPIRES_IN_MINUTES * 60 * 1000);

    await passwordResetRepository.create(user.id, codeHash, expiresAt);
    await emailService.sendPasswordResetCode(user.email, user.name, code);
  },

  async verifyResetCode(email: string, code: string) {
    const user = await userRepository.findByEmail(email);
    const invalidError = () => ApiError.badRequest('Código inválido ou expirado.', 'INVALID_RESET_CODE');

    if (!user) throw invalidError();

    const reset = await passwordResetRepository.findLatestActiveForUser(user.id);
    if (!reset) throw invalidError();

    if (reset.attempts >= env.PASSWORD_RESET_MAX_ATTEMPTS) {
      throw ApiError.tooManyRequests('Limite de tentativas excedido. Solicite um novo código.', 'RESET_ATTEMPTS_EXCEEDED');
    }

    const matches = await compareCode(code, reset.codeHash);
    if (!matches) {
      await passwordResetRepository.bumpAttempts(reset.id, reset.attempts + 1);
      throw invalidError();
    }

    return true;
  },

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await userRepository.findByEmail(email);
    const invalidError = () => ApiError.badRequest('Código inválido ou expirado.', 'INVALID_RESET_CODE');

    if (!user) throw invalidError();

    const reset = await passwordResetRepository.findLatestActiveForUser(user.id);
    if (!reset) throw invalidError();

    if (reset.attempts >= env.PASSWORD_RESET_MAX_ATTEMPTS) {
      throw ApiError.tooManyRequests('Limite de tentativas excedido. Solicite um novo código.', 'RESET_ATTEMPTS_EXCEEDED');
    }

    const matches = await compareCode(code, reset.codeHash);
    if (!matches) {
      await passwordResetRepository.bumpAttempts(reset.id, reset.attempts + 1);
      throw invalidError();
    }

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(user.id, passwordHash);
    await passwordResetRepository.markUsed(reset.id);

    // Invalida todas as sessões ativas: uma troca de senha por recuperação
    // deve encerrar qualquer sessão que possa ter sido comprometida.
    await refreshTokenRepository.revokeAllForUser(user.id);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('Usuário não encontrado.');

    const matches = await comparePassword(currentPassword, user.passwordHash);
    if (!matches) throw ApiError.badRequest('Senha atual incorreta.', 'INVALID_CURRENT_PASSWORD');

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(userId, passwordHash);
    await refreshTokenRepository.revokeAllForUser(userId);
  },

  toPublicUser,
};
