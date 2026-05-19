export type AccountTab = "data" | "security";

export type AccountFormState = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roleId: string;
  roleCode: string;
  phone: string;
  position: string;
  department: string;
  profilePhotoUrl: string | null;
  isActive: boolean;
};

export type PersonalDraft = {
  firstName: string;
  lastName: string;
  phone: string;
  position: string;
  department: string;
  timezone: string;
  emailNotifications: boolean;
  platformNotifications: boolean;
};

