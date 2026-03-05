import { http } from "@/api/http/http.client";

export type RequestTypeItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RequestTypesResponse = {
  success: boolean;
  items: RequestTypeItem[];
};

export type CreateRequestTypePayload = {
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
};

export type UpdateRequestTypePayload = {
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
};

export type RequestTypeDetailResponse = {
  success: boolean;
  data: RequestTypeItem;
};

export const requestTypesApi = {
  getAll() {
    return http<RequestTypesResponse>({
      method: "GET",
      path: "/request-types",
      auth: true,
    });
  },

  getById(id: string) {
    return http<RequestTypeDetailResponse>({
      method: "GET",
      path: `/request-types/${id}`,
      auth: true,
    });
  },

  create(payload: CreateRequestTypePayload) {
    return http<{ success: boolean; data: RequestTypeItem }>({
      method: "POST",
      path: "/request-types",
      body: payload,
      auth: true,
    });
  },

  update(id: string, payload: UpdateRequestTypePayload) {
    return http<{ success: boolean; data: RequestTypeItem }>({
      method: "PUT",
      path: `/request-types/${id}`,
      body: payload,
      auth: true,
    });
  },

  remove(id: string) {
    return http<{ success: boolean }>({
      method: "DELETE",
      path: `/request-types/${id}`,
      auth: true,
    });
  },
};