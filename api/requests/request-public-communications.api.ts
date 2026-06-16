import { http } from "@/api/http/http.client";
import { tokenStorage } from "@/utils/storage/token.storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type PublicCommunicationAttachment = {
  id: string;
  file_name: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  source?: string | null;
  created_at: string;
};

export type PublicCommunicationMessage = {
  id: string;
  requester_id?: string | null;
  direction: "INBOUND" | "OUTBOUND" | "SYSTEM";
  message_type: string;
  subject?: string | null;
  message: string;
  created_by_user_id?: string | null;
  created_by_full_name?: string | null;
  requester_first_name?: string | null;
  requester_last_name?: string | null;
  is_visible_to_requester: boolean;
  created_at: string;
  attachments?: PublicCommunicationAttachment[];
};

export type PublicThreadResponse = {
  success: boolean;
  data: {
    request: {
      id: string;
      tracking_code: string;
      requester_email?: string | null;
      requester_first_name?: string | null;
      requester_last_name?: string | null;
      public_status?: string | null;
    };
    permissions: {
      canSendCommunication: boolean;
    };
    messages: PublicCommunicationMessage[];
    events: unknown[];
    attachments: PublicCommunicationAttachment[];
    emailLogs: unknown[];
  };
};

export type CreatePublicCommunicationPayload = {
  messageType: string;
  subject?: string;
  message: string;
  publicStatus?: string;
  files?: File[];
};

function requireApiUrl(): string {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL no esta definido.");
  return API_URL;
}

export const requestPublicCommunicationsApi = {
  getThread(requestId: string) {
    return http<PublicThreadResponse>({
      method: "GET",
      path: `/requests/${encodeURIComponent(requestId)}/public-thread`,
      auth: true,
    });
  },

  async createMessage(requestId: string, payload: CreatePublicCommunicationPayload) {
    const base = requireApiUrl();
    const form = new FormData();
    form.append("messageType", payload.messageType);
    form.append("message", payload.message);
    if (payload.subject) form.append("subject", payload.subject);
    if (payload.publicStatus) form.append("publicStatus", payload.publicStatus);
    payload.files?.forEach((file) => form.append("files", file));

    const headers: HeadersInit = {};
    const token = tokenStorage.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${base}/requests/${encodeURIComponent(requestId)}/public-messages`, {
      method: "POST",
      headers,
      body: form,
    });

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      throw new Error(data?.message || `Error HTTP ${res.status} al enviar comunicacion`);
    }

    return data as { success: boolean; data: PublicCommunicationMessage };
  },

  async downloadAttachment(attachmentId: string): Promise<{ blob: Blob; filename: string }> {
    const base = requireApiUrl();
    const token = tokenStorage.getToken();

    const res = await fetch(`${base}/request-attachments/download/${encodeURIComponent(attachmentId)}`, {
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
    const disposition = res.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="([^"]+)"/i);
    const filename = match?.[1] || `attachment-${attachmentId}`;

    return { blob, filename };
  },
};
