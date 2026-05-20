"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CircleCheck,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Flag,
  LoaderCircle,
  Paperclip,
  UploadCloud,
  UsersRound,
  X,
} from "lucide-react";

import { requestAttachmentsApi } from "@/api/requests/request-attachments.api";
import { requestPrioritiesApi, type RequestPriorityItem } from "@/api/requests/request-priorities.api";
import { requestStatusApi } from "@/api/requests/request-status.api";
import { requestTypesApi, type RequestTypeItem } from "@/api/requests/request-types.api";
import { requestsApi } from "@/api/requests/requests.api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/auth/useAuth";
import { getErrorMessage } from "@/lib/errors/get-error-message";
import { alerts } from "@/utils/alerts/alerts";

function normalizeFiles(files: FileList | null): File[] {
  if (!files) return [];
  return Array.from(files);
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

const SELECT_PLACEHOLDER = "__select__";

type AttachmentVisualInput = {
  file_name: string;
  mime_type?: string | null;
};

function hasSelectedValue(value: string) {
  return value.trim() !== "" && value !== SELECT_PLACEHOLDER;
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

function getAttachmentVisual(file: AttachmentVisualInput) {
  const mimeType = (file.mime_type ?? "").toLowerCase();
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

export function RequestCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.roleCode === "ADMIN" || user?.roleCode === "ADMINISTRADOR";
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const [types, setTypes] = React.useState<RequestTypeItem[]>([]);
  const [priorities, setPriorities] = React.useState<RequestPriorityItem[]>([]);
  const [unassignedStatusId, setUnassignedStatusId] = React.useState("");

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [requestTypeId, setRequestTypeId] = React.useState("");
  const [priorityId, setPriorityId] = React.useState("");
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = React.useState(false);

  React.useEffect(() => {
    if (!isAdmin) {
      void (async () => {
        await alerts.error("Acceso restringido", "Solo ADMIN puede crear solicitudes.");
        router.replace("/requests?view=list");
      })();
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const [typesRes, prioritiesRes, statusRes] = await Promise.all([
          requestTypesApi.getAll(),
          requestPrioritiesApi.getAll(),
          requestStatusApi.getAll(),
        ]);

        const activeTypes = (typesRes.items ?? []).filter((type) => type.is_active);
        const activePriorities = (prioritiesRes.items ?? []).filter((priority) => priority.is_active);
        const activeStatuses = (statusRes.items ?? []).filter((status) => status.is_active);

        setTypes(activeTypes);
        setPriorities(activePriorities);

        const unassigned = activeStatuses.find((status) => status.code === "UNASSIGNED");
        if (!unassigned?.id) {
          await alerts.error(
            "Configuracion incompleta",
            "No existe el estado inicial UNASSIGNED en el sistema."
          );
        }
        setUnassignedStatusId(unassigned?.id ?? "");
      } catch (error: unknown) {
        await alerts.error("No se pudo cargar el formulario", getErrorMessage(error) || "Intenta nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [isAdmin, router]);

  async function uploadAllAttachments(requestId: string) {
    if (attachments.length === 0) return { ok: true, failed: [] as string[] };

    setIsUploading(true);
    const failed: string[] = [];

    for (const file of attachments) {
      try {
        await requestAttachmentsApi.upload({
          requestId,
          title: title.trim() || "request",
          file,
        });
      } catch {
        failed.push(file.name);
      }
    }

    setIsUploading(false);
    return { ok: failed.length === 0, failed };
  }

  function onSelectFiles(files: FileList | null) {
    setAttachments(normalizeFiles(files));
  }

  function handleFileDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingFiles(false);
    if (isBusy) return;

    const files = normalizeFiles(event.dataTransfer.files);
    if (files.length > 0) {
      setAttachments(files);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isAdmin) return;

    if (!title.trim()) {
      await alerts.error("Falta titulo", "Debes ingresar un titulo.");
      return;
    }
    if (!description.trim()) {
      await alerts.error("Falta descripcion", "Debes ingresar una descripcion.");
      return;
    }
    if (!hasSelectedValue(requestTypeId)) {
      await alerts.error("Falta grupo", "Debes seleccionar un grupo.");
      return;
    }
    if (!hasSelectedValue(priorityId)) {
      await alerts.error("Falta prioridad", "Debes seleccionar una prioridad.");
      return;
    }
    if (!unassignedStatusId) {
      await alerts.error("No se pudo determinar el estado inicial", "No existe el estado UNASSIGNED en el sistema.");
      return;
    }

    const ok = await alerts.confirm("Crear solicitud", "Confirmas crear esta solicitud?");
    if (!ok) return;

    try {
      setIsSubmitting(true);

      const res = await requestsApi.createRequest({
        title: title.trim(),
        description: description.trim(),
        statusId: unassignedStatusId,
        requestTypeId,
        priorityId,
      });

      if (!res?.success || !res?.data?.id) {
        throw new Error("No se pudo crear la solicitud.");
      }

      const uploadResult = await uploadAllAttachments(res.data.id);

      if (!uploadResult.ok) {
        await alerts.error(
          "Solicitud creada, pero adjuntos incompletos",
          `Se creo la solicitud, pero fallo la subida de: ${uploadResult.failed.join(", ")}`
        );
      } else {
        await alerts.toastSuccess("Solicitud creada");
      }

      router.push("/requests?view=list");
      router.refresh();
    } catch (error: unknown) {
      await alerts.error("No se pudo crear la solicitud", getErrorMessage(error) || "Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  }

  if (!isAdmin) return null;

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Cargando formulario...</div>;
  }

  const isBusy = isSubmitting || isUploading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Crear Solicitud</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Completa la informacion para crear una nueva solicitud.
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <Card className="rounded-xl p-5">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 size-5 text-blue-600" />
            <div>
              <h2 className="text-base font-semibold">Informacion de la solicitud</h2>
              <p className="mt-1 text-sm text-muted-foreground">Ingresa los detalles generales de la solicitud.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Titulo de la solicitud <span className="text-destructive">*</span>
              </label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej: RUC XXXXXXXXXX-X investigar banda XXXXX"
                disabled={isBusy}
                className="h-10 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Descripcion <span className="text-destructive">*</span>
              </label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descripción de la solicitud..."
                className="min-h-28 rounded-lg"
                disabled={isBusy}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-[280px_280px]">
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Grupo <span className="text-destructive">*</span>
                </label>
                <Select value={requestTypeId || SELECT_PLACEHOLDER} onValueChange={setRequestTypeId} disabled={isBusy}>
                  <SelectTrigger className="h-10 w-full rounded-lg">
                    <span className="flex min-w-0 items-center gap-2 text-left">
                      <UsersRound className="size-4 shrink-0 text-muted-foreground" />
                      <SelectValue />
                    </span>
                  </SelectTrigger>
                  <SelectContent position="popper" align="start" className="w-[var(--radix-select-trigger-width)]">
                    <SelectItem value={SELECT_PLACEHOLDER}>
                      Seleccionar
                    </SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Prioridad <span className="text-destructive">*</span>
                </label>
                <Select value={priorityId || SELECT_PLACEHOLDER} onValueChange={setPriorityId} disabled={isBusy}>
                  <SelectTrigger className="h-10 w-full rounded-lg">
                    <span className="flex min-w-0 items-center gap-2 text-left">
                      <Flag className="size-4 shrink-0 text-muted-foreground" />
                      <SelectValue />
                    </span>
                  </SelectTrigger>
                  <SelectContent position="popper" align="start" className="w-[var(--radix-select-trigger-width)]">
                    <SelectItem value={SELECT_PLACEHOLDER}>
                      Seleccionar
                    </SelectItem>
                    {priorities
                      .slice()
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((priority) => (
                        <SelectItem key={priority.id} value={priority.id}>
                          {priority.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Paperclip className="mt-0.5 size-5 text-blue-600" />
            <div>
              <h2 className="text-base font-semibold">Adjuntar archivos (opcional)</h2>
              <p className="mt-1 text-sm text-muted-foreground">Puedes subir archivos que ayuden a entender la solicitud.</p>
            </div>
          </div>

          <label
            className={`flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
              isDraggingFiles ? "border-blue-500 bg-blue-50" : "border-border bg-background"
            }`}
            onDragEnter={(event) => {
              event.preventDefault();
              if (!isBusy) setIsDraggingFiles(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!isBusy) event.dataTransfer.dropEffect = "copy";
            }}
            onDragLeave={() => setIsDraggingFiles(false)}
            onDrop={handleFileDrop}
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
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <UploadCloud className="size-5" />
              </div>
              <div>
                <div className="text-sm">
                  Arrastra y suelta archivos aqui o{" "}
                  <span className="font-medium underline-offset-2 hover:underline">
                    selecciona
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Se subiran al guardar cambios.
                </div>
              </div>
            </div>

            <span className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium shadow-xs">
              <Paperclip className="size-4" />
              Seleccionar archivos
            </span>
          </label>

          {attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((file) => {
                const visual = getAttachmentVisual({
                  file_name: file.name,
                  mime_type: file.type,
                });
                const AttachmentIcon = visual.icon;

                return (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border p-2 text-left"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-md ${visual.className}`}
                      >
                        <AttachmentIcon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium">
                          {file.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {file.type || "application/octet-stream"} · {formatBytes(file.size)}
                        </span>
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground"
                      disabled={isBusy}
                      aria-label={`Quitar ${file.name}`}
                      onClick={() => {
                        setAttachments((current) => removeSelectedFile(current, file));
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : null}
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" className="h-10 gap-2 rounded-lg" onClick={() => router.back()} disabled={isBusy}>
            <X className="size-4" />
            Cancelar
          </Button>

          <Button type="submit" disabled={isBusy} className="h-10 gap-2 rounded-lg bg-foreground px-5 text-background hover:bg-foreground/90">
            {isBusy ? <LoaderCircle className="size-4 animate-spin" /> : <CircleCheck className="size-4" />}
            {isSubmitting ? "Creando..." : isUploading ? "Subiendo archivos..." : "Crear solicitud"}
          </Button>
        </div>
      </form>
    </div>
  );
}
