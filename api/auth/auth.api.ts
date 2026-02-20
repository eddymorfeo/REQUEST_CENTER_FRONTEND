import { http } from "@/api/http/http.client";
import type { LoginRequest, LoginResponse } from "@/types/auth/auth.types";

export const authApi = {
  login(payload: LoginRequest) {
    return http<LoginResponse>({
      method: "POST",
      path: "/auth/login",
      body: payload,
      auth: false,
    });
  },
};
