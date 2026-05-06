import { ApiError, type ApiErrorCode } from "./http.errors";

type ErrorPayload = {
  success?: boolean;
  code?: string;
  message?: string;
  error?: string;
  details?: unknown;
};

function normalizeCode(code?: string): ApiErrorCode {
  switch (code) {
    case "INVALID_CREDENTIALS":
      return "INVALID_CREDENTIALS";
    case "USER_WITHOUT_ROLE":
      return "USER_WITHOUT_ROLE";
    case "VALIDATION_ERROR":
      return "VALIDATION_ERROR";
    case "UNAUTHORIZED":
      return "UNAUTHORIZED";
    case "FORBIDDEN":
      return "FORBIDDEN";
    case "RESOURCE_NOT_FOUND":
      return "RESOURCE_NOT_FOUND";
    case "ROUTE_NOT_FOUND":
      return "ROUTE_NOT_FOUND";
    case "CONFLICT":
    case "DUPLICATED_VALUE":
      return "CONFLICT";
    case "INTERNAL_ERROR":
      return "INTERNAL_ERROR";
    default:
      return "UNKNOWN_ERROR";
  }
}

function getUserMessage(status?: number, code?: ApiErrorCode): string {
  if (code === "INVALID_CREDENTIALS") {
    return "Usuario o contraseña incorrectos.";
  }

  if (code === "USER_WITHOUT_ROLE") {
    return "Tu cuenta no tiene un rol asignado. Contacta al administrador.";
  }

  if (code === "VALIDATION_ERROR") {
    return "Revisa los datos ingresados e inténtalo nuevamente.";
  }

  if (code === "FORBIDDEN") {
    return "No tienes permisos para realizar esta acción.";
  }

  if (code === "RESOURCE_NOT_FOUND" || code === "ROUTE_NOT_FOUND") {
    return "No se encontró la información solicitada.";
  }

  if (code === "CONFLICT") {
    return "La acción no pudo completarse porque existe un conflicto con los datos enviados.";
  }

  if (status === 401) {
    return "Tu sesión expiró o no es válida. Vuelve a iniciar sesión.";
  }

  if (status === 403) {
    return "No tienes permisos para realizar esta acción.";
  }

  if (status === 404) {
    return "No se encontró el recurso solicitado.";
  }

  if (status && status >= 500) {
    return "Ocurrió un problema en el servidor. Intenta nuevamente en unos minutos.";
  }

  return "Ocurrió un error inesperado. Intenta nuevamente.";
}

export function mapHttpError(
  status?: number,
  payload?: ErrorPayload,
  fallbackTechnicalMessage?: string
): ApiError {
  const code = normalizeCode(payload?.code);
  const technicalMessage =
    payload?.message ||
    payload?.error ||
    fallbackTechnicalMessage ||
    "Unexpected error";

  return new ApiError(
    technicalMessage,
    status,
    code,
    payload?.details,
    getUserMessage(status, code),
    technicalMessage
  );
}

export function mapNetworkError(error: unknown): ApiError {
  const technicalMessage =
    error instanceof Error ? error.message : "Network error";

  return new ApiError(
    technicalMessage,
    undefined,
    "NETWORK_ERROR",
    null,
    "No se pudo conectar con el servidor. Verifica tu red e inténtalo nuevamente.",
    technicalMessage
  );
}