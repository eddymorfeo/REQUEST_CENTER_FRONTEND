"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RequestItem } from "@/types/requests/request.types";
import { StatusBadge } from "@/components/components-page/requests/badge/request-status-badge";
import { PriorityBadge } from "@/components/components-page/requests/badge/request-priority-badge";
import { formatDdMmYyyy } from "@/utils/formatDate";

export type RequestTableRow = RequestItem & {
  assignee: string;
};

function dateSort(a?: string, b?: string) {
  const ta = a ? new Date(a).getTime() : 0;
  const tb = b ? new Date(b).getTime() : 0;
  return ta - tb;
}

export const requestColumns: ColumnDef<RequestTableRow>[] = [
  {
    id: "status",
    header: "Estado",
    accessorFn: (row) => (row.status_name ?? row.status_id ?? "—").toUpperCase(),
    cell: ({ row }) => {
      const raw = row.original.status_name ?? row.original.status_id ?? "—";
      const value = String(raw).toUpperCase();
      return <StatusBadge value={value} />;
    },
    enableSorting: true,
  },
  {
    id: "name",
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        type="button"
        variant="ghost"
        className="px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const title = row.original.title ?? "—";
      const description = row.original.description ?? "";
      return (
        <div className="min-w-0">
          <div className="font-medium leading-tight line-clamp-1">{title}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">
            {row.original.priority_id || "—"}
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "type",
    header: "Grupo",
    accessorFn: (row) => row.type_name ?? "—",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.type_name ?? "—"}
      </span>
    ),
    enableSorting: true,
  },
  {
    id: "assignee",
    header: ({ column }) => (
      <Button
        type="button"
        variant="ghost"
        className="px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Asignado a
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    accessorKey: "assignee",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.assignee || "Sin asignar"}</span>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: "priority",
    header: ({ column }) => (
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Prioridad
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      </div>
    ),
    accessorFn: (row) => (row.priority_name ?? "—").toUpperCase(),
    cell: ({ row }) => {
      const raw = row.original.priority_name ?? "—";
      const value = String(raw).toUpperCase();
      return (
        <div className="flex justify-center">
          <PriorityBadge value={value} />
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "createdAt",
    header: ({ column }) => (
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha Creación
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      </div>
    ),
    accessorKey: "created_at",
    sortingFn: (rowA, rowB) =>
      dateSort(rowA.original.created_at, rowB.original.created_at),
    cell: ({ row }) => (
      <div className="flex justify-center text-sm text-muted-foreground">
        {formatDdMmYyyy(row.original.created_at)}
      </div>
    ),
    enableSorting: true,
  },
];