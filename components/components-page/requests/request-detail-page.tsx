"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  Circle,
  CloudUpload,
  Download,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  MailCheck,
  Paperclip,
  RotateCcw,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { useAuth } from "@/hooks/auth/useAuth";
import { alerts } from "@/utils/alerts/alerts";
import { getErrorMessage } from "@/lib/errors/get-error-message";

import { requestsApi } from "@/api/requests/requests.api";
import { boardApi } from "@/api/requests/board.api";
import {
  requestAssignmentsApi,
  type RequestAssignmentItem,
} from "@/api/requests/request-assignments.api";
import {
  requestAttachmentsApi,
  type RequestAttachmentItem,
} from "@/api/requests/request-attachments.api";
import { usersApi, type UserItem } from "@/api/users/users.api";
import { requestStatusApi } from "@/api/requests/request-status.api";

import type { RequestItem } from "@/types/requests/request.types";
import type { RequestStatus } from "@/types/requests/request-status.types";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { RequestObservationsPanel } from "./request-observations-panel";
import { RequestStatusHistoryPanel } from "./request-status-history-panel";
import { StatusBadge } from "./badge/request-status-badge";
import { PriorityBadge } from "./badge/request-priority-badge";

function findPrevNext(statuses: RequestStatus[], currentId: string) {
  const sorted = [...statuses].sort((a, b) => a.sort_order - b.sort_order);
  const idx = sorted.findIndex((s) => s.id === currentId);
  return {
    current: idx >= 0 ? sorted[idx] : null,
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null,
  };
}

function pickCurrentAssigneeId(assignments: RequestAssignmentItem[]): string | null {
  const active = assignments.filter(
    (a) => a.is_active && (a.unassigned_at === null || a.unassigned_at === undefined)
  );

  if (active.length === 0) return null;

  active.sort(
    (a, b) =>
      new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()
  );

  return active[0].assigned_to ?? null;
}

function normalizeFiles(files: FileList | null): File[] {
  if (!files) return [];
  return Array.from(files);
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

function formatDetailDate(value?: string | null) {
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

type AttachmentVisualInput = {
  file_name: string;
  mime_type?: string | null;
};

function getAttachmentVisual(file: AttachmentVisualInput) {
  const mimeType = (file.mime_type ?? "").toLowerCase();
  const fileName = file.file_name.toLowerCase();

  if (mimeType.startsWith("image/")) {
    return {
      icon: FileImage,
      className: "bg-blue-50 text-blue-700",
    };
  }

  if (mimeType.includes("pdf") || fileName.endsWith(".pdf")) {
    return {
      icon: FileText,
      className: "bg-red-50 text-red-700",
    };
  }

  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".csv")
  ) {
    return {
      icon: FileSpreadsheet,
      className: "bg-emerald-50 text-emerald-700",
    };
  }

  if (
    mimeType.includes("zip") ||
    mimeType.includes("compressed") ||
    fileName.endsWith(".zip") ||
    fileName.endsWith(".rar") ||
    fileName.endsWith(".7z")
  ) {
    return {
      icon: FileArchive,
      className: "bg-amber-50 text-amber-700",
    };
  }

  if (mimeType.startsWith("text/") || fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
    return {
      icon: FileText,
      className: "bg-indigo-50 text-indigo-700",
    };
  }

  return {
    icon: File,
    className: "bg-muted text-muted-foreground",
  };
}

function removeSelectedFile(files: File[], fileToRemove: File) {
  return files.filter(
    (file) =>
      !(
        file.name === fileToRemove.name &&
        file.size === fileToRemove.size &&
        file.lastModified === fileToRemove.lastModified
      )
  );
}

