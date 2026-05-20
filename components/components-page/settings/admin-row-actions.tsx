"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AdminRowActionsProps<T> = {
  row: T;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  viewLabel?: string;
  deleteLabel?: string;
};

export function AdminRowActions<T>({
  row,
  onEdit,
  onDelete,
  viewLabel = "Editar",
  deleteLabel = "Eliminar",
}: AdminRowActionsProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="mx-auto flex text-foreground"
          aria-label="Abrir acciones"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-lg p-2 shadow-lg">
        <DropdownMenuItem
          className="gap-3 rounded-md px-2.5 py-2"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(row);
          }}
        >
          <Pencil className="size-4" />
          {viewLabel}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          className="gap-3 rounded-md px-2.5 py-2"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(row);
          }}
        >
          <Trash2 className="size-4" />
          {deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
