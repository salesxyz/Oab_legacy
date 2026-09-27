import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../services/authApi';
import { profileApi } from '../services/profileApi';
import { tokenStore } from '../services/tokenStore';
import type { PublicUser } from '../types/auth';

interface AuthContextValue {
  user: PublicUser | null;
  isAuthenticated: boolean;
  /** true enquanto tenta restaurar a sessão a partir do refresh cookie. */
  isBootstrapping: boolean;
  /** true logo após a sessão cair por expiração (não por logout manual) — a
   * tela de login usa isso para mostrar um aviso e depois limpa a flag. */
  sessionJustExpired: boolean;
  clearSessionExpiredFlag: () => void;
  refreshUser: () => Promise<PublicUser | null>;
  login: (email: string, password: string, remember: boolean) => Promise<PublicUser>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  // Só precisamos "bootstrapar" (tentar restaurar sessão) quando já existe
  // um refresh token salvo; caso contrário, já sabemos de cara que não há
  // sessão para restaurar — evita um setState síncrono desnecessário dentro
  // do efeito abaixo.
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [sessionJustExpired, setSessionJustExpired] = useState(false);

  // O navegador envia o refresh cookie automaticamente; o frontend nunca o lê.
  useEffect(() => {
    authApi
      .refresh()
      .then((data) => {
        tokenStore.setAccessToken(data.accessToken);
        setUser(data.user);
      })
      .catch(() => {
        tokenStore.clear();
      })
      .finally(() => setIsBootstrapping(false));
  }, []);

  // Reage a uma sessão que caiu no meio do uso (ex.: refresh token expirado
  // durante uma chamada de API qualquer, disparado pelo httpClient).
  useEffect(() => {
    return tokenStore.onSessionExpired(() => {
      setUser(null);
      setSessionJustExpired(true);
    });
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const data = await authApi.login({ email, password, remember });
    tokenStore.setAccessToken(data.accessToken);
    setUser(data.user);
    setSessionJustExpired(false);
    return data.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await authApi.register({ name, email, password });
    tokenStore.setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    tokenStore.clear();
    setUser(null);
    authApi.logout().catch(() => undefined);
  }, []);

  const clearSessionExpiredFlag = useCallback(() => setSessionJustExpired(false), []);

  const refreshUser = useCallback(async () => {
    const profile = await profileApi.getProfile();
    const nextUser = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as PublicUser['role'],
      status: user?.status ?? 'ATIVO',
      photoUrl: profile.photoUrl,
      subscriptionPlan: profile.subscriptionPlan,
      accessExpiresAt: profile.accessExpiresAt,
      approved: profile.approved,
      approvedAt: profile.approvedAt,
    } satisfies PublicUser;
    setUser(nextUser);
    return nextUser;
  }, [user?.status]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isBootstrapping,
        sessionJustExpired,
        clearSessionExpiredFlag,
        refreshUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  return ctx;
}
