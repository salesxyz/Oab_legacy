export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, code = 'ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, code = 'BAD_REQUEST', details?: unknown) {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message = 'Não autorizado', code = 'UNAUTHORIZED') {
    return new ApiError(401, message, code);
  }

  static forbidden(message = 'Acesso negado', code = 'FORBIDDEN') {
    return new ApiError(403, message, code);
  }

  static notFound(message = 'Recurso não encontrado', code = 'NOT_FOUND') {
    return new ApiError(404, message, code);
  }

  static conflict(message: string, code = 'CONFLICT') {
    return new ApiError(409, message, code);
  }

  static tooManyRequests(message = 'Muitas tentativas. Tente novamente mais tarde.', code = 'TOO_MANY_REQUESTS') {
    return new ApiError(429, message, code);
  }

  static serviceUnavailable(message = 'Serviço temporariamente indisponível.', code = 'SERVICE_UNAVAILABLE') {
    return new ApiError(503, message, code);
  }

  static internal(message = 'Erro interno do servidor', code = 'INTERNAL_ERROR') {
    return new ApiError(500, message, code);
  }
}
