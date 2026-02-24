// api/requests/request-attachments.api.ts
import { http } from "@/api/http/http.client";
import { tokenStorage } from "@/utils/storage/token.storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type RequestAttachmentItem = {
  id: string;
  request_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ListResponse = { success: boolean; data: RequestAttachmentItem[] };
type UploadResponse = { success: boolean; message?: string; data: RequestAttachmentItem };

function requireApiUrl(): string {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL no está definido.");
  return API_URL;
}

export const requestAttachmentsApi = {
  // GET /api/request-attachments?requestId=...
  listByRequestId(requestId: string) {
    return http<ListResponse>({
      method: "GET",
      path: `/request-attachments?requestId=${encodeURIComponent(requestId)}`,
      auth: true,
    });
  },

  // POST /api/request-attachments/upload (multipart/form-data)
  async upload(payload: { requestId: string; title?: string; file: File }) {
    const base = requireApiUrl();

    const form = new FormData();
    form.append("requestId", payload.requestId);
    if (payload.title) form.append("title", payload.title);
    form.append("file", payload.file);

    const headers: HeadersInit = {};
    const token = tokenStorage.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    // ❗ NO setear Content-Type aquí (fetch lo setea con boundary)

    const res = await fetch(`${base}/request-attachments/upload`, {
      method: "POST",
      headers,
      body: form,
    });

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      const msg = data?.message || `Error HTTP ${res.status} al subir adjunto`;
      throw new Error(msg);
    }

    return data as UploadResponse;
  },

  // DELETE /api/request-attachments/:id
  delete(id: string) {
    return http<{ success: boolean; message?: string; data?: unknown }>({
      method: "DELETE",
      path: `/request-attachments/${encodeURIComponent(id)}`,
      auth: true,
    });
  },

  // GET /api/request-attachments/download/:id  (para descarga por fetch/blob)
  async download(attachmentId: string): Promise<{ blob: Blob; filename: string }> {
    const base = requireApiUrl();
    const token = tokenStorage.getToken();

    const res = await fetch(`${base}/request-attachments/download/${attachmentId}`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!res.ok) {
      let msg = `Error HTTP ${res.status} al descargar`;
      try {
        const isJson = res.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await res.json() : null;
        msg = data?.message || msg;
      } catch {}
      throw new Error(msg);
    }

    const blob = await res.blob();

    // intenta sacar nombre desde Content-Disposition
    const disposition = res.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="([^"]+)"/i);
    const filename = match?.[1] || `attachment-${attachmentId}`;

    return { blob, filename };
  },
};