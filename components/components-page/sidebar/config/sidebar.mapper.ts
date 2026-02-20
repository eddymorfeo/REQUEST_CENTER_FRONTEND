import type { AuthUser } from "@/types/auth/auth.types";
import { sidebarConfig } from "./sidebar.config";

export function buildSidebarConfigForUser(user: AuthUser | null) {
  return sidebarConfig;
}
