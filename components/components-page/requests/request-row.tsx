"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { RequestItem } from "@/types/requests/request.types";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";

type Props = {
  item: RequestItem;
  assignee?: string; // ✅ nuevo
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

export function RequestRow({ item, assignee }: Props) {
  const router = useRouter();

  const handleOpen = () => {
    router.push(`/requests/${item.id}`);
  };

  return (
    <TableRow
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleOpen();
      }}
      className="cursor-pointer transition-colors hover:bg-blue-100"
    >
      {/* Nombre (title + desc breve) */}
      <TableCell className="align-top">
        <div className="min-w-0">
          <div className="font-medium leading-snug line-clamp-1">
            {item.title ?? "—"}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
            {item.description ?? "—"}
          </div>
        </div>
      </TableCell>

      {/* Tipo */}
      <TableCell className="align-top">
        <span className="text-sm text-muted-foreground">
          {item.type_name ?? "—"}
        </span>
      </TableCell>

      {/* Asignado a */}
      <TableCell className="align-top">
        <span className="text-sm">
          {assignee?.trim() ? assignee : "Sin asignar"}
        </span>
      </TableCell>

      {/* Prioridad */}
      <TableCell className="align-top text-right">
        {item.priority_name ? (
          <Badge variant="secondary" className="rounded-full">
            {item.priority_name}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Fecha */}
      <TableCell className="align-top text-right">
        <span className="text-sm text-muted-foreground">
          {formatDate(item.created_at)}
        </span>
      </TableCell>
    </TableRow>
  );
}