"use client";

import * as React from "react";
import {
  Calendar,
  Download,
  Eye,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  MessageSquareText,
  MoreVertical,
  Paperclip,
  Send,
} from "lucide-react";

import {
  requestCommentAttachmentsApi,
  type RequestCommentAttachmentItem,
} from "@/api/requests/request-comment-attachments.api";
import { requestCommentsApi, type RequestCommentItem } from "@/api/requests/request-comments.api";
import { useAuth } from "@/hooks/auth/useAuth";
import { getErrorMessage } from "@/lib/errors/get-error-message";
import { alerts } from "@/utils/alerts/alerts";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type AttachmentVisualInput = {
  file_name: string;
  mime_type: string;
};

function formatCommentDate(value?: string) {
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

function formatBytes(bytes: number) {
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
  if (!files) return [];
  return Array.from(files);
}

function getAuthorName(comment: RequestCommentItem) {
  return (
    comment.author_full_name?.trim() ||
    comment.author_username?.trim() ||
    "Usuario sin nombre"
  );
}

function getInitials(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "US";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getAvatarClassName(index: number) {
  const tones = [
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
  ];

  return tones[index % tones.length];
}

function getObservationCountLabel(count: number) {
  return `${count} ${count === 1 ? "observación" : "observaciones"}`;
}

function getAttachmentVisual(file: AttachmentVisualInput) {
  const mimeType = file.mime_type.toLowerCase();
  const fileName = file.file_name.toLowerCase();

  if (mimeType.startsWith("image/")) {
    return { icon: FileImage, className: "bg-blue-50 text-blue-700" };
  }

  if (mimeType.includes("pdf") || fileName.endsWith(".pdf")) {
    return { icon: FileText, className: "bg-red-50 text-red-700" };
  }

  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".csv")
  ) {
    return { icon: FileSpreadsheet, className: "bg-emerald-50 text-emerald-700" };
  }

  if (
    mimeType.includes("zip") ||
    mimeType.includes("compressed") ||
    fileName.endsWith(".zip") ||
    fileName.endsWith(".rar") ||
    fileName.endsWith(".7z")
  ) {
    return { icon: FileArchive, className: "bg-amber-50 text-amber-700" };
  }

  if (mimeType.startsWith("text/") || fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
    return { icon: FileText, className: "bg-indigo-50 text-indigo-700" };
  }

  return { icon: File, className: "bg-muted text-muted-foreground" };
}

function groupAttachmentsByCommentId(items: RequestCommentAttachmentItem[]) {
  return items.reduce<Record<string, RequestCommentAttachmentItem[]>>((acc, item) => {
    if (item.is_active === false) return acc;
    const current = acc[item.request_comment_id] ?? [];
    acc[item.request_comment_id] = [...current, item].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return acc;
  }, {});
}

type Props = {
  requestId: string;
  disabled?: boolean;
};

