export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "INVALID_CREDENTIALS"
  | "USER_WITHOUT_ROLE"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | "ROUTE_NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "UNKNOWN_ERROR";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code: ApiErrorCode = "UNKNOWN_ERROR",
    public readonly details?: unknown,
    public readonly userMessage?: string,
    public readonly technicalMessage?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}