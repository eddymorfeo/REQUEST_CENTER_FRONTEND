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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { StatusTableRow } from "../data-table/columns";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  initial?: StatusTableRow | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    code: string;
    name: string;
    sortOrder?: number;
    isTerminal: boolean;
    isActive: boolean;
  }) => Promise<void>;
};

export function StatusFormDialog({ open, mode, initial, onOpenChange, onSubmit }: Props) {
  const isEdit = mode === "edit";

  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<string>("");

  const [isTerminal, setIsTerminal] = React.useState(false);
  const [isActive, setIsActive] = React.useState(true);

  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setError(null);

    if (isEdit && initial) {
      setCode(initial.code ?? "");
      setName(initial.name ?? "");
      setSortOrder(String(initial.sort_order ?? ""));
      setIsTerminal(Boolean(initial.is_terminal));
      setIsActive(Boolean(initial.is_active));
    } else {
      setCode("");
      setName("");
      setSortOrder("");
      setIsTerminal(false);
      setIsActive(true);
    }
  }, [open, isEdit, initial]);

  async function handleSave() {
    setError(null);

    if (!code.trim()) return setError("Code es requerido.");
    if (!name.trim()) return setError("Name es requerido.");

    const parsedSort = sortOrder.trim() === "" ? undefined : Number.parseInt(sortOrder, 10);
    if (parsedSort !== undefined && Number.isNaN(parsedSort)) {
      return setError("Sort order debe ser un número.");
    }

    setIsSaving(true);
    try {
      await onSubmit({
        code: code.trim(),
        name: name.trim(),
        sortOrder: parsedSort,
        isTerminal,
        isActive,
      });
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo guardar el estado.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Estado" : "Crear Estado"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          className="space-y-4"
        >
          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              {error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} disabled={isSaving} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              disabled={isSaving}
              inputMode="numeric"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm font-medium">Terminal</div>
              <div className="text-xs text-muted-foreground">Indica si es un estado final.</div>
            </div>
            <Button
              type="button"
              variant={isTerminal ? "default" : "outline"}
              onClick={() => setIsTerminal((v) => !v)}
              disabled={isSaving}
            >
              {isTerminal ? "Sí" : "No"}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm font-medium">Activo</div>
              <div className="text-xs text-muted-foreground">Habilita o deshabilita el estado.</div>
            </div>
            <Button
              type="button"
              variant={isActive ? "default" : "outline"}
              onClick={() => setIsActive((v) => !v)}
              disabled={isSaving}
            >
              {isActive ? "Sí" : "No"}
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}