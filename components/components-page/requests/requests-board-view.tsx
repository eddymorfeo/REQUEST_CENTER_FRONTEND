"use client";

import * as React from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { RequestItem } from "@/types/requests/request.types";
import type { RequestStatus } from "@/types/requests/request-status.types";
import type { AuthUser } from "@/types/auth/auth.types";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { alerts } from "@/utils/alerts/alerts";
import { requestsApi } from "@/api/requests/requests.api";
import { RequestCard } from "./request-card";
import { canEditOrMoveRequest } from "@/utils/request/request-permissions";

type Props = {
  statuses: RequestStatus[];
  requests: RequestItem[];
  currentUser: AuthUser | null;
  onRequestsChange: (next: RequestItem[]) => void;
};

function SortableRequestCard({
  item,
  locked,
}: {
  item: RequestItem;
  locked: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: locked,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <RequestCard item={item} isLocked={locked} />
    </div>
  );
}

export function RequestsBoardView({
  statuses,
  requests,
  currentUser,
  onRequestsChange,
}: Props) {
  const byStatus = React.useMemo(() => {
    const map = new Map<string, RequestItem[]>();
    for (const s of statuses) map.set(s.id, []);
    for (const r of requests) {
      const bucket = map.get(r.status_id);
      if (bucket) bucket.push(r);
    }
    return map;
  }, [statuses, requests]);

  const statusIdByRequestId = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const r of requests) map.set(r.id, r.status_id);
    return map;
  }, [requests]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const requestId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;

    if (!overId) return;

    // Droppable id = statusId
    const targetStatusId = overId;

    const prevStatusId = statusIdByRequestId.get(requestId);
    if (!prevStatusId) return;

    if (prevStatusId === targetStatusId) return;

    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    // ✅ Permisos: si no puede mover, cancelamos
    if (!canEditOrMoveRequest(request, currentUser)) {
      await alerts.error(
        "Acción no permitida",
        "Solo puedes mover solicitudes asignadas a tu usuario."
      );
      return;
    }

    const targetStatusName = statuses.find((s) => s.id === targetStatusId)?.name ?? "nuevo estado";

    // ✅ Confirmación
    const confirm = await alerts.confirm(
      "Confirmar cambio de estado",
      `¿Mover "${request.title}" a "${targetStatusName}"?`
    );

    if (!confirm) return;

    // ✅ Optimistic update
    const optimistic = requests.map((r) =>
      r.id === requestId ? { ...r, status_id: targetStatusId } : r
    );
    onRequestsChange(optimistic);

    try {
      await requestsApi.updateStatus(requestId, targetStatusId);
      await alerts.toastSuccess("Estado actualizado");
    } catch (e: any) {
      // ✅ Rollback
      const rollback = requests.map((r) =>
        r.id === requestId ? { ...r, status_id: prevStatusId } : r
      );
      onRequestsChange(rollback);

      await alerts.error(
        "No se pudo actualizar el estado",
        e?.message ?? "Intenta nuevamente."
      );
    }
  };

  return (
    <ScrollArea className="w-full">
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 pb-4">
          {statuses.map((status) => {
            const items = byStatus.get(status.id) ?? [];

            return (
              <section
                key={status.id}
                className="w-[320px] shrink-0 rounded-2xl bg-muted/30 border p-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {status.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{items.length}</span>
                  </div>
                </div>

                {/* ✅ droppable area: usamos status.id como over.id */}
                <div id={status.id} className="space-y-3 min-h-[120px]">
                  <SortableContext
                    items={items.map((r) => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.length === 0 ? (
                      <div className="text-sm text-muted-foreground px-1 py-6 text-center">
                        Sin solicitudes
                      </div>
                    ) : (
                      items.map((r) => (
                        <SortableRequestCard
                          key={r.id}
                          item={r}
                          locked={!canEditOrMoveRequest(r, currentUser)}
                        />
                      ))
                    )}
                  </SortableContext>
                </div>
              </section>
            );
          })}
        </div>
      </DndContext>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
