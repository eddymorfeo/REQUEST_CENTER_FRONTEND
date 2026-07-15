import { http } from "@/api/http/http.client";

export type RoleItem = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  permissionKeys?: string[];
};

export type PermissionItem = {
  id: string;
  key: string;
  description: string;
  created_at?: string | null;
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

export type PermissionsListResponse = {
  success: boolean;
  items: PermissionItem[];
};

export type RolePermissionsResponse = {
  success: boolean;
  data: {
    permissionKeys: string[];
  };
};

export type CreateRolePayload = {
  code: string;
  name: string;
  isActive?: boolean;
  permissionKeys?: string[];
};

export type UpdateRolePayload = {
  code: string;
  name: string;
  isActive: boolean;
  permissionKeys?: string[];
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

  listPermissions() {
    return http<PermissionsListResponse>({
      method: "GET",
      path: "/roles/permissions/catalog",
      auth: true,
    });
  },

  getRolePermissions(id: string) {
    return http<RolePermissionsResponse>({
      method: "GET",
      path: `/roles/${id}/permissions`,
      auth: true,
    });
  },

  updateRolePermissions(id: string, permissionKeys: string[]) {
    return http<RolePermissionsResponse>({
      method: "PUT",
      path: `/roles/${id}/permissions`,
      body: { permissionKeys },
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