export function RequestObservationsPanel({ requestId, disabled = false }: Props) {
  const { user } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [items, setItems] = React.useState<RequestCommentItem[]>([]);
  const [attachmentsByCommentId, setAttachmentsByCommentId] = React.useState<
    Record<string, RequestCommentAttachmentItem[]>
  >({});
  const [comment, setComment] = React.useState("");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = React.useState<string | null>(null);

  const currentUserName = user?.fullName?.trim() || user?.username?.trim() || "Usuario";
  const currentUserInitials = getInitials(currentUserName);

  const timelineItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const left = new Date(a.created_at).getTime();
      const right = new Date(b.created_at).getTime();
      return right - left;
    });
  }, [items]);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const commentsRes = await requestCommentsApi.listByRequestId(requestId);

      setItems((commentsRes.data ?? []).filter((item) => item.is_active !== false));

      try {
        const attachmentsRes = await requestCommentAttachmentsApi.listByRequestId(requestId);
        setAttachmentsByCommentId(groupAttachmentsByCommentId(attachmentsRes.data ?? []));
      } catch {
        setAttachmentsByCommentId({});
      }
    } catch (error: unknown) {
      await alerts.error(
        "No se pudieron cargar observaciones",
        getErrorMessage(error)
      );
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const uploadSelectedFiles = async (commentId: string) => {
    if (selectedFiles.length === 0) return [];

    const uploaded: RequestCommentAttachmentItem[] = [];
    const failed: string[] = [];

    for (const file of selectedFiles) {
      try {
        const res = await requestCommentAttachmentsApi.upload({
          requestId,
          commentId,
          title: comment.trim() || "observacion",
          file,
        });
        uploaded.push(res.data);
      } catch {
        failed.push(file.name);
      }
    }

    if (uploaded.length > 0) {
      setAttachmentsByCommentId((current) => ({
        ...current,
        [commentId]: [...uploaded, ...(current[commentId] ?? [])],
      }));
    }

    return failed;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanComment = comment.trim();
    if (!cleanComment) {
      await alerts.error("Observación requerida", "Escribe una observación para guardar.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await requestCommentsApi.create({
        requestId,
        comment: cleanComment,
      });

      setItems((current) => [res.data, ...current]);

      const failedUploads = await uploadSelectedFiles(res.data.id);
      setComment("");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (failedUploads.length > 0) {
        await alerts.error(
          "Observación agregada, pero adjuntos incompletos",
          `No se pudieron subir: ${failedUploads.join(", ")}`
        );
      } else {
        await alerts.toastSuccess("Observación agregada");
      }
    } catch (error: unknown) {
      await alerts.error("No se pudo agregar la observación", getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const onDownloadAttachment = async (attachment: RequestCommentAttachmentItem) => {
    try {
      setDownloadingAttachmentId(attachment.id);
      const { blob, filename } = await requestCommentAttachmentsApi.download(attachment.id);

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename || attachment.file_name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      await alerts.toastSuccess("Descarga iniciada");
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
              Historial de observaciones
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Registra y consulta todas las observaciones realizadas en esta solicitud.
            </p>
          </div>

          <div className="w-fit rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {getObservationCountLabel(timelineItems.length)}
          </div>
        </div>

        <form className="rounded-xl border p-3" onSubmit={onSubmit}>
          <div className="grid gap-3 sm:grid-cols-[36px_1fr]">
            <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
              {currentUserInitials}
            </div>

            <div className="min-w-0 space-y-3">
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                disabled={disabled || isSaving}
                className="min-h-[72px] resize-y text-sm"
                maxLength={5000}
                placeholder="Escribe una nueva observación..."
              />

              {selectedFiles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file) => {
                    const visual = getAttachmentVisual({
                      file_name: file.name,
                      mime_type: file.type,
                    });
                    const AttachmentIcon = visual.icon;

                    return (
                      <div
                        key={`${file.name}-${file.size}`}
                        className="inline-flex max-w-full items-center gap-2 rounded-md border px-2 py-1 text-xs"
                      >
                        <span
                          className={`flex size-6 shrink-0 items-center justify-center rounded ${visual.className}`}
                        >
                          <AttachmentIcon className="size-3.5" />
                        </span>
                        <span className="truncate">{file.name}</span>
                        <span className="shrink-0 text-muted-foreground">
                          {formatBytes(file.size)}
                        </span>
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
                  disabled={disabled || isSaving}
                  onChange={(event) => setSelectedFiles(normalizeFiles(event.target.files))}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || isSaving}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="size-4" />
                  Adjuntar archivo
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={disabled || isSaving || comment.trim().length === 0}
                  className="sm:min-w-[170px]"
                >
                  <Send className="size-4" />
                  {isSaving ? "Guardando..." : "Agregar observación"}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Cargando observaciones...</div>
        ) : timelineItems.length === 0 ? (
          <div className="rounded-xl border p-3 text-sm text-muted-foreground">
            No hay observaciones registradas.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-[24px_1fr]">
            <div className="relative hidden sm:block">
              <span className="absolute left-1/2 top-6 bottom-6 w-px -translate-x-1/2 bg-border" />
              <div className="relative">
                {timelineItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-h-[94px] items-center justify-center"
                  >
                    <span className="size-3 rounded-full border-2 border-background bg-foreground/70 shadow-[0_0_0_2px_hsl(var(--border))]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {timelineItems.map((item, index) => {
                const authorName = getAuthorName(item);
                const itemAttachments = attachmentsByCommentId[item.id] ?? [];

                return (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-xl border bg-background p-3 shadow-xs sm:grid-cols-[40px_1fr_auto]"
                  >
                    <div
                      className={`flex size-9 items-center justify-center rounded-full text-xs font-semibold ${getAvatarClassName(index)}`}
                    >
                      {getInitials(authorName)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold leading-5">
                          {authorName}
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          <Calendar className="size-3.5" />
                          {formatCommentDate(item.created_at)}
                        </div>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-5 text-foreground/85">
                        {item.comment}
                      </p>

                      {itemAttachments.length > 0 ? (
                        <div className="mt-3 space-y-2 border-t pt-3">
                          {itemAttachments.map((attachment) => {
                            const visual = getAttachmentVisual(attachment);
                            const AttachmentIcon = visual.icon;

                            return (
                              <button
                                key={attachment.id}
                                type="button"
                                className="flex w-full items-center justify-between gap-3 rounded-lg border p-2 text-left hover:bg-muted/50"
                                onClick={() => onDownloadAttachment(attachment)}
                                disabled={downloadingAttachmentId === attachment.id}
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <span
                                    className={`flex size-7 shrink-0 items-center justify-center rounded-md ${visual.className}`}
                                  >
                                    <AttachmentIcon className="size-4" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate text-xs font-medium">
                                      {attachment.file_name}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                      {attachment.mime_type} ·{" "}
                                      {formatBytes(Number(attachment.size_bytes))}
                                    </span>
                                  </span>
                                </span>
                                <Download className="size-4 shrink-0 text-muted-foreground" />
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-start justify-end gap-2">
                      <div className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                        <Eye className="size-3.5" />
                        Interna
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Opciones de observación"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
