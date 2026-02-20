"use client";

import { tokenStorage } from "@/utils/storage/token.storage";

export function isLoggedIn(): boolean {
  const token = tokenStorage.getToken();
  const user = tokenStorage.getUser();
  return Boolean(token && user);
}

export function buildLoginRedirectUrl(nextPath: string) {
  const encoded = encodeURIComponent(nextPath);
  return `/auth/login`;
}
