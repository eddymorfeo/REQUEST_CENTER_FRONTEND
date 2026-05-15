"use client";

import * as React from "react";
import {
  Calendar,
  Eye,
  MessageSquareText,
  MoreVertical,
  Paperclip,
  Send,
} from "lucide-react";

import { requestCommentsApi, type RequestCommentItem } from "@/api/requests/request-comments.api";
import { useAuth } from "@/hooks/auth/useAuth";
import { getErrorMessage } from "@/lib/errors/get-error-message";
import { alerts } from "@/utils/alerts/alerts";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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

type Props = {
  requestId: string;
  disabled?: boolean;
};

export function RequestObservationsPanel({ requestId, disabled = false }: Props) {
  const { user } = useAuth();
  const [items, setItems] = React.useState<RequestCommentItem[]>([]);
  const [comment, setComment] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

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
      const res = await requestCommentsApi.listByRequestId(requestId);
      setItems((res.data ?? []).filter((item) => item.is_active !== false));
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
      setComment("");
      await alerts.toastSuccess("Observación agregada");
    } catch (error: unknown) {
      await alerts.error("No se pudo agregar la observación", getErrorMessage(error));
    } finally {
      setIsSaving(false);
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

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="outline" size="sm" disabled={disabled || isSaving}>
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
