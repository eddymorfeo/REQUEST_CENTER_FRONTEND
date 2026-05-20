"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors/get-error-message";

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
    } catch (error: unknown) {
      setError(getErrorMessage(error) || "No se pudo eliminar el rol.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-2xl p-0 sm:max-w-[520px]">
        <div className="border-b p-6">
          <DialogHeader>
            <DialogTitle className="text-lg">Eliminar rol</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 p-6">
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
              Seguro que deseas eliminar el rol{" "}
              <span className="font-semibold">{role?.code ?? "-"}</span>?
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Se eliminara el registro y no podras recuperarlo.
            </div>
          </div>
        </div>

        <div className="border-t bg-background p-6">
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg px-5"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>

            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                className="h-10 gap-2 rounded-lg bg-red-600 px-5 text-white hover:bg-red-700"
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
