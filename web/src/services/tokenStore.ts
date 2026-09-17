/**
 * Gerenciamento de tokens da sessão.
 *
 * - accessToken: mantido SOMENTE em memória (nunca em localStorage/
 *   sessionStorage). É de curta duração (15 min no backend) — se a aba for
 *   recarregada, ele é reobtido silenciosamente via refresh token.
 * O refresh token vive exclusivamente no cookie HttpOnly emitido pelo backend.
 * Este módulo mantém apenas o access token em memória e os eventos da sessão.
 */

let accessToken: string | null = null;

type Listener = () => void;
const sessionExpiredListeners = new Set<Listener>();

export const tokenStore = {
  getAccessToken(): string | null {
    return accessToken;
  },

  setAccessToken(token: string | null) {
    accessToken = token;
  },

  clear() {
    accessToken = null;
  },

  /** Notifica interessados (ex.: AuthContext) que a sessão caiu e não deu
   * para renovar — usado para redirecionar ao login com um aviso. */
  onSessionExpired(listener: Listener) {
    sessionExpiredListeners.add(listener);
    return () => {
      sessionExpiredListeners.delete(listener);
    };
  },

  emitSessionExpired() {
    sessionExpiredListeners.forEach((listener) => listener());
  },
};
