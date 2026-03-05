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

export type CreateRequestPriorityPayload = {
  code: string;
  name: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateRequestPriorityPayload = {
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type RequestPriorityDetailResponse = {
  success: boolean;
  data: RequestPriorityItem;
};

export const requestPrioritiesApi = {
  getAll() {
    return http<RequestPrioritiesResponse>({
      method: "GET",
      path: "/request-priorities",
      auth: true,
    });
  },

  getById(id: string) {
    return http<RequestPriorityDetailResponse>({
      method: "GET",
      path: `/request-priorities/${id}`,
      auth: true,
    });
  },

  create(payload: CreateRequestPriorityPayload) {
    return http<{ success: boolean; data: RequestPriorityItem }>({
      method: "POST",
      path: "/request-priorities",
      body: payload,
      auth: true,
    });
  },

  update(id: string, payload: UpdateRequestPriorityPayload) {
    return http<{ success: boolean; data: RequestPriorityItem }>({
      method: "PUT",
      path: `/request-priorities/${id}`,
      body: payload,
      auth: true,
    });
  },

  remove(id: string) {
    return http<{ success: boolean }>({
      method: "DELETE",
      path: `/request-priorities/${id}`,
      auth: true,
    });
  },
};