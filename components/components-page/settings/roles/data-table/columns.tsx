"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type RoleTableRow = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

export type ColumnActions = {
  onEdit: (row: RoleTableRow) => void;
  onDelete: (row: RoleTableRow) => void;
};

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
      header: () => <div className="text-right pr-2">Acciones</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1 pr-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Editar"
            onClick={(e) => {
              e.stopPropagation();
              actions.onEdit(row.original);
            }}
          >
            <Pencil className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            title="Eliminar"
            onClick={(e) => {
              e.stopPropagation();
              actions.onDelete(row.original);
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];
}