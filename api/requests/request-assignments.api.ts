import { http } from "@/api/http/http.client";

export type RequestAssignmentItem = {
  id: string;
  request_id: string;
  assigned_to: string | null;
  assigned_by: string;
  assigned_at: string;
  unassigned_at: string | null;
  note: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RequestAssignmentsListResponse = {
  success: boolean;
  data: RequestAssignmentItem[];
};

export const requestAssignmentsApi = {
  listByRequestId(requestId: string) {
    return http<RequestAssignmentsListResponse>({
      method: "GET",
      path: `/request-assignments?requestId=${encodeURIComponent(requestId)}`,
      auth: true,
    });
  },
};