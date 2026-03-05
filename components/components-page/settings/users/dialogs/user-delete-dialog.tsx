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

import type { UserTableRow } from "../data-table/columns";

type Props = {
  open: boolean;
  user: UserTableRow | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => Promise<void>;
};

export function UserDeleteDialog({ open, user, onOpenChange, onConfirm }: Props) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleDelete() {
    if (!user?.id) return;

    setError(null);
    setIsDeleting(true);
    try {
      await onConfirm(user.id);
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo eliminar.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Eliminar Usuario</DialogTitle>
        </DialogHeader>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
            {error}
          </div>
        ) : null}

        <div className="text-sm">
          ¿Seguro que deseas eliminar a{" "}
          <span className="font-medium">{user?.username ?? "este usuario"}</span>?
          <div className="mt-2 text-xs text-muted-foreground">
            Esta acción no se puede deshacer.
          </div>
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