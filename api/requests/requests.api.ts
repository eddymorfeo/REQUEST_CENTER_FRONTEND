import { http } from "@/api/http/http.client";
import type { RequestItem, RequestsListResponse } from "@/types/requests/request.types";

type RequestDetailResponse = {
  success: boolean;
  data: RequestItem;
};

export type UpdateRequestPayload = Partial<Pick<
  RequestItem,
  "title" | "description" | "request_type_id" | "priority_id" | "is_active"
>>;

export type CreateRequestPayload = {
  title: string;
  description: string;
  statusId: string;
  requestTypeId: string;
  priorityId: string;
  requester?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    position?: string;
  };
};

export const requestsApi = {
  getAll(params: { page?: number; pageSize?: number } = {}) {
    const search = new URLSearchParams();
    if (params.page) search.set("page", String(params.page));
    if (params.pageSize) search.set("pageSize", String(params.pageSize));
    const query = search.toString();

    return http<RequestsListResponse>({
      method: "GET",
      path: `/requests${query ? `?${query}` : ""}`,
      auth: true,
    });
  },

  getById(id: string) {
    return http<RequestDetailResponse>({
      method: "GET",
      path: `/requests/${id}`,
      auth: true,
    });
  },

    updateRequest(id: string, payload: UpdateRequestPayload) {
    return http<{ success: boolean; data?: RequestItem }>({
      method: "PUT",
      path: `/requests/${id}`,
      body: payload,
      auth: true,
    });
  },

  createRequest(payload: CreateRequestPayload) {
    return http<{ success: boolean; data?: RequestItem }>({
      method: "POST",
      path: "/requests",
      body: payload,
      auth: true,
    });
  },

    deleteRequest(id: string) {
    return http<{ success: boolean }>({
      method: "DELETE",
      path: `/requests/${id}`,
      auth: true,
    });
  },
};
