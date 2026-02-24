"use client";

import * as React from "react";
import { Paperclip, Upload, Download, Trash2 } from "lucide-react";

import { alerts } from "@/utils/alerts/alerts";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  requestAttachmentsApi,
  type RequestAttachmentItem,
} from "@/api/requests/request-attachments.api";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let idx = 0;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx++;
  }
  return `${size.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

type Props = {
  requestId: string;
  requestTitle?: string;
  onCountChange?: (count: number) => void;
};

export function RequestAttachmentsPanel({
  requestId,
  requestTitle,
  onCountChange,
}: Props) {
  const { user } = useAuth();
  const isAdmin = user?.roleCode === "ADMIN";

  const [items, setItems] = React.useState<RequestAttachmentItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDownloadingId, setIsDownloadingId] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await requestAttachmentsApi.listByRequestId(requestId);

      const list: RequestAttachmentItem[] = (res.data ?? []).filter(
        (a: RequestAttachmentItem) => a.is_active !== false
      );

      list.sort(
        (a: RequestAttachmentItem, b: RequestAttachmentItem) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setItems(list);
      onCountChange?.(list.length);
    } catch (e: any) {
      await alerts.error(
        "No se pudieron cargar adjuntos",
        e?.message ?? "Intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  }, [requestId, onCountChange]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onUpload = async () => {
    if (!file) {
      await alerts.error("Archivo requerido", "Selecciona un archivo para subir.");
      return;
    }

    const ok = await alerts.confirm("Subir archivo", "¿Confirmas subir este archivo?");
    if (!ok) return;

    try {
      setIsUploading(true);

      await requestAttachmentsApi.upload({
        requestId,
        title: requestTitle ?? "request",
        file,
      });

      setFile(null);
      const input = document.getElementById("rc-file-input") as HTMLInputElement | null;
      if (input) input.value = "";

      await alerts.toastSuccess("Archivo subido");
      await load();
    } catch (e: any) {
      await alerts.error("No se pudo subir el archivo", e?.message ?? "Intenta nuevamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDownload = async (attachment: RequestAttachmentItem) => {
    try {
      setIsDownloadingId(attachment.id);

      const { blob, filename } = await requestAttachmentsApi.download(attachment.id);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || attachment.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      await alerts.toastSuccess("Descarga iniciada");
    } catch (e: any) {
      await alerts.error("No se pudo descargar", e?.message ?? "Intenta nuevamente.");
    } finally {
      setIsDownloadingId(null);
    }
  };

  const onDelete = async (attachment: RequestAttachmentItem) => {
    if (!isAdmin) {
      await alerts.error("Acción no permitida", "Solo ADMIN puede eliminar adjuntos por ahora.");
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
      await load();
    } catch (e: any) {
      // ⚠️ si tu delete es soft y backend responde “error” pero igual desactiva,
      // puedes cambiar a toastSuccess igual. Pero primero ve el mensaje real.
      await alerts.error("No se pudo eliminar el adjunto", e?.message ?? "Intenta nuevamente.");
      await load();
    }
  };

  return (
    <Card className="p-4 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold flex items-center gap-2">
          <Paperclip className="size-4" />
          Adjuntos
        </div>

        <Button variant="outline" size="sm" onClick={load} disabled={isLoading || isUploading}>
          Recargar
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          id="rc-file-input"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={isUploading}
        />
        <Button onClick={onUpload} disabled={isUploading || !file} className="gap-2">
          <Upload className="size-4" />
          {isUploading ? "Subiendo..." : "Subir"}
        </Button>
      </div>

      <Separator />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Cargando adjuntos…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No hay adjuntos.</div>
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-2 rounded-xl border p-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{a.file_name}</div>
                <div className="text-xs text-muted-foreground">
                  {a.mime_type} · {formatBytes(Number(a.size_bytes))} ·{" "}
                  {new Date(a.created_at).toLocaleString()}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(a)}
                  disabled={isDownloadingId === a.id}
                  className="gap-2"
                >
                  <Download className="size-4" />
                  {isDownloadingId === a.id ? "Descargando..." : "Descargar"}
                </Button>

                {isAdmin ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(a)}
                    className="gap-2"
                  >
                    <Trash2 className="size-4" />
                    Eliminar
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}