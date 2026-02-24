"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { alerts } from "@/utils/alerts/alerts";

import { requestsApi } from "@/api/requests/requests.api";
import { requestTypesApi, type RequestTypeItem } from "@/api/requests/request-types.api";
import { requestPrioritiesApi, type RequestPriorityItem } from "@/api/requests/request-priorities.api";
import { requestStatusApi } from "@/api/requests/request-status.api";
import type { RequestStatus } from "@/types/requests/request-status.types";

import { requestAttachmentsApi } from "@/api/requests/request-attachments.api";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

function normalizeFiles(files: FileList | null): File[] {
  if (!files) return [];
  return Array.from(files);
}

export function RequestCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.roleCode === "ADMIN";

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const [types, setTypes] = React.useState<RequestTypeItem[]>([]);
  const [priorities, setPriorities] = React.useState<RequestPriorityItem[]>([]);
  const [statuses, setStatuses] = React.useState<RequestStatus[]>([]);
  const [unassignedStatusId, setUnassignedStatusId] = React.useState<string>("");

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [requestTypeId, setRequestTypeId] = React.useState("");
  const [priorityId, setPriorityId] = React.useState("");

  // ✅ Adjuntos (1 o varios)
  const [attachments, setAttachments] = React.useState<File[]>([]);

  React.useEffect(() => {
    if (!isAdmin) {
      void (async () => {
        await alerts.error("Acceso restringido", "Solo ADMIN puede crear solicitudes.");
        router.replace("/requests?view=board");
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

        const activeTypes = (typesRes.items ?? []).filter((t) => t.is_active);
        const activePriorities = (prioritiesRes.items ?? []).filter((p) => p.is_active);
        const activeStatuses = (statusRes.items ?? []).filter((s) => s.is_active);

        setTypes(activeTypes);
        setPriorities(activePriorities);
        setStatuses(activeStatuses);

        const unassigned = activeStatuses.find((s) => s.code === "UNASSIGNED");
        if (!unassigned?.id) {
          await alerts.error(
            "Configuración incompleta",
            "No existe el estado inicial UNASSIGNED (Sin Asignar)."
          );
        }
        setUnassignedStatusId(unassigned?.id ?? "");
      } catch (e: any) {
        await alerts.error(
          "No se pudo cargar el formulario",
          e?.message ?? "Intenta nuevamente."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [isAdmin, router]);

  const uploadAllAttachments = async (requestId: string) => {
    if (attachments.length === 0) return { ok: true, failed: [] as string[] };

    setIsUploading(true);

    const failed: string[] = [];

    // ✅ Subimos en secuencia para mejor control y mensajes
    for (const file of attachments) {
      try {
        await requestAttachmentsApi.upload({
          requestId,
          title: title.trim() || "request",
          file,
        });
      } catch (e: any) {
        failed.push(file.name);
      }
    }

    setIsUploading(false);

    return { ok: failed.length === 0, failed };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!title.trim()) {
      await alerts.error("Falta título", "Debes ingresar un título.");
      return;
    }
    if (!description.trim()) {
      await alerts.error("Falta descripción", "Debes ingresar una descripción.");
      return;
    }
    if (!requestTypeId) {
      await alerts.error("Falta tipo", "Debes seleccionar un tipo de solicitud.");
      return;
    }
    if (!priorityId) {
      await alerts.error("Falta prioridad", "Debes seleccionar una prioridad.");
      return;
    }
    if (!unassignedStatusId) {
      await alerts.error(
        "No se pudo determinar el estado inicial",
        "No existe el estado UNASSIGNED en el sistema."
      );
      return;
    }

    const ok = await alerts.confirm("Crear solicitud", "¿Confirmas crear esta solicitud?");
    if (!ok) return;

    try {
      setIsSubmitting(true);

      // ✅ Backend espera camelCase: statusId, requestTypeId, priorityId
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

      const createdId: string = res.data.id;

      // ✅ Si hay adjuntos, los subimos inmediatamente
      const uploadResult = await uploadAllAttachments(createdId);

      if (!uploadResult.ok) {
        await alerts.error(
          "Solicitud creada, pero adjuntos incompletos",
          `Se creó la solicitud, pero falló la subida de: ${uploadResult.failed.join(", ")}`
        );
      } else {
        await alerts.toastSuccess("Solicitud creada");
      }

      // ✅ redirige al tablero
      router.push("/requests?view=board");
      router.refresh();
    } catch (e: any) {
      await alerts.error("No se pudo crear la solicitud", e?.message ?? "Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  if (!isAdmin) return null;

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Cargando formulario...</div>;
  }

  const isBusy = isSubmitting || isUploading;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Crear Solicitud</h1>
          <p className="text-sm text-muted-foreground">
            La solicitud se creará en estado <b>Sin Asignar</b>.
          </p>
        </div>

        <Button variant="outline" onClick={() => router.back()} disabled={isBusy}>
          Volver
        </Button>
      </div>

      <Card className="p-4 rounded-2xl">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Solicitud A - análisis inicial"
              disabled={isBusy}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la solicitud..."
              className="min-h-[120px]"
              disabled={isBusy}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={requestTypeId}
                onValueChange={setRequestTypeId}
                disabled={isBusy}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Prioridad</label>
              <Select value={priorityId} onValueChange={setPriorityId} disabled={isBusy}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {priorities
                    .slice()
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ✅ Adjuntos */}
          <div>
            <label className="text-sm font-medium">Adjuntar archivos (opcional)</label>
            <Input
              type="file"
              multiple
              disabled={isBusy}
              onChange={(e) => setAttachments(normalizeFiles(e.target.files))}
            />
            {attachments.length > 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {attachments.length} archivo(s) seleccionado(s):{" "}
                <span className="font-medium">
                  {attachments.map((f) => f.name).join(", ")}
                </span>
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Puedes subir archivos al crear o después en el detalle de la solicitud.
              </p>
            )}
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isBusy}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={isBusy}>
              {isSubmitting ? "Creando..." : isUploading ? "Subiendo archivos..." : "Crear"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}