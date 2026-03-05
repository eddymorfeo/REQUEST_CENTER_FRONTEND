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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserTableRow } from "../data-table/columns";

type RoleOption = { id: string; name: string };

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  roles: RoleOption[];
  initial?: UserTableRow | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    username: string;
    fullName: string;
    email: string;
    roleId: string;
    password?: string; // create required, edit optional
    isActive: boolean;
  }) => Promise<void>;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function UserFormDialog({
  open,
  mode,
  roles,
  initial,
  onOpenChange,
  onSubmit,
}: Props) {
  const isEdit = mode === "edit";

  const [username, setUsername] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [roleId, setRoleId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;

    setError(null);

    if (isEdit && initial) {
      setUsername(initial.username ?? "");
      setFullName(initial.full_name ?? "");
      setEmail(initial.email ?? "");
      setRoleId(initial.role_id ?? "");
      setPassword("");
      setIsActive(true);
    } else {
      setUsername("");
      setFullName("");
      setEmail("");
      setRoleId(roles[0]?.id ?? "");
      setPassword("");
      setIsActive(true);
    }
  }, [open, isEdit, initial, roles]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    // Validación mínima (SRP: validación UI, backend valida de nuevo)
    if (!username.trim()) return setError("Username es requerido.");
    if (!fullName.trim()) return setError("Full name es requerido.");
    if (!email.trim()) return setError("Email es requerido.");
    if (!roleId) return setError("Role es requerido.");
    if (!isEdit && !password.trim()) return setError("Password es requerido para crear.");

    setIsSaving(true);
    try {
      await onSubmit({
        username: username.trim(),
        fullName: fullName.trim(),
        email: normalizeEmail(email),
        roleId,
        password: password.trim() ? password : undefined,
        isActive,
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message ?? "No se pudo guardar el usuario.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} onKeyDown={(e) => {if (e.key === "Enter") {e.preventDefault();
    }}} className="space-y-4">
          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              {error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="test3"
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Usuario Test 23"
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test3@minpublico.cl"
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={roleId} onValueChange={setRoleId} disabled={isSaving}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">
              Password {isEdit ? "(opcional)" : ""}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? "Deja vacío para no cambiar" : "123456"}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm font-medium">Activo</div>
              <div className="text-xs text-muted-foreground">Habilita o deshabilita el usuario.</div>
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}