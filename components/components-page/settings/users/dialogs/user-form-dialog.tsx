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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { motion } from "framer-motion";
import { AtSign, KeyRound, ShieldCheck, User2 } from "lucide-react";
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
    password?: string;
    isActive: boolean;
  }) => Promise<void>;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function Field({
  label,
  htmlFor,
  icon,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  icon: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label
        htmlFor={htmlFor}
        className="text-xs uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </Label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        <div className="pl-9">{children}</div>
      </div>

      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
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
      // ✅ IMPORTANTE: respeta el estado real
      setIsActive(Boolean(initial.is_active));
    } else {
      setUsername("");
      setFullName("");
      setEmail("");
      setRoleId(roles[0]?.id ?? "");
      setPassword("");
      setIsActive(true);
    }
  }, [open, isEdit, initial, roles]);

  async function handleSave() {
    setError(null);

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
      <DialogContent className="sm:max-w-[720px] rounded-2xl p-0 overflow-hidden">
        {/* Header premium */}
        <div className="p-6 border-b bg-background">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {isEdit ? "Editar Usuario" : "Crear Usuario"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Crea o actualiza los datos de los usuarios y guarda los cambios.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault(); // ✅ evita recargas
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

          {/* Grid pro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Username" htmlFor="username" icon={<User2 className="size-4" />}>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="jperez"
                disabled={isSaving}
                className="rounded-xl"
              />
            </Field>

            <Field label="Email" htmlFor="email" icon={<AtSign className="size-4" />}>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jperez@minpublico.cl"
                disabled={isSaving}
                className="rounded-xl"
              />
            </Field>

            <Field label="Full name" htmlFor="fullName" icon={<User2 className="size-4" />}>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Perez"
                disabled={isSaving}
                className="rounded-xl"
              />
            </Field>

            <div className="grid gap-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Role
              </Label>

              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <ShieldCheck className="size-4" />
                </div>

                <Select value={roleId} onValueChange={setRoleId} disabled={isSaving}>
                  <SelectTrigger className="w-full rounded-xl pl-9">
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
            </div>

            <Field
              label={isEdit ? "Password (opcional)" : "Password"}
              htmlFor="password"
              icon={<KeyRound className="size-4" />}
              hint={isEdit ? "Deja vacío para no cambiar." : undefined}
            >
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? "Deja vacío para no cambiar" : "123456"}
                disabled={isSaving}
                className="rounded-xl"
              />
            </Field>

            {/* Activo: toggle SI/NO más claro */}
            <div className="rounded-2xl border bg-muted/20 p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Activo</div>
                <div className="text-xs text-muted-foreground">
                  Habilita o deshabilita el usuario.
                </div>
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

        {/* Footer premium */}
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