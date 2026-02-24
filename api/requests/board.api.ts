import { http } from "@/api/http/http.client";

export const boardApi = {
  assignRequest(requestId: string, assignedTo: string, note?: string) {
    return http<{ success: boolean }>({
      method: "POST",
      path: `/board/${requestId}/assign`,
      body: { assigned_to: assignedTo, note },
      auth: true,
    });
  },

  changeStatus(requestId: string, toStatusId: string, note?: string) {
    return http<{ success: boolean }>({
      method: "POST",
      path: `/board/${requestId}/status`,
      body: { to_status_id: toStatusId, note },
      auth: true,
    });
  },
};