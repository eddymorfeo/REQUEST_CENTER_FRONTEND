"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/auth/useAuth";
import { alerts } from "@/utils/alerts/alerts";

import { requestsApi } from "@/api/requests/requests.api";
import { boardApi } from "@/api/requests/board.api";
import { requestAssignmentsApi } from "@/api/requests/request-assignments.api";
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
import { Badge } from "@/components/ui/badge";

function findPrevNext(statuses: RequestStatus[], currentId: string) {
  const sorted = [...statuses].sort((a, b) => a.sort_order - b.sort_order);
  const idx = sorted.findIndex((s) => s.id === currentId);
  return {
    current: idx >= 0 ? sorted[idx] : null,
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null,
  };
}

type AssignmentItem = {
  id: string;
  request_id: string;
  assigned_to: string | null;
  assigned_by: string;
  assigned_at: string;
  unassigned_at: string | null;
  note: string | null;
  is_active: boolean;
};

function pickCurrentAssigneeId(assignments: AssignmentItem[]): string | null {
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

export function RequestDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const requestId = params.id;

  const { user } = useAuth();
  const isAdmin = user?.roleCode === "ADMIN";

  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [request, setRequest] = React.useState<RequestItem | null>(null);
  const [statuses, setStatuses] = React.useState<RequestStatus[]>([]);
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [assigneeId, setAssigneeId] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [selectedAssignee, setSelectedAssignee] = React.useState<string>("");

  const assigneeUser = React.useMemo(
    () => users.find((u) => u.id === assigneeId) ?? null,
    [users, assigneeId]
  );

  const canEdit = React.useMemo(() => {
    if (!user || !request) return false;
    if (isAdmin) return true;
    return Boolean(assigneeId && assigneeId === user.id);
  }, [user, isAdmin, assigneeId, request]);

  const loadAssignments = React.useCallback(async () => {
    const asgRes = await requestAssignmentsApi.listByRequestId(requestId);
    const current = pickCurrentAssigneeId((asgRes.data ?? []) as AssignmentItem[]);
    setAssigneeId(current);
  }, [requestId]);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqRes, stRes, usersRes] = await Promise.all([
        requestsApi.getById(requestId),
        requestStatusApi.getAll(),
        usersApi.listUsers(),
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

      await loadAssignments();
    } catch (e: any) {
      await alerts.error(
        "No se pudo cargar el detalle",
        e?.message ?? "Intenta nuevamente."
      );
      setRequest(null);
    } finally {
      setIsLoading(false);
    }
  }, [requestId, loadAssignments]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onAssign = async () => {
    if (!isAdmin || !request) return;

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
      await alerts.toastSuccess("Solicitud asignada");
    } catch (e: any) {
      await alerts.error("No se pudo asignar", e?.message ?? "Intenta nuevamente.");
    }
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
      await requestsApi.updateRequest(request.id, { title, description });
      setRequest({ ...request, title, description });
      await alerts.toastSuccess("Cambios guardados");
    } catch (e: any) {
      await alerts.error("No se pudo guardar", e?.message ?? "Intenta nuevamente.");
    }
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

      await alerts.toastSuccess("Estado actualizado");
    } catch (e: any) {
      await alerts.error("No se pudo cambiar el estado", e?.message ?? "Intenta nuevamente.");
    }
  };

  // ✅ NUEVO: eliminar solicitud (solo ADMIN)
  const onDelete = async () => {
    if (!isAdmin || !request) return;

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
    } catch (e: any) {
      await alerts.error(
        "No se pudo eliminar la solicitud",
        e?.message ?? "Intenta nuevamente."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Cargando...</div>;
  if (!request) return <div className="p-4 text-sm text-muted-foreground">No se encontró la solicitud.</div>;

  const { current, prev, next } = findPrevNext(statuses, request.status_id);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Detalle de Solicitud</h1>
          <p className="text-sm text-muted-foreground">ID: {request.id}</p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
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

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-4 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 w-full">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canEdit || isDeleting}
                className="text-base font-semibold"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {canEdit ? "Puedes editar esta solicitud." : "Solo lectura."}
              </p>
            </div>

            <div className="flex gap-2">
              <Badge variant="secondary">{current?.name ?? request.status_name ?? "—"}</Badge>
              {request.priority_name ? <Badge>{request.priority_name}</Badge> : null}
            </div>
          </div>

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!canEdit || isDeleting}
            className="min-h-[140px]"
            placeholder="Descripción…"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={load} disabled={isDeleting}>
              Recargar
            </Button>
            <Button onClick={onSave} disabled={!canEdit || isDeleting}>
              Guardar cambios
            </Button>
          </div>

          <Separator />
          <div className="text-xs text-muted-foreground">
            Tipo: <b>{request.type_name ?? "—"}</b>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold">Asignación</div>

            <div className="text-sm">
              Asignado a:{" "}
              <b>{assigneeUser ? assigneeUser.full_name : "Sin asignar"}</b>
              {assigneeUser?.email ? (
                <div className="text-xs text-muted-foreground">{assigneeUser.email}</div>
              ) : null}
            </div>

            {isAdmin ? (
              <div className="space-y-2">
                <Select
                  value={selectedAssignee}
                  onValueChange={setSelectedAssignee}
                  disabled={isDeleting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name} — {u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="w-full"
                  onClick={onAssign}
                  disabled={!selectedAssignee || isDeleting}
                >
                  Asignar
                </Button>

                <p className="text-xs text-muted-foreground">
                  Solo ADMIN puede asignar solicitudes.
                </p>
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-semibold">Estado</div>
            <div className="text-xs text-muted-foreground">
              Solo se permite avanzar/retroceder 1 estado.
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!prev || !canEdit || isDeleting}
                onClick={() => prev && onChangeStatus(prev.id)}
              >
                Retroceder
              </Button>

              <Button
                className="flex-1"
                disabled={!next || !canEdit || isDeleting}
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
        </Card>
      </div>
    </div>
  );
}