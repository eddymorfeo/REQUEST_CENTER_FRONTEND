"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { RequestItem } from "@/types/requests/request.types";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import { StatusBadge } from "./badge/request-status-badge";
import { PriorityBadge } from "./badge/request-priority-badge";

export function RequestRow({
  item,
  assignee,
}: {
  item: RequestItem;
  assignee: string;
}) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/40 transition"
      onClick={() => router.push(`/requests/${item.id}`)}
    >
      <TableCell className="py-3">
        {/* Estado badge si tienes columna Estado */}
        <StatusBadge value={item.status_name ?? "—"} />
      </TableCell>

      <TableCell className="py-3">
        <div className="min-w-0">
          <div className="font-medium leading-snug line-clamp-1">{item.title}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">
            {item.description}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-3 text-sm text-muted-foreground">
        {item.type_name ?? "—"}
      </TableCell>

      <TableCell className="py-3 text-sm">
        {assignee}
      </TableCell>

      <TableCell className="py-3 text-right">
        {item.priority_name ? <PriorityBadge value={item.priority_name} /> : "—"}
      </TableCell>

      <TableCell className="py-3 text-right text-sm text-muted-foreground">
        {new Date(item.created_at).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
}