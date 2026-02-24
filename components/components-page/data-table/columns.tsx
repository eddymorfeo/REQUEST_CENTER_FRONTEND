"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { RequestItem } from "@/types/requests/request.types";

/**
 * Data que consumirá la tabla.
 * "assignee" se resuelve desde request-assignments + users (en RequestsListView).
 */
export type RequestTableRow = RequestItem & {
  assignee: string; // "Ricardo Yau", "ipfaur", "Sin asignar", etc.
};

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function dateSort(a?: string, b?: string) {
  const ta = a ? new Date(a).getTime() : 0;
  const tb = b ? new Date(b).getTime() : 0;
  return ta - tb;
}

export const requestColumns: ColumnDef<RequestTableRow>[] = [
  {
    id: "status",
    header: "Estado",
    accessorFn: (row) => row.status_name ?? row.status_code ?? "—",
    cell: ({ row }) => {
      const status = row.original.status_name ?? row.original.status_code ?? "—";
      return (
        <Badge variant="secondary" className="rounded-full">
          {status}
        </Badge>
      );
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
            {description || "—"}
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "type",
    header: "Tipo",
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
      <div className="flex justify-end">
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
    accessorFn: (row) => row.priority_name ?? "—",
    cell: ({ row }) => (
      <div className="flex justify-end">
        {row.original.priority_name ? (
          <Badge variant="outline" className="rounded-full">
            {row.original.priority_name}
          </Badge>
        ) : (
          "—"
        )}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "createdAt",
    header: ({ column }) => (
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      </div>
    ),
    accessorKey: "created_at",
    sortingFn: (rowA, rowB) => dateSort(rowA.original.created_at, rowB.original.created_at),
    cell: ({ row }) => (
      <div className="flex justify-end text-sm text-muted-foreground">
        {formatDate(row.original.created_at)}
      </div>
    ),
    enableSorting: true,
  },
];