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

export const requestTypesApi = {
  getAll() {
    return http<RequestTypesResponse>({
      method: "GET",
      path: "/request-types",
      auth: true,
    });
  },
};