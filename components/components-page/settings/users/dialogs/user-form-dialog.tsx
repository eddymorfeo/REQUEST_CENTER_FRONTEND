"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AtSign,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  User2,
} from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/errors/get-error-message";

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
      <Label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </Label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        {children}
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
  const [showPassword, setShowPassword] = React.useState(false);

  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;

    setError(null);
    setShowPassword(false);

    if (isEdit && initial) {
      setUsername(initial.username ?? "");
      setFullName(initial.full_name ?? "");
      setEmail(initial.email ?? "");
      setRoleId(initial.role_id ?? "");
      setPassword("");
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

    if (!username.trim()) return setError("El nombre de usuario es requerido.");
    if (!fullName.trim()) return setError("El nombre completo es requerido.");
    if (!email.trim()) return setError("El email es requerido.");
    if (!roleId) return setError("El rol es requerido.");
    if (!isEdit && !password.trim()) return setError("La contrasena es requerida para crear.");

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
    } catch (error: unknown) {
      setError(getErrorMessage(error) || "No se pudo guardar el usuario.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-2xl p-0 sm:max-w-[640px]">
        <div className="px-6 pb-5 pt-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEdit ? "Editar usuario" : "Crear usuario"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isEdit
                ? "Actualiza los datos del usuario y guarda los cambios."
                : "Completa los datos del usuario y guarda los cambios."}
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
            <Field label="Nombre de usuario" htmlFor="username" icon={<User2 className="size-4" />}>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="jperez"
                disabled={isSaving}
                className="h-10 rounded-lg pl-10"
              />
            </Field>

            <Field label="Email" htmlFor="email" icon={<AtSign className="size-4" />}>
              <Input
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jperez@minpublico.cl"
                disabled={isSaving}
                className="h-10 rounded-lg pl-10"
              />
            </Field>

            <Field label="Nombre completo" htmlFor="fullName" icon={<User2 className="size-4" />}>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Juan Perez"
                disabled={isSaving}
                className="h-10 rounded-lg pl-10"
              />
            </Field>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Rol</Label>

              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
                  <ShieldCheck className="size-4" />
                </div>

                <Select value={roleId} onValueChange={setRoleId} disabled={isSaving}>
                  <SelectTrigger className="h-10 w-full rounded-lg pl-10">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start" className="w-[var(--radix-select-trigger-width)]">
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="md:col-span-2">
              <Field
                label={isEdit ? "Contrasena (opcional)" : "Contrasena"}
                htmlFor="password"
                icon={<KeyRound className="size-4" />}
                hint={isEdit ? "Dejar vacio para mantener la contrasena actual." : undefined}
              >
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isEdit ? "Dejar vacio para no cambiar" : "Ingresa una contrasena"}
                  disabled={isSaving}
                  className="h-10 rounded-lg pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={isSaving}
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </Field>
            </div>

            <div className="grid gap-3 md:col-span-2">
              <div>
                <div className="text-sm font-semibold">Estado</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Define si el usuario puede acceder al sistema.
                </p>
              </div>

              <div className="inline-flex w-fit rounded-lg border bg-background p-1">
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-10 min-w-28 gap-2 rounded-md ${
                    isActive ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background" : ""
                  }`}
                  onClick={() => setIsActive(true)}
                  disabled={isSaving}
                >
                  <CheckCircle2 className={`size-4 ${isActive ? "text-emerald-400" : "text-muted-foreground"}`} />
                  Activo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-10 min-w-28 gap-2 rounded-md ${
                    !isActive ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background" : ""
                  }`}
                  onClick={() => setIsActive(false)}
                  disabled={isSaving}
                >
                  <Circle className="size-4" />
                  Inactivo
                </Button>
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
