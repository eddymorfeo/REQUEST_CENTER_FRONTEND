"use client";

import * as React from "react";
import {
  Calendar,
  Download,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  MessageSquareText,
  Paperclip,
  Send,
  X,
} from "lucide-react";

import {
  requestPublicCommunicationsApi,
  type PublicCommunicationAttachment,
  type PublicCommunicationMessage,
} from "@/api/requests/request-public-communications.api";
import { useAuth } from "@/hooks/auth/useAuth";
import { getErrorMessage } from "@/lib/errors/get-error-message";
import { alerts } from "@/utils/alerts/alerts";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type AttachmentVisualInput = {
  file_name: string;
  mime_type?: string | null;
};

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return "-";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let idx = 0;

  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx++;
  }

  return `${size.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function normalizeFiles(files: FileList | null) {
  return files ? Array.from(files) : [];
}

function removeSelectedFile(files: File[], fileToRemove: File) {
  return files.filter(
    (file) =>
      file.name !== fileToRemove.name ||
      file.size !== fileToRemove.size ||
      file.lastModified !== fileToRemove.lastModified
  );
}

function getDisplayName(message: PublicCommunicationMessage) {
  if (message.direction === "INBOUND") {
    return [message.requester_first_name, message.requester_last_name].filter(Boolean).join(" ") || "Solicitante";
  }

  return message.created_by_full_name?.trim() || "Request Center";
}

function getInitials(name: string) {
  const parts = name.split(" ").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return "RC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getAttachmentVisual(file: AttachmentVisualInput) {
  const mimeType = (file.mime_type ?? "").toLowerCase();
  const fileName = file.file_name.toLowerCase();

  if (mimeType.startsWith("image/")) return { icon: FileImage, className: "bg-blue-50 text-blue-700" };
  if (mimeType.includes("pdf") || fileName.endsWith(".pdf")) return { icon: FileText, className: "bg-red-50 text-red-700" };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || fileName.endsWith(".xls") || fileName.endsWith(".xlsx") || fileName.endsWith(".csv")) {
    return { icon: FileSpreadsheet, className: "bg-emerald-50 text-emerald-700" };
  }
  if (mimeType.includes("zip") || mimeType.includes("compressed") || fileName.endsWith(".zip") || fileName.endsWith(".rar") || fileName.endsWith(".7z")) {
    return { icon: FileArchive, className: "bg-amber-50 text-amber-700" };
  }
  if (mimeType.startsWith("text/") || fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
    return { icon: FileText, className: "bg-indigo-50 text-indigo-700" };
  }

  return { icon: File, className: "bg-muted text-muted-foreground" };
}

function communicationCountLabel(count: number) {
  return `${count} ${count === 1 ? "mensaje" : "mensajes"}`;
}

type Props = {
  requestId: string;
  disabled?: boolean;
};

export function RequestObservationsPanel({ requestId, disabled = false }: Props) {
  const { user } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [messages, setMessages] = React.useState<PublicCommunicationMessage[]>([]);
  const [canSendCommunication, setCanSendCommunication] = React.useState(false);
  const [unavailableMessage, setUnavailableMessage] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState("");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = React.useState<string | null>(null);

  const currentUserName = user?.fullName?.trim() || user?.username?.trim() || "Usuario";
  const currentUserInitials = getInitials(currentUserName);
  const canWrite = canSendCommunication && !disabled;

  const timelineItems = React.useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages]);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setUnavailableMessage(null);

    try {
      const res = await requestPublicCommunicationsApi.getThread(requestId);
      setMessages(res.data.messages ?? []);
      setCanSendCommunication(Boolean(res.data.permissions?.canSendCommunication));
    } catch (error: unknown) {
      setMessages([]);
      setCanSendCommunication(false);
      setUnavailableMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setMessage("");
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanMessage = message.trim();
    if (!cleanMessage) {
      await alerts.error("Mensaje requerido", "Escribe un mensaje para enviar al solicitante.");
      return;
    }

    if (!canWrite) {
      await alerts.error("Accion no permitida", "Solo ADMIN o el especialista asignado puede enviar mensajes.");
      return;
    }

    try {
      setIsSaving(true);
      await requestPublicCommunicationsApi.createMessage(requestId, {
        messageType: "GENERAL",
        message: cleanMessage,
        files: selectedFiles,
      });

      resetForm();
      await load();
      await alerts.toastSuccess("Mensaje enviado");
    } catch (error: unknown) {
      await alerts.error("No se pudo enviar el mensaje", getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const onDownloadAttachment = async (attachment: PublicCommunicationAttachment) => {
    try {
      setDownloadingAttachmentId(attachment.id);
      const { blob, filename } = await requestPublicCommunicationsApi.downloadAttachment(attachment.id);

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename || attachment.file_name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      await alerts.error("No se pudo descargar", getErrorMessage(error));
    } finally {
      setDownloadingAttachmentId(null);
    }
  };

  return (
    <Card className="rounded-2xl p-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquareText className="size-4" />
              Historial de mensajes
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Canal visible para el solicitante externo y usuarios internos.
            </p>
          </div>

          <div className="w-fit rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {communicationCountLabel(timelineItems.length)}
          </div>
        </div>

        {unavailableMessage && !isLoading ? (
          <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
            No hay canal publico disponible para esta solicitud. {unavailableMessage}
          </div>
        ) : null}

        {!isLoading && !unavailableMessage ? (
          <>
            <form className="rounded-xl border p-3" onSubmit={onSubmit}>
              <div className="grid gap-3 sm:grid-cols-[36px_1fr]">
                <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {currentUserInitials}
                </div>

                <div className="min-w-0 space-y-3">
                  <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    disabled={!canWrite || isSaving}
                    className="min-h-[96px] resize-none text-sm"
                    maxLength={10000}
                    placeholder={canWrite ? "Escribe un mensaje visible para el solicitante..." : "Puedes ver este historial, pero no enviar mensajes."}
                  />

                  {selectedFiles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file) => {
                        const visual = getAttachmentVisual({ file_name: file.name, mime_type: file.type });
                        const AttachmentIcon = visual.icon;

                        return (
                          <div key={`${file.name}-${file.size}-${file.lastModified}`} className="inline-flex max-w-full items-center gap-2 rounded-md border px-2 py-1 text-xs">
                            <span className={`flex size-6 shrink-0 items-center justify-center rounded ${visual.className}`}>
                              <AttachmentIcon className="size-3.5" />
                            </span>
                            <span className="truncate">{file.name}</span>
                            <span className="shrink-0 text-muted-foreground">{formatBytes(file.size)}</span>
                            <button type="button" onClick={() => setSelectedFiles((current) => removeSelectedFile(current, file))} disabled={isSaving}>
                              <X className="size-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="sr-only"
                      disabled={!canWrite || isSaving}
                      onChange={(event) => setSelectedFiles(normalizeFiles(event.target.files))}
                    />
                    <Button type="button" variant="outline" size="sm" disabled={!canWrite || isSaving} onClick={() => fileInputRef.current?.click()}>
                      <Paperclip className="size-4" />
                      Adjuntar archivo
                    </Button>

                    <Button type="submit" size="sm" disabled={!canWrite || isSaving || message.trim().length === 0} className="sm:min-w-[180px]">
                      <Send className="size-4" />
                      {isSaving ? "Enviando..." : "Enviar mensaje"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {!canSendCommunication ? (
              <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
                Solo ADMIN o el especialista asignado puede enviar mensajes. Los demas usuarios pueden consultar el historial.
              </div>
            ) : null}
          </>
        ) : null}

        <div className="max-h-[520px] min-h-[260px] overflow-y-auto rounded-xl border bg-muted/10 p-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Cargando mensajes...</div>
          ) : !unavailableMessage && timelineItems.length === 0 ? (
            <div className="rounded-xl border bg-background p-3 text-sm text-muted-foreground">No hay mensajes registrados.</div>
          ) : !unavailableMessage ? (
            <div className="space-y-3">
              {timelineItems.map((item) => {
                const authorName = getDisplayName(item);
                const isRequester = item.direction === "INBOUND";
                const attachments = item.attachments ?? [];

                return (
                  <div key={item.id} className={`flex ${isRequester ? "justify-end" : "justify-start"}`}>
                    <article className={`max-w-[78%] rounded-2xl border p-3 shadow-xs ${isRequester ? "rounded-br-md border-cyan-200 bg-cyan-50/70" : "rounded-bl-md bg-background"}`}>
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`flex size-7 items-center justify-center rounded-full text-[10px] font-semibold ${isRequester ? "bg-cyan-100 text-cyan-800" : "bg-blue-100 text-blue-700"}`}>
                            {getInitials(authorName)}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{authorName}</span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="size-3.5" />
                          {formatDate(item.created_at)}
                        </span>
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-foreground/85">{item.message}</p>

                      {attachments.length > 0 ? (
                        <div className="mt-3 space-y-2 border-t pt-3">
                          {attachments.map((attachment) => {
                            const visual = getAttachmentVisual(attachment);
                            const AttachmentIcon = visual.icon;

                            return (
                              <button
                                key={attachment.id}
                                type="button"
                                className="flex w-full items-center justify-between gap-3 rounded-lg border bg-background p-2 text-left hover:bg-muted/50"
                                onClick={() => onDownloadAttachment(attachment)}
                                disabled={downloadingAttachmentId === attachment.id}
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <span className={`flex size-7 shrink-0 items-center justify-center rounded-md ${visual.className}`}>
                                    <AttachmentIcon className="size-4" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate text-xs font-medium">{attachment.file_name}</span>
                                    <span className="block text-xs text-muted-foreground">{attachment.mime_type || "archivo"} - {formatBytes(Number(attachment.size_bytes))}</span>
                                  </span>
                                </span>
                                <Download className="size-4 shrink-0 text-muted-foreground" />
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </article>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
