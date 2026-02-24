import { http } from "@/api/http/http.client";

export type UserItem = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role_id: string;
  is_active: boolean;
};

export type UsersListResponse = {
  success: boolean;
  items: UserItem[];
};

export const usersApi = {
  listUsers() {
    return http<UsersListResponse>({
      method: "GET",
      path: "/users",
      auth: true,
    });
  },

  // opcional: si quieres usar endpoints específicos
  listAnalysts() {
    return http<UsersListResponse>({
      method: "GET",
      path: "/users/analysts",
      auth: true,
    });
  },

  listFiscals() {
    return http<UsersListResponse>({
      method: "GET",
      path: "/users/fiscals",
      auth: true,
    });
  },
};