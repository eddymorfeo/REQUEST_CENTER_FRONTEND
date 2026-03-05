"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDdMmYyyy } from "@/utils/formatDate";

export type UserTableRow = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role_id: string;
  roleName: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ColumnActions = {
  onEdit: (row: UserTableRow) => void;
  onDelete: (row: UserTableRow) => void;
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

export function buildUserColumns(actions: ColumnActions): ColumnDef<UserTableRow>[] {
  return [
    {
      id: "username",
      accessorKey: "username",
      header: ({ column }) => headerSortable("Usuario", column),
      cell: ({ row }) => (
        <span className="text-sm font-medium pl-3">{row.original.username ?? "—"}</span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: "fullName",
      accessorKey: "full_name",
      header: ({ column }) => headerSortable("Nombre", column),
      cell: ({ row }) => <span className="text-sm">{row.original.full_name ?? "—"}</span>,
      enableSorting: true,
    },
    {
      id: "email",
      accessorKey: "email",
      header: ({ column }) => headerSortable("Email", column),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.email ?? "—"}</span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: "role",
      header: ({ column }) => headerSortable("Role", column),
      accessorFn: (row) => row.roleName ?? "—",
      cell: ({ row }) => <span className="text-sm">{row.original.roleName || "—"}</span>,
      enableSorting: true,
    },
    {
      id: "createdAt",
      header: ({ column }) => (
        <div className="flex justify-center">{headerSortable("Fecha creación", column)}</div>
      ),
      accessorKey: "created_at",
      sortingFn: (rowA, rowB) => dateSort(rowA.original.created_at, rowB.original.created_at),
      cell: ({ row }) => (
        <div className="flex justify-center text-sm text-muted-foreground">
          {row.original.created_at ? formatDdMmYyyy(row.original.created_at) : "—"}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "updatedAt",
      header: ({ column }) => (
        <div className="flex justify-center">{headerSortable("Fecha actualización", column)}</div>
      ),
      accessorKey: "updated_at",
      sortingFn: (rowA, rowB) => dateSort(rowA.original.updated_at, rowB.original.updated_at),
      cell: ({ row }) => (
        <div className="flex justify-center text-sm text-muted-foreground">
          {row.original.updated_at ? formatDdMmYyyy(row.original.updated_at) : "—"}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "actions",
      header: () => <div className="text-right flex gap-2 justify-center">Acciones</div>,
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