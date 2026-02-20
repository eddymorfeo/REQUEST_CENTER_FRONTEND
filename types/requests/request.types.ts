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

  // Campos “denormalizados” que ya devuelve tu backend (según tu ejemplo)
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
