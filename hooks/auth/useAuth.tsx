"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/api/auth/auth.api";
import { tokenStorage } from "@/utils/storage/token.storage";
import { alerts } from "@/utils/alerts/alerts";
import type { AuthUser, LoginRequest } from "@/types/auth/auth.types";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
};

type AuthContextValue = AuthState & {
  login: (payload: LoginRequest, nextUrl?: string | null) => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

function safeNextUrl(nextUrl?: string | null) {
  if (!nextUrl) return null;
  if (!nextUrl.startsWith("/")) return null;
  if (nextUrl.startsWith("//")) return null;
  return nextUrl;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [state, setState] = React.useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isBootstrapping: true,
  });

  React.useEffect(() => {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser<AuthUser>();

    setState({
      user: user ?? null,
      isAuthenticated: Boolean(token && user),
      isBootstrapping: false,
    });
  }, []);

  const login = React.useCallback(
    async (payload: LoginRequest, nextUrl?: string | null) => {
      const res = await authApi.login(payload);

      if (!res?.success) {
        throw new Error("Login inválido.");
      }

      tokenStorage.setToken(res.data.accessToken);
      tokenStorage.setUser(res.data.user);

      setState({
        user: res.data.user,
        isAuthenticated: true,
        isBootstrapping: false,
      });

      await alerts.toastSuccess(`Bienvenido/a ${res.data.user.fullName}`);
      await alerts.wait(900);

      const target = safeNextUrl(nextUrl) ?? "/dashboard";
      router.push(target);
    },
    [router]
  );

  const logout = React.useCallback(() => {
    tokenStorage.clear();
    setState({ user: null, isAuthenticated: false, isBootstrapping: false });
    router.push("/auth/login");
  }, [router]);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider />");
  return ctx;
}
