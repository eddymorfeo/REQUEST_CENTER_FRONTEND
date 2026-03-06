"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AtSign, KeyRound, Save, User2 } from "lucide-react";

import { usersApi } from "@/api/users/users.api";
import { tokenStorage } from "@/utils/storage/token.storage";
import type { AuthUser } from "@/types/auth/auth.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AccountFormState = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roleId: string;
  isActive: boolean;
};

function getLoggedAuthUser(): AuthUser {
  const user = tokenStorage.getUser<AuthUser>();
  if (!user?.id) throw new Error("No se encontró userId del usuario logeado.");
  return user;
}

function Field({
  label,
  htmlFor,
  icon,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
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

      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default function AccountProfileView() {
  const [form, setForm] = React.useState<AccountFormState | null>(null);

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const authUser = getLoggedAuthUser();
      const res = await usersApi.getById(authUser.id);
      const u = res.data;

      setForm({
        id: u.id,
        username: u.username,
        fullName: u.full_name,
        email: u.email,
        roleId: u.role_id,
        isActive: u.is_active,
      });
    } catch (e: any) {
      setError(e?.message ?? "No se pudo cargar tu cuenta.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    if (!form) return;

    setError(null);
    setSuccess(null);

    if (!form.fullName.trim()) return setError("El nombre es requerido.");
    if (!form.email.trim()) return setError("El email es requerido.");

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
      if (newPassword !== confirmPassword) return setError("Las contraseñas no coinciden.");
    }

    setIsSaving(true);
    try {
      await usersApi.updateUser(form.id, {
        username: form.username,
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        roleId: form.roleId,
        isActive: form.isActive,
        password: newPassword ? newPassword : undefined,
      });

      const current = tokenStorage.getUser<AuthUser>();
      if (current?.id === form.id) {
        tokenStorage.setUser({
          ...current,
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
        });
      }

      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Tus datos fueron actualizados correctamente.");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "No se pudo actualizar tu cuenta.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground">
        Cargando datos de tu cuenta...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
        {error ?? "No se pudo cargar la información."}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="space-y-4"
    >

      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Mis Datos</h1>
        <p className="text-sm text-muted-foreground">
          Actualiza tu información personal y credenciales.
        </p>
      </div>

      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm"
        >
          {error}
        </motion.div>
      ) : null}

      {success ? (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm"
        >
          {success}
        </motion.div>
      ) : null}

      <div className="rounded-2xl border bg-background p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Información</div>
                <div className="text-xs text-muted-foreground">
                  Mantén tu perfil actualizado.
                </div>
              </div>
            </div>

            <Field
              label="Usuario"
              htmlFor="username"
              icon={<User2 className="size-4" />}
            >
              <Input id="username" value={form.username} disabled className="rounded-xl" />
            </Field>

            <Field
              label="Nombre"
              htmlFor="fullName"
              icon={<User2 className="size-4" />}
            >
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) =>
                  setForm((s) => (s ? { ...s, fullName: e.target.value } : s))
                }
                disabled={isSaving}
                className="rounded-xl"
              />
            </Field>

            <Field
              label="Email"
              htmlFor="email"
              icon={<AtSign className="size-4" />}
            >
              <Input
                id="email"
                value={form.email}
                onChange={(e) =>
                  setForm((s) => (s ? { ...s, email: e.target.value } : s))
                }
                disabled={isSaving}
                className="rounded-xl"
              />
            </Field>
          </div>

          <div className="space-y-5">
            <div>
              <div className="text-sm font-semibold">Seguridad</div>
              <div className="text-xs text-muted-foreground">
                Cambia tu contraseña si lo necesitas.
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4 space-y-4">
              <Field
                label="Nueva contraseña"
                htmlFor="newPassword"
                icon={<KeyRound className="size-4" />}
              >
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="********"
                  disabled={isSaving}
                  className="rounded-xl bg-background"
                />
              </Field>

              <Field
                label="Confirmar contraseña"
                htmlFor="confirmPassword"
                icon={<KeyRound className="size-4" />}
              >
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  disabled={isSaving}
                  className="rounded-xl bg-background"
                />
              </Field>
            </div>

            <div className="flex justify-end">
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-xl gap-2 shadow-sm bg-foreground text-background hover:bg-foreground/90 transition"
                >
                  <Save className="size-4" />
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}