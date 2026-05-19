import type { AuthUser } from "@/types/auth/auth.types";
import { tokenStorage } from "@/utils/storage/token.storage";

export function getLoggedAuthUser(): AuthUser {
  const user = tokenStorage.getUser<AuthUser>();
  if (!user?.id) throw new Error("No se encontro userId del usuario logeado.");
  return user;
}

export function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] ?? "", lastName: "" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

export function getInitials(name?: string | null) {
  const parts = String(name || "")
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "US";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function getRoleLabel(roleCode?: string | null) {
  if (!roleCode) return "Usuario";
  if (roleCode === "ADMIN" || roleCode === "ADMINISTRADOR") return "Administrador";
  return roleCode
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

