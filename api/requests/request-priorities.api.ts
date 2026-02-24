import { http } from "@/api/http/http.client";

export type RequestPriorityItem = {
  id: string;
  code: string;
  name: string;
  sort_order: number;
  user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RequestPrioritiesResponse = {
  success: boolean;
  items: RequestPriorityItem[];
};

export const requestPrioritiesApi = {
  getAll() {
    return http<RequestPrioritiesResponse>({
      method: "GET",
      path: "/request-priorities",
      auth: true,
    });
  },
};