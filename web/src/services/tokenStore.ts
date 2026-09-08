/**
 * Gerenciamento de tokens da sessão.
 *
 * - accessToken: mantido SOMENTE em memória (nunca em localStorage/
 *   sessionStorage). É de curta duração (15 min no backend) — se a aba for
 *   recarregada, ele é reobtido silenciosamente via refresh token.
 * - refreshToken: o backend devolve esse valor no corpo da resposta JSON
 *   (não como cookie httpOnly), então a única forma de persisti-lo entre
 *   recarregamentos de página é em storage acessível por JavaScript. Isso é
 *   uma concessão de segurança conhecida — o endurecimento recomendado para
 *   produção é migrar o backend para emitir o refresh token como cookie
 *   httpOnly + Secure + SameSite=Strict, o que o remove completamente do
 *   alcance de JavaScript (e portanto de XSS). Ver README.
 *
 * "Lembrar acesso" desmarcado usa sessionStorage (some ao fechar a aba);
 * marcado usa localStorage (sobrevive ao fechar o navegador).
 */

const REFRESH_TOKEN_KEY = 'oab_mentoria.refresh_token';
const REMEMBER_KEY = 'oab_mentoria.remember';

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

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string, remember: boolean) {
    // Garante que não fique uma cópia obsoleta no outro storage.
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);

    if (remember) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
      localStorage.setItem(REMEMBER_KEY, '1');
    } else {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
      localStorage.removeItem(REMEMBER_KEY);
    }
  },

  wasRemembered(): boolean {
    return localStorage.getItem(REMEMBER_KEY) === '1';
  },

  clear() {
    accessToken = null;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
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
