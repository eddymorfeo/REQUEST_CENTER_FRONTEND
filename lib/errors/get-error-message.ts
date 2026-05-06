import { ApiError } from "@/api/http/http.errors";

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.userMessage || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado. Intenta nuevamente.";
}