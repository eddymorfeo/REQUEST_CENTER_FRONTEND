"use client";

import * as React from "react";
import { ArrowRight, History } from "lucide-react";

import {
  requestStatusHistoryApi,
  type RequestStatusHistoryItem,
} from "@/api/requests/request-status-history.api";
import { getErrorMessage } from "@/lib/errors/get-error-message";
import { alerts } from "@/utils/alerts/alerts";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "./badge/request-status-badge";

function formatHistoryDate(value?: string) {
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

function getActorName(item: RequestStatusHistoryItem, requesterName?: string) {
  const fullName = item.changed_by_full_name?.trim();
  const username = item.changed_by_username?.trim();
  const actorIdentity = ((username || "") + " " + (fullName || "")).toLowerCase();
  const isPublicPortalActor =
    actorIdentity.includes("public_portal") ||
    actorIdentity.includes("portal publico") ||
    actorIdentity.includes("portal p\u00fablico");

  if (isPublicPortalActor && requesterName?.trim()) return requesterName.trim();

  return fullName || username || "Usuario sin nombre";
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
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
  ];

  return tones[index % tones.length];
}

function getFromStatusLabel(item: RequestStatusHistoryItem) {
  return item.from_status_name?.trim() || "Sin asignar";
}

function getToStatusLabel(item: RequestStatusHistoryItem) {
  return item.to_status_name?.trim() || "Nuevo estado";
}

type Props = {
  requestId: string;
  refreshKey?: number;
  requesterName?: string;
};

export function RequestStatusHistoryPanel({ requestId, refreshKey = 0, requesterName }: Props) {
  const [items, setItems] = React.useState<RequestStatusHistoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const timelineItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const left = new Date(a.changed_at).getTime();
      const right = new Date(b.changed_at).getTime();
      return right - left;
    });
  }, [items]);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await requestStatusHistoryApi.listByRequestId(requestId);
      setItems((res.data ?? []).filter((item) => item.is_active !== false));
    } catch (error: unknown) {
      await alerts.error(
        "No se pudo cargar el historial de estados",
        getErrorMessage(error)
      );
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  React.useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return (
    <Card className="rounded-2xl p-4">
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <History className="mt-0.5 size-4 shrink-0 text-blue-600" />
          <div>
            <div className="text-sm font-semibold leading-5">
              Historial de estados
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Registro cronológico los cambios de estado de la solicitud.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Cargando historial...</div>
        ) : timelineItems.length === 0 ? (
          <div className="rounded-xl border p-3 text-sm text-muted-foreground">
            No hay cambios de estado registrados.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-[24px_1fr]">
            <div className="relative hidden sm:block">
              <span className="absolute left-1/2 top-6 bottom-6 w-px -translate-x-1/2 bg-border" />
              <div className="relative">
                {timelineItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-h-[82px] items-center justify-center"
                  >
                    <span className="size-3 rounded-full border-2 border-background bg-foreground/70 shadow-[0_0_0_2px_hsl(var(--border))]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {timelineItems.map((item, index) => {
                const actorName = getActorName(item, requesterName);
                const fromStatus = getFromStatusLabel(item);
                const toStatus = getToStatusLabel(item);

                return (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-xl border bg-background p-3 shadow-xs sm:grid-cols-[40px_1fr_auto]"
                  >
                    <div
                      className={`flex size-9 items-center justify-center rounded-full text-xs font-semibold ${getAvatarClassName(index)}`}
                    >
                      {getInitials(actorName)}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-5">
                        {actorName}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge value={fromStatus} />
                        <ArrowRight className="size-3.5 text-muted-foreground" />
                        <StatusBadge value={toStatus} />
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground sm:min-w-[160px] sm:text-right">
                      {formatHistoryDate(item.changed_at)}
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
