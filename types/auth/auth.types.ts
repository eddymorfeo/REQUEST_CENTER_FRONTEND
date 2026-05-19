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
  profilePhotoUrl?: string | null;
};

export type LoginResponse = {
  success: boolean;
  data: {
    accessToken: string;
    user: AuthUser;
  };
};
