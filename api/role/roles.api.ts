import { http } from "@/api/http/http.client";

export type RoleItem = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type RolesListResponse = {
  success: boolean;
  items: RoleItem[];
  meta?: PaginationMeta;
};

export type RoleDetailResponse = {
  success: boolean;
  data: RoleItem;
};

export type CreateRolePayload = {
  code: string;
  name: string;
  isActive?: boolean;
};

export type UpdateRolePayload = {
  code: string;
  name: string;
  isActive: boolean;
};

export const rolesApi = {
  listRoles() {
    return http<RolesListResponse>({
      method: "GET",
      path: "/roles",
      auth: true,
    });
  },

  listRolesPaged(params?: { page?: number; pageSize?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

    const qs = searchParams.toString();
    return http<RolesListResponse>({
      method: "GET",
      path: qs ? `/roles?${qs}` : "/roles",
      auth: true,
    });
  },

  getById(id: string) {
    return http<RoleDetailResponse>({
      method: "GET",
      path: `/roles/${id}`,
      auth: true,
    });
  },

  createRole(payload: CreateRolePayload) {
    return http<{ success: boolean; data: RoleItem }>({
      method: "POST",
      path: "/roles",
      body: payload,
      auth: true,
    });
  },

  updateRole(id: string, payload: UpdateRolePayload) {
    return http<{ success: boolean; data: RoleItem }>({
      method: "PUT",
      path: `/roles/${id}`,
      body: payload,
      auth: true,
    });
  },

  deleteRole(id: string) {
    return http<void>({
      method: "DELETE",
      path: `/roles/${id}`,
      auth: true,
    });
  },
};