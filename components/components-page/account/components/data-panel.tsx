"use client";

import * as React from "react";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  Info,
  LoaderCircle,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Trash2,
  Upload,
  User2,
  UsersRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { getInitials, getRoleLabel } from "../account.helpers";
import type { AccountFormState, PersonalDraft } from "../types";
import { AccountField } from "./account-field";
import { ToggleRow } from "./toggle-row";

export function DataPanel({
  form,
  draft,
  isSaving,
  isAvatarSaving,
  avatarSrc,
  onDraftChange,
  onFormChange,
  onSave,
  onAvatarChange,
  onAvatarDelete,
}: {
  form: AccountFormState;
  draft: PersonalDraft;
  isSaving: boolean;
  isAvatarSaving: boolean;
  avatarSrc?: string | null;
  onDraftChange: (patch: Partial<PersonalDraft>) => void;
  onFormChange: (patch: Partial<AccountFormState>) => void;
  onSave: () => void;
  onAvatarChange: (file: File) => void;
  onAvatarDelete: () => void;
}) {
  const initials = getInitials(`${draft.firstName} ${draft.lastName}`.trim() || form.username);
  const roleLabel = getRoleLabel(form.roleCode);
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-5">
      <Card className="rounded-xl p-6">
        <div>
          <h2 className="text-lg font-bold">Informacion personal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manten tu informacion actualizada.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <AccountField label="Usuario" htmlFor="username" icon={<User2 className="size-4" />}>
              <Input id="username" value={form.username} disabled className="h-11 rounded-lg pl-12" />
            </AccountField>
            <AccountField label="Nombre" htmlFor="firstName" icon={<UsersRound className="size-4" />}>
              <Input
                id="firstName"
                value={draft.firstName}
                onChange={(event) => onDraftChange({ firstName: event.target.value })}
                disabled={isSaving}
                className="h-11 rounded-lg pl-12"
              />
            </AccountField>
            <AccountField label="Apellido" htmlFor="lastName" icon={<UsersRound className="size-4" />}>
              <Input
                id="lastName"
                value={draft.lastName}
                onChange={(event) => onDraftChange({ lastName: event.target.value })}
                disabled={isSaving}
                className="h-11 rounded-lg pl-12"
              />
            </AccountField>
            <AccountField label="Email" htmlFor="email" icon={<Mail className="size-4" />}>
              <Input
                id="email"
                value={form.email}
                onChange={(event) => onFormChange({ email: event.target.value })}
                disabled={isSaving}
                className="h-11 rounded-lg pl-12"
              />
            </AccountField>
          </div>

          <div className="space-y-5">
            <AccountField label="Telefono (opcional)" htmlFor="phone" icon={<Phone className="size-4" />}>
              <Input
                id="phone"
                value={draft.phone}
                onChange={(event) => onDraftChange({ phone: event.target.value })}
                disabled={isSaving}
                className="h-11 rounded-lg pl-12"
              />
            </AccountField>
            <AccountField label="Cargo (opcional)" htmlFor="position" icon={<BriefcaseBusiness className="size-4" />}>
              <Input
                id="position"
                value={draft.position}
                onChange={(event) => onDraftChange({ position: event.target.value })}
                disabled={isSaving}
                className="h-11 rounded-lg pl-12"
              />
            </AccountField>
            <AccountField
              label="Area o Departamento (opcional)"
              htmlFor="department"
              icon={<Building2 className="size-4" />}
            >
              <Input
                id="department"
                value={draft.department}
                onChange={(event) => onDraftChange({ department: event.target.value })}
                disabled={isSaving}
                className="h-11 rounded-lg pl-12"
              />
            </AccountField>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              Esta informacion se utiliza para personalizar tu experiencia y facilitar la comunicacion dentro del sistema.
            </span>
          </div>
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="h-11 gap-2 rounded-lg bg-foreground px-6 text-background shadow-sm hover:bg-foreground/90"
          >
            {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-xl p-6">
          <div>
            <h2 className="text-base font-bold">Foto de perfil</h2>
            <p className="mt-1 text-sm text-muted-foreground">Personaliza tu foto de perfil.</p>
          </div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="size-24 bg-blue-100 text-blue-700">
              {avatarSrc ? (
                <AvatarImage
                  src={avatarSrc}
                  alt={`${draft.firstName} ${draft.lastName}`.trim() || form.username}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-blue-100 text-3xl font-bold text-blue-700">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-bold">
                {`${draft.firstName} ${draft.lastName}`.trim() || form.username}
              </div>
              <div className="text-sm text-muted-foreground">{roleLabel}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onAvatarChange(file);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={isAvatarSaving}
              onClick={() => avatarInputRef.current?.click()}
            >
              {isAvatarSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {isAvatarSaving ? "Subiendo..." : "Cambiar foto"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive"
              disabled={isAvatarSaving || !avatarSrc}
              onClick={onAvatarDelete}
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </div>
        </Card>

        <Card className="rounded-xl p-6">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold">Preferencias de notificacion</h2>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                Proximamente
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Este modulo estara disponible en una proxima integracion.
            </p>
          </div>
          <div className="pointer-events-none overflow-hidden rounded-xl border bg-muted/20">
            <ToggleRow
              icon={<Bell className="size-5" />}
              title="Notificaciones por email"
              description="Recibe notificaciones importantes en tu correo electronico."
              checked={draft.emailNotifications}
              onCheckedChange={(checked) => onDraftChange({ emailNotifications: checked })}
              disabled
            />
            <ToggleRow
              icon={<MessageSquare className="size-5" />}
              title="Notificaciones en la plataforma"
              description="Recibe alertas dentro de la plataforma."
              checked={draft.platformNotifications}
              onCheckedChange={(checked) => onDraftChange({ platformNotifications: checked })}
              disabled
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

