"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import type { RoleTableRow } from "../data-table/columns";

type Props = {
  open: boolean;
  role: RoleTableRow | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => Promise<void>;
};

export function RoleDeleteDialog({ open, role, onOpenChange, onConfirm }: Props) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleDelete() {
    if (!role?.id) return;

    setError(null);
    setIsDeleting(true);

    try {
      await onConfirm(role.id);
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo eliminar el rol.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Eliminar Rol</DialogTitle>
        </DialogHeader>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
            {error}
          </div>
        ) : null}

        <div className="text-sm">
          ¿Seguro que deseas eliminar el rol{" "}
          <span className="font-medium">{role?.code ?? "—"}</span>?
          <div className="mt-2 text-xs text-muted-foreground">Esta acción no se puede deshacer.</div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}