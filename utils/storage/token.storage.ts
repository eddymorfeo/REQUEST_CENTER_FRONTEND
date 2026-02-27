"use client";

const TOKEN_KEY = "rc_access_token";
const USER_KEY = "rc_user";

function isBrowser() {
  return typeof window !== "undefined";
}

export const tokenStorage = {
  getToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    if (!isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    if (!isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser<T>() {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  setUser(user: unknown) {
    if (!isBrowser()) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser() {
    if (!isBrowser()) return;
    localStorage.removeItem(USER_KEY);
  },

  clear() {
    if (!isBrowser()) return;
    this.removeToken();
    this.removeUser();
  },
};