export type LoginRequest = {
  username: string;
  password: string;
};

export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roleCode: string;
};

export type LoginResponse = {
  success: boolean;
  data: {
    accessToken: string;
    user: AuthUser;
  };
};
