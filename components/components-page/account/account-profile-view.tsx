"use client";

import * as React from "react";
import { usersApi } from "@/api/users/users.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AccountFormState = {
  id: string;
  username: string;
  fullName: string;
  email: string;
};

function getLoggedUserId(): string {
  // ✅ AJUSTA a tu implementación real:
  // - tokenStorage.getAuth()?.user?.id
  // - parseJwt(token)?.sub
  // - localStorage.getItem("userId")
  const userId = localStorage.getItem("userId");
  if (!userId) throw new Error("No se encontró userId del usuario logeado.");
  return userId;
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
      const userId = getLoggedUserId();
      const res = await usersApi.getById(userId);

      // tu backend responde { success, data: {...} }
      const u = (res as any)?.data?.data ?? (res as any)?.data ?? (res as any)?.data?.data;

      // fallback robusto
      const user = (res as any)?.data?.data ?? (res as any)?.data ?? (res as any)?.data?.data;

      const data = user ?? (res as any)?.data;

      setForm({
        id: data.id,
        username: data.username,
        fullName: data.full_name,
        email: data.email,
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
        username: form.username,          // requerido por tu update (mantener igual)
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        // roleId no se modifica aquí; si tu backend lo exige, lo obtenemos del GET y lo pasamos
        // roleId: ???,
        password: newPassword ? newPassword : undefined,
        isActive: true, // si backend lo exige y no viene en account, mejor obtenerlo del GET
      });

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
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
        {error ?? "No se pudo cargar la información."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Mis Datos</h1>
        <p className="text-sm text-muted-foreground">Actualiza tu información personal.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
          {success}
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault(); // ✅ evita recarga
        }}
        className="space-y-4 rounded-2xl border bg-background p-4 shadow-sm"
      >
        <div className="grid gap-2">
          <Label htmlFor="username">Username (no editable)</Label>
          <Input id="username" value={form.username} disabled />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fullName">Nombre</Label>
          <Input
            id="fullName"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            disabled={isSaving}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={isSaving}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="newPassword">Nueva contraseña (opcional)</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSaving}
            placeholder="Deja vacío para no cambiar"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}