export function RequestDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const requestId = params.id;

  const { user } = useAuth();
  const canAssignRequests = Boolean(user?.capabilities?.canAssignRequests);
  const canDeleteRequests = Boolean(user?.capabilities?.canDeleteRequests);
  const canChangeAnyRequestStatus = Boolean(user?.capabilities?.canChangeAnyRequestStatus);
  const canChangeAssignedRequestStatus = Boolean(user?.capabilities?.canChangeAssignedRequestStatus);
  const canAttachFilesToAnyRequest = Boolean(user?.capabilities?.canAttachFilesToAnyRequest);
  const canAttachFilesToAssignedRequest = Boolean(user?.capabilities?.canAttachFilesToAssignedRequest);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSavingChanges, setIsSavingChanges] = React.useState(false);
  const [isUpdatingResponse, setIsUpdatingResponse] = React.useState(false);

  const [request, setRequest] = React.useState<RequestItem | null>(null);
  const [statuses, setStatuses] = React.useState<RequestStatus[]>([]);
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [assignableUsers, setAssignableUsers] = React.useState<UserItem[]>([]);
  const [assigneeId, setAssigneeId] = React.useState<string | null>(null);
  const [attachments, setAttachments] = React.useState<RequestAttachmentItem[]>([]);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = React.useState<string | null>(null);
  const [statusHistoryRefreshKey, setStatusHistoryRefreshKey] = React.useState(0);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [selectedAssignee, setSelectedAssignee] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const assigneeUser = React.useMemo(
    () => users.find((u) => u.id === assigneeId) ?? null,
    [users, assigneeId]
  );

  const canEdit = React.useMemo(() => {
    if (!user || !request) return false;
    if (canChangeAnyRequestStatus) return true;
    return Boolean(canChangeAssignedRequestStatus && assigneeId && assigneeId === user.id);
  }, [user, canChangeAnyRequestStatus, canChangeAssignedRequestStatus, assigneeId, request]);

  const canAttachRequestFiles = React.useMemo(() => {
    if (!user || !request) return false;
    if (canAttachFilesToAnyRequest) return true;
    return Boolean(canAttachFilesToAssignedRequest && assigneeId && assigneeId === user.id);
  }, [user, request, canAttachFilesToAnyRequest, canAttachFilesToAssignedRequest, assigneeId]);

  const loadAssignments = React.useCallback(async () => {
    const asgRes = await requestAssignmentsApi.listByRequestId(requestId);
    const current = pickCurrentAssigneeId(asgRes.data ?? []);
    setAssigneeId(current);
  }, [requestId]);

  const loadAttachments = React.useCallback(async () => {
    const res = await requestAttachmentsApi.listByRequestId(requestId);
    const list = (res.data ?? [])
      .filter((attachment) => attachment.is_active !== false)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    setAttachments(list);
  }, [requestId]);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqRes, stRes, usersRes, assignableUsersRes] = await Promise.all([
        requestsApi.getById(requestId),
        requestStatusApi.getAll(),
        usersApi.listUsers(),
        canAssignRequests ? usersApi.listAssignableUsers({ pageSize: 100 }) : Promise.resolve({ items: [] }),
      ]);

      const req = reqRes.data;
      setRequest(req);
      setTitle(req.title ?? "");
      setDescription(req.description ?? "");

      const activeStatuses = (stRes.items ?? [])
        .filter((s) => s.is_active)
        .sort((a, b) => a.sort_order - b.sort_order);
      setStatuses(activeStatuses);

      setUsers((usersRes.items ?? []).filter((u) => u.is_active));
      setAssignableUsers((assignableUsersRes.items ?? []).filter((u) => u.is_active));

      await Promise.all([loadAssignments(), loadAttachments()]);
    } catch (error: unknown) {
      await alerts.error(
        "No se pudo cargar el detalle",
        getErrorMessage(error)
      );
      setRequest(null);
    } finally {
      setIsLoading(false);
    }
  }, [requestId, canAssignRequests, loadAssignments, loadAttachments]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onAssign = async () => {
    if (!canAssignRequests || !request) return;

    if (!selectedAssignee) {
      await alerts.error("Asignación requerida", "Selecciona un usuario para asignar.");
      return;
    }

    const ok = await alerts.confirm("Asignar solicitud", "¿Confirmas asignar esta solicitud?");
    if (!ok) return;

    try {
      await boardApi.assignRequest(request.id, selectedAssignee);
      await loadAssignments();
      setSelectedAssignee("");
      setStatusHistoryRefreshKey((current) => current + 1);
      await alerts.toastSuccess("Solicitud asignada");
    } catch (error: unknown) {
      await alerts.error("No se pudo asignar", getErrorMessage(error));
    }
  };

  const uploadSelectedFiles = async (requestToUpdate: RequestItem) => {
    if (selectedFiles.length === 0) return [];

    const failed: string[] = [];

    for (const file of selectedFiles) {
      try {
        await requestAttachmentsApi.upload({
          requestId: requestToUpdate.id,
          title: title.trim() || requestToUpdate.title || "request",
          file,
        });
      } catch {
        failed.push(file.name);
      }
    }

    return failed;
  };

  const onSave = async () => {
    if (!request) return;

    if (!canEdit) {
      await alerts.error("Acción no permitida", "No tienes permisos para editar esta solicitud.");
      return;
    }

    const ok = await alerts.confirm("Guardar cambios", "¿Deseas guardar los cambios?");
    if (!ok) return;

    try {
      setIsSavingChanges(true);
      await requestsApi.updateRequest(request.id, { title, description });
      setRequest({ ...request, title, description });

      const failedUploads = await uploadSelectedFiles(request);

      if (selectedFiles.length > 0) {
        await loadAttachments();
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }

      if (failedUploads.length > 0) {
        await alerts.error(
          "Cambios guardados, pero adjuntos incompletos",
          `No se pudieron subir: ${failedUploads.join(", ")}`
        );
      } else {
        await alerts.toastSuccess("Cambios guardados");
      }
    } catch (error: unknown) {
      await alerts.error("No se pudo guardar", getErrorMessage(error));
    } finally {
      setIsSavingChanges(false);
    }
  };

  const onDownloadAttachment = async (attachment: RequestAttachmentItem) => {
    try {
      setDownloadingAttachmentId(attachment.id);

      const { blob, filename } = await requestAttachmentsApi.download(attachment.id);
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

  const onDeleteAttachment = async (attachment: RequestAttachmentItem) => {
    if (!canDeleteRequests) {
      await alerts.error("Acción no permitida", "No tienes permisos para eliminar adjuntos.");
      return;
    }

    const ok = await alerts.confirm(
      "Eliminar adjunto",
      `¿Desactivar "${attachment.file_name}"?`
    );
    if (!ok) return;

    try {
      await requestAttachmentsApi.delete(attachment.id);
      await alerts.toastSuccess("Adjunto eliminado");
      await loadAttachments();
    } catch (error: unknown) {
      await alerts.error("No se pudo eliminar el adjunto", getErrorMessage(error));
      await loadAttachments();
    }
  };

  const onSelectFiles = (files: FileList | null) => {
    setSelectedFiles(normalizeFiles(files));
  };

  const onDropFiles = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (!canAttachRequestFiles || isBusy) return;
    setSelectedFiles(normalizeFiles(event.dataTransfer.files));
  };

  const onChangeStatus = async (toStatusId: string) => {
    if (!request) return;

    if (!canEdit) {
      await alerts.error("Acción no permitida", "No tienes permisos para cambiar el estado.");
      return;
    }

    const { prev, next, current } = findPrevNext(statuses, request.status_id);

    const oneStep = (prev && prev.id === toStatusId) || (next && next.id === toStatusId);
    if (!oneStep) {
      await alerts.error("Movimiento no permitido", "Solo puedes avanzar o retroceder 1 estado.");
      return;
    }

    if (current?.code === "UNASSIGNED" && !assigneeId) {
      await alerts.error(
        "No se puede avanzar",
        "Debes asignar un usuario antes de avanzar el estado."
      );
      return;
    }

    const toName = statuses.find((s) => s.id === toStatusId)?.name ?? "nuevo estado";
    const ok = await alerts.confirm("Confirmar cambio de estado", `¿Mover a "${toName}"?`);
    if (!ok) return;

    try {
      await boardApi.changeStatus(request.id, toStatusId);

      const reqRes = await requestsApi.getById(request.id);
      setRequest(reqRes.data);
      setStatusHistoryRefreshKey((current) => current + 1);

      await alerts.toastSuccess("Estado actualizado");
    } catch (error: unknown) {
      await alerts.error("No se pudo cambiar el estado", getErrorMessage(error));
    }
  };

  const onMarkResponded = async () => {
    if (!request) return;
    const recipient = request.response_sent_to || request.requester_email || request.creator_email || "el destinatario";
    const ok = await alerts.confirm(
      "Confirmar envío",
      `Confirma que la respuesta final fue enviada externamente a ${recipient}.`
    );
    if (!ok) return;

    try {
      setIsUpdatingResponse(true);
      await boardApi.markFinalResponseSent(request.id);
      const reqRes = await requestsApi.getById(request.id);
      setRequest(reqRes.data);
      await alerts.toastSuccess("Envío confirmado");
    } catch (error: unknown) {
      await alerts.error("No se pudo marcar la respuesta", getErrorMessage(error));
    } finally {
      setIsUpdatingResponse(false);
    }
  };

  const onRevertResponse = async () => {
    if (!request) return;
    const ok = await alerts.confirm("Revertir respuesta", "La solicitud volvera a quedar pendiente de respuesta.");
    if (!ok) return;

    try {
      setIsUpdatingResponse(true);
      await boardApi.revertFinalResponse(request.id);
      const reqRes = await requestsApi.getById(request.id);
      setRequest(reqRes.data);
      await alerts.toastSuccess("Respuesta revertida a pendiente");
    } catch (error: unknown) {
      await alerts.error("No se pudo revertir la respuesta", getErrorMessage(error));
    } finally {
      setIsUpdatingResponse(false);
    }
  };

  // ✅ NUEVO: eliminar solicitud (solo ADMIN)
  const onDelete = async () => {
    if (!canDeleteRequests || !request) return;

    const ok = await alerts.confirm(
      "Eliminar solicitud",
      `Esta acción desactivará la solicitud.\n¿Eliminar "${request.title}"?`
    );
    if (!ok) return;

    try {
      setIsDeleting(true);

      // 1) intentamos delete (soft delete en backend)
      await requestsApi.deleteRequest(request.id);

      // 2) verificamos estado real en backend
      const check = await requestsApi.getById(request.id);
      const isInactive = check?.data?.is_active === false;

      if (!isInactive) {
        throw new Error("No se pudo confirmar la desactivación de la solicitud.");
      }

      await alerts.toastSuccess("Solicitud desactivada");

      router.push("/requests?view=board");
      router.refresh();
    } catch (error: unknown) {
      await alerts.error(
        "No se pudo eliminar la solicitud",
        getErrorMessage(error)
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Cargando...</div>;
  if (!request) return <div className="p-4 text-sm text-muted-foreground">No se encontró la solicitud.</div>;

  const { current, prev, next } = findPrevNext(statuses, request.status_id);
  const isBusy = isDeleting || isSavingChanges || isUpdatingResponse;
  const requesterFullName = [request.requester_first_name, request.requester_last_name].filter(Boolean).join(" ");
  const hasRequesterData = Boolean(request.requester_id || requesterFullName || request.requester_email || request.requester_phone);
  const hasPublicChannel = Boolean(request.requester_id && request.tracking_code);
  const prosecutorOfficeLabel = request.prosecutor_office_name ?? "No registrada";
  const regionLabel = request.prosecutor_office_region_name ?? "No registrada";

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Detalle de Solicitud</h1>
          <p className="text-sm text-muted-foreground">ID: {request.id}</p>
        </div>

        <div className="flex items-center gap-2">
          {canDeleteRequests ? (
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          ) : null}

          <Button variant="outline" onClick={() => router.back()} disabled={isDeleting}>
            Volver
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card className="p-4 rounded-2xl space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 w-full space-y-2">
              <label className="text-sm font-medium">Título de la solicitud</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canEdit || isBusy}
                className="font-medium"
              />
            </div>

            <div className="flex shrink-0 gap-2 pb-0.5">
              <StatusBadge value={current?.name ?? request.status_name ?? "—"} />
              {request.priority_name ? <PriorityBadge value={request.priority_name} /> : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!canEdit || isBusy}
            className="min-h-[112px]"
            placeholder="Descripción…"
          />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Adjuntar archivos (opcional)
            </label>
            {canAttachRequestFiles ? (
              <label
                className="flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between"
                onDragOver={(event) => event.preventDefault()}
                onDrop={onDropFiles}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="sr-only"
                  disabled={isBusy}
                  onChange={(event) => onSelectFiles(event.target.files)}
                />

                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <CloudUpload className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm">
                      Arrastra y suelta archivos aquí o{" "}
                      <span className="font-medium underline-offset-2 hover:underline">
                        selecciona
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Se subirán al guardar cambios.
                    </div>
                  </div>
                </div>

                <span className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium shadow-xs">
                  <Paperclip className="size-4" />
                  Seleccionar archivos
                </span>
              </label>
            ) : (
              <p className="text-xs text-muted-foreground">
                Solo el usuario asignado o un usuario autorizado puede adjuntar documentos a la solicitud.
              </p>
            )}
            {selectedFiles.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedFiles.map((file) => {
                  const attachmentVisual = getAttachmentVisual({
                    file_name: file.name,
                    mime_type: file.type,
                  });
                  const AttachmentIcon = attachmentVisual.icon;

                  return (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="inline-flex max-w-full items-center gap-2 rounded-md border bg-background px-2 py-1 text-xs shadow-xs"
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded ${attachmentVisual.className}`}
                      >
                        <AttachmentIcon className="size-3.5" />
                      </span>
                      <span className="max-w-[260px] truncate font-medium">
                        {file.name}
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {formatBytes(file.size)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="-mr-1"
                        aria-label={`Quitar ${file.name}`}
                        onClick={() => {
                          setSelectedFiles((currentFiles) =>
                            removeSelectedFile(currentFiles, file)
                          );
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        disabled={isBusy}
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {attachments.length > 0 ? (
              <div className="space-y-2 pt-1">
                {attachments.map((attachment) => {
                  const attachmentVisual = getAttachmentVisual(attachment);
                  const AttachmentIcon = attachmentVisual.icon;

                  return (
                  <div
                    key={attachment.id}
                    className="grid gap-3 rounded-xl border bg-background p-3 shadow-xs sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-md ${attachmentVisual.className}`}
                      >
                        <AttachmentIcon className="size-5" />
                      </div>
                      <div className="min-w-0">
                      <div className="truncate text-sm font-semibold leading-5">
                        {attachment.file_name}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {attachment.mime_type} · {formatBytes(Number(attachment.size_bytes))} ·{" "}
                        {formatDetailDate(attachment.created_at)}
                      </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadAttachment(attachment)}
                        disabled={downloadingAttachmentId === attachment.id}
                      >
                        <Download className="size-4" />
                        {downloadingAttachmentId === attachment.id ? "Descargando..." : "Descargar"}
                      </Button>

                      {canDeleteRequests ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDeleteAttachment(attachment)}
                          disabled={isBusy}
                          aria-label={`Eliminar ${attachment.file_name}`}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
                No hay adjuntos.
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              Tipo: <b>{request.type_name ?? "—"}</b>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={load} disabled={isBusy}>
                Recargar
              </Button>
              <Button onClick={onSave} disabled={!canEdit || isBusy}>
                {isSavingChanges ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </Card>


          {hasPublicChannel ? (
            <RequestObservationsPanel requestId={request.id} disabled={isDeleting} />
          ) : null}
          <RequestStatusHistoryPanel
            requestId={request.id}
            refreshKey={statusHistoryRefreshKey}
            requesterName={requesterFullName || undefined}
          />
        </div>
        <Card className="p-4 rounded-2xl space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <UserRound className="size-4" />
              Datos del solicitante
            </div>

            {hasRequesterData ? (
              <div className="grid gap-3 rounded-xl border bg-muted/20 p-3 text-sm">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Nombre</div>
                  <div className="font-semibold">{requesterFullName || "No registrado"}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Email</div>
                  <div className="break-all font-medium">{request.requester_email ?? "No registrado"}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Telefono</div>
                  <div className="font-medium">{request.requester_phone ?? "No registrado"}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Fiscalia</div>
                  <div className="font-medium">{prosecutorOfficeLabel}</div>
                  <div className="text-xs text-muted-foreground">{regionLabel}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Codigo de seguimiento</div>
                  <div className="font-semibold text-blue-700">{request.tracking_code ?? "No generado"}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
                Solicitud interna sin solicitante externo asociado.
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MailCheck className="size-4" />
              Respuesta final
            </div>
            <div className="rounded-xl border bg-muted/20 p-3 text-sm">
              <div className="font-semibold">
                {request.response_state === "SENT"
                  ? request.response_delivery_channel === "SYSTEM_EMAIL"
                    ? "Enviada por la plataforma"
                    : "Respondida externamente"
                  : request.response_state === "PENDING"
                    ? "Pendiente de respuesta"
                    : request.response_state === "UNCONFIRMED"
                      ? "Sin confirmar"
                      : request.response_state === "FAILED"
                        ? "Error de envio"
                        : request.response_state === "MISSING_RECIPIENT"
                          ? "Falta destinatario"
                          : "No aplica"}
              </div>
              <div className="mt-1 break-all text-xs text-muted-foreground">
                Destinatario: {request.response_sent_to || request.requester_email || request.creator_email || "No disponible"}
              </div>
              {request.response_sent_at ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  Confirmada: {formatDetailDate(request.response_sent_at)}
                </div>
              ) : null}
            </div>

            {request.is_terminal && ["PENDING", "UNCONFIRMED"].includes(request.response_state ?? "") ? (
              <Button className="w-full" onClick={onMarkResponded} disabled={!canEdit || isBusy}>
                <MailCheck className="mr-2 size-4" />
                Confirmar envío
              </Button>
            ) : null}
            {request.response_state === "SENT" ? (
              <Button variant="outline" className="w-full" onClick={onRevertResponse} disabled={!canEdit || isBusy}>
                <RotateCcw className="mr-2 size-4" />
                Revertir a pendiente
              </Button>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <UserRound className="size-4" />
              Asignación
            </div>

            <div className="space-y-1 text-sm">
              <div className="text-xs font-medium text-muted-foreground">Asignado a</div>
              <div className="font-semibold">
                {assigneeUser ? assigneeUser.full_name : "Sin asignar"}
              </div>
              {assigneeUser?.email ? (
                <div className="text-xs text-muted-foreground">{assigneeUser.email}</div>
              ) : null}
            </div>

            {canAssignRequests ? (
              <div className="space-y-2">
                <Select
                  value={selectedAssignee}
                  onValueChange={setSelectedAssignee}
                  disabled={isBusy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cambiar asignación" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="w-full"
                  onClick={onAssign}
                  disabled={!selectedAssignee || isBusy}
                >
                  Asignar
                </Button>
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-semibold">Estado actual</div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Circle className="size-3 fill-amber-400 text-amber-400" />
              {current?.name ?? request.status_name ?? "Sin estado"}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!prev || !canEdit || isBusy}
                onClick={() => prev && onChangeStatus(prev.id)}
              >
                Retroceder
              </Button>

              <Button
                className="flex-1"
                disabled={!next || !canEdit || isBusy}
                onClick={() => next && onChangeStatus(next.id)}
              >
                Avanzar
              </Button>
            </div>

            {!assigneeId && current?.code === "UNASSIGNED" ? (
              <p className="text-xs text-muted-foreground">
                Para avanzar desde “Sin Asignar” debes asignar un usuario.
              </p>
            ) : null}
          </div>

          <Separator />

          <div className="rounded-xl border p-3">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <CalendarDays className="mt-0.5 size-4 text-blue-600" />
              <div>
                <div className="font-semibold text-foreground">Creada el</div>
                <div>{formatDetailDate(request.created_at)}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
