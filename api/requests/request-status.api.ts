import { http } from "@/api/http/http.client";
import type { RequestStatusListResponse } from "@/types/requests/request-status.types";

export type CreateRequestStatusPayload = {
  code: string;
  name: string;
  sortOrder?: number;
  isTerminal?: boolean;
  isActive?: boolean;
};

export type UpdateRequestStatusPayload = {
  code: string;
  name: string;
  sortOrder: number;
  isTerminal: boolean;
  isActive: boolean;
};

export type RequestStatusDetailResponse = {
  success: boolean;
  data: any;
};

export const requestStatusApi = {
  getAll() {
    return http<RequestStatusListResponse>({
      method: "GET",
      path: "/request-status",
      auth: true,
    });
  },

  getById(id: string) {
    return http<RequestStatusDetailResponse>({
      method: "GET",
      path: `/request-status/${id}`,
      auth: true,
    });
  },

  create(payload: CreateRequestStatusPayload) {
    return http<{ success: boolean; data: any }>({
      method: "POST",
      path: "/request-status",
      body: payload,
      auth: true,
    });
  },

  update(id: string, payload: UpdateRequestStatusPayload) {
    return http<{ success: boolean; data: any }>({
      method: "PUT",
      path: `/request-status/${id}`,
      body: payload,
      auth: true,
    });
  },

  remove(id: string) {
    return http<{ success: boolean }>({
      method: "DELETE",
      path: `/request-status/${id}`,
      auth: true,
    });
  },
};