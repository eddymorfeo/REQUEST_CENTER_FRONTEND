import { http } from "@/api/http/http.client";

export type RequestStatusHistoryItem = {
  id: string;
  request_id: string;
  from_status_id: string | null;
  to_status_id: string;
  changed_by: string;
  changed_at: string;
  note: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  from_status_code?: string | null;
  from_status_name?: string | null;
  to_status_code?: string | null;
  to_status_name?: string | null;
  changed_by_username?: string | null;
  changed_by_full_name?: string | null;
  changed_by_email?: string | null;
  changed_by_role_code?: string | null;
  changed_by_role_name?: string | null;
};

type ListResponse = { success: boolean; data: RequestStatusHistoryItem[] };

export const requestStatusHistoryApi = {
  listByRequestId(requestId: string) {
    return http<ListResponse>({
      method: "GET",
      path: `/request-status-history?requestId=${encodeURIComponent(requestId)}`,
      auth: true,
    });
  },
};
