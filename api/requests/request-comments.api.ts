import { http } from "@/api/http/http.client";

export type RequestCommentItem = {
  id: string;
  request_id: string;
  author_id: string;
  comment: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  author_username?: string | null;
  author_full_name?: string | null;
  author_email?: string | null;
  author_role_code?: string | null;
  author_role_name?: string | null;
};

type ListResponse = { success: boolean; data: RequestCommentItem[] };
type CreateResponse = {
  success: boolean;
  message?: string;
  data: RequestCommentItem;
};

export const requestCommentsApi = {
  listByRequestId(requestId: string) {
    return http<ListResponse>({
      method: "GET",
      path: `/request-comments?requestId=${encodeURIComponent(requestId)}`,
      auth: true,
    });
  },

  create(payload: { requestId: string; comment: string }) {
    return http<CreateResponse>({
      method: "POST",
      path: "/request-comments",
      body: {
        request_id: payload.requestId,
        comment: payload.comment,
      },
      auth: true,
    });
  },
};
