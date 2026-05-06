import { ApiError } from "@/api/http/http.errors";

export function logError(context: string, error: unknown) {
  if (error instanceof ApiError) {
    console.error(`[${context}]`, {
      status: error.status,
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      technicalMessage: error.technicalMessage,
      details: error.details,
    });
    return;
  }

  console.error(`[${context}]`, error);
}