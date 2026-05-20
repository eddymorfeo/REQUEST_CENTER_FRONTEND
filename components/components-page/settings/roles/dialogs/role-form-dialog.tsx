"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Hash, ShieldCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/errors/get-error-message";

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
      <Label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </Label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}

function SegmentButton({
  active,
  children,
  onClick,
  disabled,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={`h-10 flex-1 gap-2 rounded-md ${
        active ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
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
      setCode(initial.code ?? "");
      setName(initial.name ?? "");
      setIsActive(Boolean(initial.is_active));
    } else {
      setCode("");
      setName("");
      setIsActive(true);
    }
  }, [open, isEdit, initial]);

  async function handleSave() {
    setError(null);

    if (!code.trim()) return setError("El codigo es requerido.");
    if (!name.trim()) return setError("El nombre es requerido.");

    setIsSaving(true);
    try {
      await onSubmit({ code: code.trim(), name: name.trim(), isActive });
      onOpenChange(false);
    } catch (error: unknown) {
      setError(getErrorMessage(error) || "No se pudo guardar el rol.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-2xl p-0 sm:max-w-[620px]">
        <div className="px-6 pb-5 pt-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEdit ? "Editar rol" : "Crear rol"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isEdit
                ? "Actualiza los datos del rol y guarda los cambios."
                : "Completa los datos del rol y guarda los cambios."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          className="space-y-5 px-6 pb-6"
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

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Codigo" htmlFor="code" icon={<Hash className="size-4" />}>
              <Input
                id="code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="ADMIN"
                disabled={isSaving}
                className="h-10 rounded-lg pl-10"
              />
            </Field>

            <Field label="Nombre" htmlFor="name" icon={<ShieldCheck className="size-4" />}>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Administrador"
                disabled={isSaving}
                className="h-10 rounded-lg pl-10"
              />
            </Field>

            <div className="rounded-xl border p-5 md:col-span-2">
              <div>
                <div className="text-sm font-semibold">Estado</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Define si el rol esta habilitado para el sistema.
                </p>
              </div>

              <div className="mt-4 inline-flex w-full max-w-xs rounded-lg border bg-background p-1">
                <SegmentButton
                  active={isActive}
                  onClick={() => setIsActive(true)}
                  disabled={isSaving}
                >
                  <CheckCircle2 className={`size-4 ${isActive ? "text-emerald-400" : "text-muted-foreground"}`} />
                  Activo
                </SegmentButton>
                <SegmentButton
                  active={!isActive}
                  onClick={() => setIsActive(false)}
                  disabled={isSaving}
                >
                  <Circle className="size-4" />
                  Inactivo
                </SegmentButton>
              </div>
            </div>
          </div>
        </form>

        <div className="border-t bg-background px-6 py-5">
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg px-5"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>

            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                className="h-10 rounded-lg bg-blue-600 px-5 text-white shadow-sm hover:bg-blue-700"
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
