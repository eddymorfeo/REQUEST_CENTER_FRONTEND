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
  console.warn("NEXT_PUBLIC_API_URL no está definido.");
}

function isBrowser() {
  return typeof window !== "undefined";
}

function shouldLogout(resStatus: number, payload: any) {
  if (resStatus === 401) return true;
  const msg = (payload?.message || payload?.error || "").toString().toLowerCase();
  return msg.includes("invalid token") || msg.includes("jwt") || msg.includes("token");
}

function redirectToLoginBecauseExpired() {
  if (!isBrowser()) return;

  // Evita loops de redirección si varias requests fallan a la vez
  const key = "rc_auth_expired_redirecting";
  if (sessionStorage.getItem(key) === "1") return;
  sessionStorage.setItem(key, "1");

  tokenStorage.clear();

  const nextPath = window.location.pathname + window.location.search;
  const loginUrl = `/auth/login?reason=expired&next=${encodeURIComponent(nextPath)}`;

  window.location.href = loginUrl;
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
    // ✅ Logout + redirect cuando token expiró/invalidó
    if (auth && shouldLogout(res.status, payload)) {
      redirectToLoginBecauseExpired();
      // Igual lanzamos error (por si estás en SSR/otro flujo),
      // pero en browser ya estarás redirigiendo.
    }

    const msg =
      payload?.message ||
      payload?.error ||
      `Error HTTP ${res.status} al consumir ${path}`;

    throw new ApiError(msg, res.status, payload);
  }

  // Si estábamos en “redirecting” por token expirado y se vuelve a loguear,
  // se limpiará desde login-form (opcional), pero aquí no hace falta.

  return payload as T;
}