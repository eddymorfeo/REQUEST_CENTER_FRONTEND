"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { usersApi } from "@/api/users/users.api";
import { useAuth } from "@/hooks/auth/useAuth";
import { getErrorMessage } from "@/lib/errors/get-error-message";
import { alerts } from "@/utils/alerts/alerts";

import { getLoggedAuthUser, splitFullName } from "./account.helpers";
import { AccountHeader } from "./components/account-header";
import { DataPanel } from "./components/data-panel";
import { SecurityPanel } from "./components/security-panel";
import type { AccountFormState, AccountTab, PersonalDraft } from "./types";

const initialDraft: PersonalDraft = {
  firstName: "",
  lastName: "",
  phone: "",
  position: "",
  department: "",
  timezone: "America/Santiago",
  emailNotifications: true,
  platformNotifications: true,
};

export default function AccountProfileView() {
  const { updateUser } = useAuth();

  const [activeTab, setActiveTab] = React.useState<AccountTab>("data");
  const [form, setForm] = React.useState<AccountFormState | null>(null);
  const [draft, setDraft] = React.useState<PersonalDraft>(initialDraft);

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = React.useState(false);
  const [avatarSrc, setAvatarSrc] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const avatarObjectUrlRef = React.useRef<string | null>(null);

  const setAvatarObjectUrl = React.useCallback((blob: Blob | null) => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }

    if (!blob) {
      setAvatarSrc(null);
      return;
    }

    const nextUrl = URL.createObjectURL(blob);
    avatarObjectUrlRef.current = nextUrl;
    setAvatarSrc(nextUrl);
  }, []);

  const refreshAvatarPreview = React.useCallback(
    async (userId: string, profilePhotoUrl?: string | null) => {
      if (!profilePhotoUrl) {
        setAvatarObjectUrl(null);
        return;
      }

      try {
        const blob = await usersApi.downloadAvatar(userId);
        setAvatarObjectUrl(blob);
      } catch {
        setAvatarObjectUrl(null);
      }
    },
    [setAvatarObjectUrl]
  );

  React.useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
    };
  }, []);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authUser = getLoggedAuthUser();
      const res = await usersApi.getById(authUser.id);
      const user = res.data;
      const names = splitFullName(user.full_name);

      setForm({
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        roleId: user.role_id,
        roleCode: authUser.roleCode,
        phone: user.phone ?? "",
        position: user.position ?? "",
        department: user.department ?? "",
        profilePhotoUrl: user.profile_photo_url ?? null,
        isActive: user.is_active,
      });
      setDraft((current) => ({
        ...current,
        ...names,
        phone: user.phone ?? "",
        position: user.position ?? "",
        department: user.department ?? "",
      }));
      await refreshAvatarPreview(user.id, user.profile_photo_url ?? null);
    } catch (error: unknown) {
      setError(getErrorMessage(error) || "No se pudo cargar tu cuenta.");
    } finally {
      setIsLoading(false);
    }
  }, [refreshAvatarPreview]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(mode: "profile" | "password") {
    if (!form) return;

    setError(null);

    const fullName = `${draft.firstName} ${draft.lastName}`.trim();
    const validationMessage = validateAccountSave({
      fullName,
      email: form.email,
      newPassword,
      confirmPassword,
      requirePassword: mode === "password",
    });

    if (validationMessage) {
      void alerts.toastError("No se pudo guardar", validationMessage);
      return;
    }

    setIsSaving(true);
    try {
      await usersApi.updateUser(form.id, {
        username: form.username,
        fullName,
        email: form.email.trim().toLowerCase(),
        roleId: form.roleId,
        phone: draft.phone.trim() || null,
        position: draft.position.trim() || null,
        department: draft.department.trim() || null,
        isActive: form.isActive,
        password: mode === "password" ? newPassword : undefined,
      });

      updateUser({
        fullName,
        email: form.email.trim().toLowerCase(),
      });

      if (mode === "password") {
        setNewPassword("");
        setConfirmPassword("");
      }
      await load();
      void alerts.toastSuccess(
        mode === "password" ? "Contrasena actualizada" : "Cambios guardados",
        mode === "password"
          ? "Tu contrasena fue actualizada correctamente."
          : "Tu informacion fue actualizada correctamente."
      );
    } catch (error: unknown) {
      const message = getErrorMessage(error) || "No se pudo actualizar tu cuenta.";
      void alerts.toastError("No se pudo guardar", message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarChange(file: File) {
    if (!form) return;
    if (!file.type.startsWith("image/")) {
      const message = "Solo puedes usar imagenes como foto de perfil.";
      setError(message);
      void alerts.toastError("Archivo no permitido", message);
      return;
    }

    setError(null);
    setIsAvatarSaving(true);

    try {
      const res = await usersApi.uploadAvatar(form.id, file);
      const updated = res.data;
      const profilePhotoUrl = updated.profile_photo_url ?? null;

      setForm((current) => (current ? { ...current, profilePhotoUrl } : current));
      updateUser({ profilePhotoUrl });
      await refreshAvatarPreview(form.id, profilePhotoUrl);

      void alerts.toastSuccess("Foto actualizada");
    } catch (error: unknown) {
      const message = getErrorMessage(error) || "No se pudo actualizar la foto de perfil.";
      void alerts.toastError("No se pudo actualizar la foto", message);
    } finally {
      setIsAvatarSaving(false);
    }
  }

  async function handleAvatarDelete() {
    if (!form) return;

    setError(null);
    setIsAvatarSaving(true);

    try {
      const res = await usersApi.deleteAvatar(form.id);
      const profilePhotoUrl = res.data.profile_photo_url ?? null;

      setForm((current) => (current ? { ...current, profilePhotoUrl } : current));
      setAvatarObjectUrl(null);
      updateUser({ profilePhotoUrl });

      void alerts.toastSuccess("Foto eliminada");
    } catch (error: unknown) {
      const message = getErrorMessage(error) || "No se pudo eliminar la foto de perfil.";
      void alerts.toastError("No se pudo eliminar la foto", message);
    } finally {
      setIsAvatarSaving(false);
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
        {error ?? "No se pudo cargar la informacion."}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="w-full max-w-none space-y-6"
    >
      <AccountHeader form={form} avatarSrc={avatarSrc} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "data" ? (
        <DataPanel
          form={form}
          draft={draft}
          isSaving={isSaving}
          isAvatarSaving={isAvatarSaving}
          avatarSrc={avatarSrc}
          onDraftChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          onFormChange={(patch) => setForm((current) => (current ? { ...current, ...patch } : current))}
          onSave={() => handleSave("profile")}
          onAvatarChange={handleAvatarChange}
          onAvatarDelete={handleAvatarDelete}
        />
      ) : (
        <SecurityPanel
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          isSaving={isSaving}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onShowNewPasswordChange={setShowNewPassword}
          onShowConfirmPasswordChange={setShowConfirmPassword}
          onSave={() => handleSave("password")}
        />
      )}
    </motion.div>
  );
}

function validateAccountSave({
  fullName,
  email,
  newPassword,
  confirmPassword,
  requirePassword,
}: {
  fullName: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
  requirePassword: boolean;
}) {
  if (!fullName) return "El nombre es requerido.";
  if (!email.trim()) return "El email es requerido.";
  if (!requirePassword) return null;
  if (!(newPassword || confirmPassword)) {
    return "Ingresa una nueva contrasena y su confirmacion.";
  }
  if (!newPassword) return "Ingresa la nueva contrasena.";
  if (!confirmPassword) return "Confirma la nueva contrasena.";
  if (newPassword.length < 8) return "La contrasena debe tener al menos 8 caracteres.";
  if (newPassword !== confirmPassword) return "Las contrasenas no coinciden.";
  return null;
}
