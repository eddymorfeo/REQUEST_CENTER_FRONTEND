"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDdMmYyyy } from "@/utils/formatDate";

export type RoleTableRow = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ColumnActions = {
  onEdit: (row: RoleTableRow) => void;
  onDelete: (row: RoleTableRow) => void;
};

function dateSort(a?: string | null, b?: string | null) {
  const ta = a ? new Date(a).getTime() : 0;
  const tb = b ? new Date(b).getTime() : 0;
  return ta - tb;
}

function headerSortable(label: string, column: any) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="px-0"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-2 size-4" />
    </Button>
  );
}

export function buildRoleColumns(actions: ColumnActions): ColumnDef<RoleTableRow>[] {
  return [
    {
      id: "code",
      accessorKey: "code",
      header: ({ column }) => headerSortable("Código", column),
      cell: ({ row }) => (
        <span className="text-sm font-medium pl-3">{row.original.code ?? "—"}</span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => headerSortable("Nombre", column),
      cell: ({ row }) => <span className="text-sm">{row.original.name ?? "—"}</span>,
      enableSorting: true,
    },
    {
      id: "active",
      accessorKey: "is_active",
      header: "Activo",
      cell: ({ row }) => <span className="text-sm">{row.original.is_active ? "Sí" : "No"}</span>,
      enableSorting: true,
    },    
    {
      id: "actions",
      header: () => <div className="text-right flex justify-center">Acciones</div>,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              actions.onEdit(row.original);
            }}
          >
            Editar
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              actions.onDelete(row.original);
            }}
          >
            Borrar
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];
}