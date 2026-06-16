export type RequestItem = {
  id: string;
  title: string;
  description: string;

  status_id: string;
  request_type_id: string;
  priority_id: string;

  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;

  first_assigned_at: string | null;
  closed_at: string | null;

  requester_id?: string | null;
  prosecutor_office_id?: string | null;
  tracking_code?: string | null;
  source?: "INTERNAL" | "PUBLIC_PORTAL" | string | null;
  public_status?: string | null;
  submitted_at?: string | null;
  last_public_activity_at?: string | null;

  requester_first_name?: string | null;
  requester_last_name?: string | null;
  requester_email?: string | null;
  requester_phone?: string | null;

  prosecutor_office_code?: string | null;
  prosecutor_office_name?: string | null;
  prosecutor_office_region_code?: string | null;
  prosecutor_office_region_name?: string | null;

  status_code?: string;
  status_name?: string;
  status_sort_order?: number;
  is_terminal?: boolean;

  type_code?: string;
  type_name?: string;

  priority_code?: string;
  priority_name?: string;
};

export type RequestsListResponse = {
  success: boolean;
  items: RequestItem[];
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
