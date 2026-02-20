import { http } from "@/api/http/http.client";
import type { RequestStatusListResponse } from "@/types/requests/request-status.types";

export const requestStatusApi = {
  getAll() {
    return http<RequestStatusListResponse>({
      method: "GET",
      path: "/request-status",
      auth: true,
    });
  },
};
