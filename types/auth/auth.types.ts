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
  permissions?: string[];
  capabilities?: {
    canAssignRequests?: boolean;
    canReceiveAssignments?: boolean;
    canChangeAnyRequestStatus?: boolean;
    canChangeAssignedRequestStatus?: boolean;
    canDeleteRequests?: boolean;
    canAttachFilesToAnyRequest?: boolean;
    canAttachFilesToAssignedRequest?: boolean;
    canViewPublicThread?: boolean;
    canMessagePublicThread?: boolean;
    canManageUsers?: boolean;
    canManageCatalogs?: boolean;
  };
};

export type LoginResponse = {
  success: boolean;
  data: {
    accessToken: string;
    user: AuthUser;
  };
};
