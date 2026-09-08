import { tokenStore } from './tokenStore';
import type { ApiErrorBody, AuthResponse } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, string[]>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Pula a tentativa de renovação automática (usada pelas próprias rotas de auth). */
  skipAuthRetry?: boolean;
  /** Não anexa o header Authorization mesmo que exista um access token. */
  skipAuthHeader?: boolean;
}

// Evita que múltiplas requisições que falham ao mesmo tempo disparem várias
// renovações de token em paralelo — todas aguardam a mesma promise.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data: AuthResponse = await res.json();
        tokenStore.setAccessToken(data.accessToken);
        tokenStore.setRefreshToken(data.refreshToken, tokenStore.wasRemembered());
        return data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    return await response.json();
  } catch {
    return { message: 'Ocorreu um problema ao carregar este conteúdo.', code: 'UNKNOWN_ERROR' };
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuthRetry, skipAuthHeader, headers, ...rest } = options;

  const doFetch = async () => {
    const finalHeaders = new Headers(headers);
    const isMultipart = typeof FormData !== 'undefined' && body instanceof FormData;
    if (!isMultipart) finalHeaders.set('Content-Type', 'application/json');

    if (!skipAuthHeader) {
      const token = tokenStore.getAccessToken();
      if (token) finalHeaders.set('Authorization', `Bearer ${token}`);
    }

    return fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body === undefined ? undefined : isMultipart ? body : JSON.stringify(body),
    });
  };

  let response = await doFetch();

  // Access token expirado/inválido: tenta renovar UMA vez e refaz a chamada.
  if (response.status === 401 && !skipAuthRetry) {
    const errorBody = await parseErrorBody(response.clone());
    if (errorBody.code === 'INVALID_TOKEN') {
      const newToken = await refreshAccessToken();
      if (newToken) {
        response = await doFetch();
      } else {
        tokenStore.clear();
        tokenStore.emitSessionExpired();
      }
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);
    throw new ApiError(response.status, errorBody);
  }

  return response.json() as Promise<T>;
}
