import { http } from "@/api/http/http.client";

export type UserItem = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role_id: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type UsersListResponse = {
  success: boolean;
  items: UserItem[];
  meta?: PaginationMeta;
};

export type UserDetailResponse = {
  success: boolean;
  data: UserItem;
};

export type CreateUserPayload = {
  username: string;
  fullName: string;
  email: string;
  roleId?: string;
  password: string;
  isActive?: boolean;
};

export type UpdateUserPayload = {
  username: string;
  fullName: string;
  email?: string;
  roleId?: string;
  password?: string;
  isActive: boolean;
};

export const usersApi = {
  listUsers() {
    return http<UsersListResponse>({
      method: "GET",
      path: "/users",
      auth: true,
    });
  },

  listUsersPaged(params?: { page?: number; pageSize?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

    const qs = searchParams.toString();
    return http<UsersListResponse>({
      method: "GET",
      path: qs ? `/users?${qs}` : "/users",
      auth: true,
    });
  },

  getById(id: string) {
    return http<UserDetailResponse>({
      method: "GET",
      path: `/users/${id}`,
      auth: true,
    });
  },

  createUser(payload: CreateUserPayload) {
    return http<{ success: boolean; data: UserItem }>({
      method: "POST",
      path: "/users",
      body: payload,
      auth: true,
    });
  },

  updateUser(id: string, payload: UpdateUserPayload) {
    return http<{ success: boolean; data: UserItem }>({
      method: "PUT",
      path: `/users/${id}`,
      body: payload,
      auth: true,
    });
  },

  deleteUser(id: string) {
    return http<{ success: boolean }>({
      method: "DELETE",
      path: `/users/${id}`,
      auth: true,
    });
  },
};