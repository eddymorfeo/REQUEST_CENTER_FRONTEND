import { http } from "@/api/http/http.client";
import type { RequestItem, RequestsListResponse } from "@/types/requests/request.types";

export const requestsApi = {
  getAll() {
    return http<RequestsListResponse>({
      method: "GET",
      path: "/requests",
      auth: true,
    });
  },

    updateStatus(requestId: string, statusId: string) {
    return http<{ success: boolean; item?: RequestItem }>({
      method: "PATCH",
      path: `/requests/${requestId}`,
      body: { status_id: statusId },
      auth: true,
    });
  },
};
