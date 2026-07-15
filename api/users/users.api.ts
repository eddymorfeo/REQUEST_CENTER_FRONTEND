import { http } from "@/api/http/http.client";
import { tokenStorage } from "@/utils/storage/token.storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type UserItem = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role_id: string;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  profile_photo_url?: string | null;
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
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  password: string;
  isActive?: boolean;
};

export type UpdateUserPayload = {
  username: string;
  fullName: string;
  email?: string;
  roleId?: string;
  password?: string;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  isActive: boolean;
};

function requireApiUrl(): string {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL no está definido.");
  return API_URL;
}

export const usersApi = {
  listUsers() {
    return http<UsersListResponse>({
      method: "GET",
      path: "/users",
      auth: true,
    });
  },

  listAssignableUsers(params?: { page?: number; pageSize?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

    const qs = searchParams.toString();
    return http<UsersListResponse>({
      method: "GET",
      path: qs ? `/users/assignable?${qs}` : "/users/assignable",
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

  async uploadAvatar(id: string, file: File) {
    const base = requireApiUrl();
    const token = tokenStorage.getToken();
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${base}/users/${encodeURIComponent(id)}/avatar`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      throw new Error(data?.message || `Error HTTP ${res.status} al subir foto`);
    }

    return data as { success: boolean; data: UserItem };
  },

  deleteAvatar(id: string) {
    return http<{ success: boolean; data: UserItem }>({
      method: "DELETE",
      path: `/users/${encodeURIComponent(id)}/avatar`,
      auth: true,
    });
  },

  async downloadAvatar(id: string): Promise<Blob> {
    const base = requireApiUrl();
    const token = tokenStorage.getToken();

    const res = await fetch(`${base}/users/${encodeURIComponent(id)}/avatar`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!res.ok) {
      let message = `Error HTTP ${res.status} al cargar foto`;
      try {
        const isJson = res.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await res.json() : null;
        message = data?.message || message;
      } catch {}
      throw new Error(message);
    }

    return res.blob();
  },

  deleteUser(id: string) {
    return http<{ success: boolean }>({
      method: "DELETE",
      path: `/users/${id}`,
      auth: true,
    });
  },
};
