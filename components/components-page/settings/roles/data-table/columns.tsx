"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Column } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminRowActions } from "../../admin-row-actions";

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

function headerSortable(label: string, column: Column<RoleTableRow, unknown>) {
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
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.is_active ? "Sí" : "No"}</span>,
      enableSorting: true,
    },    
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => (
        <AdminRowActions row={row.original} onEdit={actions.onEdit} onDelete={actions.onDelete} />
      ),
      enableSorting: false,
    },
  ];
}
