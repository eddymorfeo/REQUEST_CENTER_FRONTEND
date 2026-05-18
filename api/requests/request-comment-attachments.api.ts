import { tokenStorage } from "@/utils/storage/token.storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type RequestCommentAttachmentItem = {
  id: string;
  request_id: string;
  request_comment_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ListResponse = { success: boolean; data: RequestCommentAttachmentItem[] };
type UploadResponse = {
  success: boolean;
  message?: string;
  data: RequestCommentAttachmentItem;
};

function requireApiUrl(): string {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL no está definido.");
  return API_URL;
}

async function readJsonResponse<T>(res: Response): Promise<T | null> {
  const isJson = res.headers.get("content-type")?.includes("application/json");
  return isJson ? ((await res.json()) as T) : null;
}

export const requestCommentAttachmentsApi = {
  async listByRequestId(requestId: string) {
    const base = requireApiUrl();
    const token = tokenStorage.getToken();

    const res = await fetch(
      `${base}/request-comment-attachments?requestId=${encodeURIComponent(requestId)}`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    const data = await readJsonResponse<ListResponse & { message?: string }>(res);
    if (!res.ok) {
      throw new Error(data?.message || `Error HTTP ${res.status} al cargar adjuntos`);
    }

    return data as ListResponse;
  },

  async upload(payload: {
    requestId: string;
    commentId: string;
    title?: string;
    file: File;
  }) {
    const base = requireApiUrl();
    const token = tokenStorage.getToken();
    const form = new FormData();

    form.append("requestId", payload.requestId);
    form.append("commentId", payload.commentId);
    if (payload.title) form.append("title", payload.title);
    form.append("file", payload.file);

    const res = await fetch(`${base}/request-comment-attachments/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });

    const data = await readJsonResponse<UploadResponse & { message?: string }>(res);
    if (!res.ok) {
      throw new Error(data?.message || `Error HTTP ${res.status} al subir adjunto`);
    }

    return data as UploadResponse;
  },

  async download(attachmentId: string): Promise<{ blob: Blob; filename: string }> {
    const base = requireApiUrl();
    const token = tokenStorage.getToken();

    const res = await fetch(
      `${base}/request-comment-attachments/download/${encodeURIComponent(attachmentId)}`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    if (!res.ok) {
      const data = await readJsonResponse<{ message?: string }>(res);
      throw new Error(data?.message || `Error HTTP ${res.status} al descargar`);
    }

    const blob = await res.blob();
    const disposition = res.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="([^"]+)"/i);
    const filename = match?.[1] || `comment-attachment-${attachmentId}`;

    return { blob, filename };
  },
};
