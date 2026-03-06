"use client";

import { tokenStorage } from "@/utils/storage/token.storage";
import type { AuthUser } from "@/types/auth/auth.types";

export function isAdmin(): boolean {
  const user = tokenStorage.getUser<AuthUser>();
  return user?.roleCode === "ADMIN";
}