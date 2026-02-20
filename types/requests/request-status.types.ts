export type RequestStatus = {
  id: string;
  code: string; // UNASSIGNED | ASSIGNED | IN_PROGRESS | DONE
  name: string; // Sin Asignar | Asignado | En Progreso | Terminado
  sort_order: number;
  is_terminal: boolean;
  user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RequestStatusListResponse = {
  success: boolean;
  items: RequestStatus[];
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
