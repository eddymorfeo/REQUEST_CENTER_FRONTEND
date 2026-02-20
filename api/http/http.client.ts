import { ApiError } from "./http.errors";
import { tokenStorage } from "@/utils/storage/token.storage";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method: HttpMethod;
  path: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  // No lanzamos error en build para no romper, pero queda evidente en consola.
  // Ideal: validar en runtime y mostrar alerta.
  console.warn("NEXT_PUBLIC_API_URL no está definido.");
}

export async function http<T>(options: RequestOptions): Promise<T> {
  const { method, path, body, auth = true, signal } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = tokenStorage.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json() : null;

  if (!res.ok) {
    const msg =
      payload?.message ||
      payload?.error ||
      `Error HTTP ${res.status} al consumir ${path}`;
    throw new ApiError(msg, res.status, payload);
  }

  return payload as T;
}
