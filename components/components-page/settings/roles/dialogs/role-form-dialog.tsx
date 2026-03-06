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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { motion } from "framer-motion";
import { Hash, ShieldCheck } from "lucide-react";
import type { RoleTableRow } from "../data-table/columns";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  initial?: RoleTableRow | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { code: string; name: string; isActive: boolean }) => Promise<void>;
};

function Field({
  label,
  htmlFor,
  icon,
  children,
}: {
  label: string;
  htmlFor: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        <div className="pl-9">{children}</div>
      </div>
    </div>
  );
}

export function RoleFormDialog({ open, mode, initial, onOpenChange, onSubmit }: Props) {
  const isEdit = mode === "edit";

  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setError(null);

    if (isEdit && initial) {
      setCode((initial as any).code ?? "");
      setName((initial as any).name ?? "");
      setIsActive(Boolean((initial as any).is_active ?? true));
    } else {
      setCode("");
      setName("");
      setIsActive(true);
    }
  }, [open, isEdit, initial]);

  async function handleSave() {
    setError(null);

    if (!code.trim()) return setError("Código es requerido.");
    if (!name.trim()) return setError("Nombre es requerido.");

    setIsSaving(true);
    try {
      await onSubmit({ code: code.trim(), name: name.trim(), isActive });
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo guardar el rol.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] rounded-2xl p-0 overflow-hidden">
        <div className="p-6 border-b bg-background">
          <DialogHeader>
            <DialogTitle className="text-lg">{isEdit ? "Editar Rol" : "Crear Rol"}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Crea o actualiza roles del sistema y guarda los cambios.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          className="p-6 space-y-5"
        >
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm"
            >
              {error}
            </motion.div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Código" htmlFor="code" icon={<Hash className="size-4" />}>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ADMIN"
                disabled={isSaving}
                className="rounded-xl"
              />
            </Field>

            <Field label="Nombre" htmlFor="name" icon={<ShieldCheck className="size-4" />}>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Administrador"
                disabled={isSaving}
                className="rounded-xl"
              />
            </Field>

            <div className="rounded-2xl border bg-muted/20 p-4 flex items-center justify-between md:col-span-2">
              <div>
                <div className="text-sm font-semibold">Activo</div>
                <div className="text-xs text-muted-foreground">Habilita o deshabilita el rol.</div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  className="rounded-xl"
                  onClick={() => setIsActive(true)}
                  disabled={isSaving}
                >
                  Sí
                </Button>
                <Button
                  type="button"
                  variant={!isActive ? "default" : "outline"}
                  className="rounded-xl"
                  onClick={() => setIsActive(false)}
                  disabled={isSaving}
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t bg-background">
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-muted-foreground/20 bg-gray-100 text-foreground hover:bg-gray-200 hover:border-muted-foreground/30 transition"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>

            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                className="rounded-xl shadow-sm bg-blue-500 text-background hover:bg-blue-600 active:scale-[0.99] transition"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
              </Button>
            </motion.div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}