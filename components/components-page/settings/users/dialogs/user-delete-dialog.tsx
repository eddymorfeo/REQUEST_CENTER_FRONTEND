"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

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
      setError(e?.message ?? "No se pudo eliminar el usuario.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl p-0 overflow-hidden">
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-lg">Eliminar Usuario</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm"
            >
              {error}
            </motion.div>
          ) : null}

          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="text-sm">
              ¿Seguro que deseas eliminar al usuario{" "}
              <span className="font-semibold">{user?.username ?? "—"}</span>?
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Se eliminará el registro y no podrás recuperarlo.
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-background">
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>

            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="destructive"
                className="rounded-xl gap-2"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="size-4" />
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </motion.div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}