"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDdMmYyyy } from "@/utils/formatDate";

export type UserTableRow = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role_id: string;
  roleName: string;
  is_active: boolean;
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
      className="h-8 px-2 -ml-2 text-muted-foreground hover:text-foreground"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span className="font-medium">{label}</span>
      <ArrowUpDown className="ml-2 size-4 opacity-70" />
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
        <div className="pl-2">
          <div className="text-sm font-medium leading-tight">{row.original.username ?? "—"}</div>
        </div>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: "fullName",
      accessorKey: "full_name",
      header: ({ column }) => headerSortable("Nombre", column),
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="text-sm leading-tight line-clamp-1">{row.original.full_name ?? "—"}</div>
        </div>
      ),
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
      header: ({ column }) => headerSortable("Rol", column),
      accessorFn: (row) => row.roleName ?? "—",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.roleName || "—"}</span>
      ),
      enableSorting: true,
    },
    {
      id: "is_active",
      header: ({ column }) => headerSortable("Activo", column),
      accessorFn: (row) => (row.is_active ? "SI" : "NO"),
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.is_active ? "SI" : "NO"}
        </span>
      ),
      enableSorting: true,
    },
    {
      id: "createdAt",
      header: ({ column }) => (
        <div className="flex justify-center">{headerSortable("Creación", column)}</div>
      ),
      accessorKey: "created_at",
      sortingFn: (rowA, rowB) => dateSort(rowA.original.created_at, rowB.original.created_at),
      cell: ({ row }) => (
        <div className="flex justify-center text-sm text-muted-foreground tabular-nums">
          {row.original.created_at ? formatDdMmYyyy(row.original.created_at) : "—"}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "updatedAt",
      header: ({ column }) => (
        <div className="flex justify-center">{headerSortable("Actualización", column)}</div>
      ),
      accessorKey: "updated_at",
      sortingFn: (rowA, rowB) => dateSort(rowA.original.updated_at, rowB.original.updated_at),
      cell: ({ row }) => (
        <div className="flex justify-center text-sm text-muted-foreground tabular-nums">
          {row.original.updated_at ? formatDdMmYyyy(row.original.updated_at) : "—"}
        </div>
      ),
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