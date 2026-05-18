"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  CircleCheck,
  Eye,
  EyeOff,
  Globe2,
  Info,
  Laptop,
  LockKeyhole,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  User2,
  UsersRound,
} from "lucide-react";

import { usersApi } from "@/api/users/users.api";
import { getErrorMessage } from "@/lib/errors/get-error-message";
import { tokenStorage } from "@/utils/storage/token.storage";
import type { AuthUser } from "@/types/auth/auth.types";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AccountTab = "data" | "security";

type AccountFormState = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roleId: string;
  roleCode: string;
  isActive: boolean;
};

type PersonalDraft = {
  firstName: string;
  lastName: string;
  phone: string;
  position: string;
  department: string;
  timezone: string;
  emailNotifications: boolean;
  platformNotifications: boolean;
};

function getLoggedAuthUser(): AuthUser {
  const user = tokenStorage.getUser<AuthUser>();
  if (!user?.id) throw new Error("No se encontro userId del usuario logeado.");
  return user;
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] ?? "", lastName: "" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

function getInitials(name?: string | null) {
  const parts = String(name || "")
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "US";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getRoleLabel(roleCode?: string | null) {
  if (!roleCode) return "Usuario";
  if (roleCode === "ADMIN" || roleCode === "ADMINISTRADOR") return "Administrador";
  return roleCode
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function AccountField({
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
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </Label>
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        {children}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function AccountTabs({
  value,
  onChange,
}: {
  value: AccountTab;
  onChange: (value: AccountTab) => void;
}) {
  const tabs = [
    { value: "data" as const, label: "Mis Datos", icon: User2 },
    { value: "security" as const, label: "Seguridad", icon: LockKeyhole },
  ];

  return (
    <div className="border-b">
      <div className="flex gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = value === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={[
                "relative flex h-13 min-w-36 items-center justify-center gap-2 px-4 text-sm font-semibold transition",
                active ? "text-blue-600" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-4" />
              {tab.label}
              {active ? (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-600" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b p-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={[
          "relative h-6 w-11 rounded-full transition",
          checked ? "bg-blue-600" : "bg-muted",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 size-4 rounded-full bg-background shadow transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function AccountHeader({
  form,
  activeTab,
  onTabChange,
}: {
  form: AccountFormState;
  activeTab: AccountTab;
  onTabChange: (value: AccountTab) => void;
}) {
  const initials = getInitials(form.fullName || form.username);

  return (
    <section className="space-y-7">
      <div className="flex items-center gap-5">
        <Avatar className="size-18 bg-blue-100 text-blue-700">
          <AvatarFallback className="bg-blue-100 text-2xl font-bold text-blue-700">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            Hola, {form.fullName || form.username}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra tu informacion personal y la seguridad de tu cuenta.
          </p>
        </div>
      </div>
      <AccountTabs value={activeTab} onChange={onTabChange} />
    </section>
  );
}

function DataPanel({
  form,
  draft,
  isSaving,
  onDraftChange,
  onFormChange,
  onSave,
}: {
  form: AccountFormState;
  draft: PersonalDraft;
  isSaving: boolean;
  onDraftChange: (patch: Partial<PersonalDraft>) => void;
  onFormChange: (patch: Partial<AccountFormState>) => void;
  onSave: () => void;
}) {
  const initials = getInitials(`${draft.firstName} ${draft.lastName}`.trim() || form.username);
  const roleLabel = getRoleLabel(form.roleCode);

  return (
    <div className="space-y-5">
      <Card className="rounded-xl p-6">
        <div>
          <h2 className="text-lg font-bold">Informacion personal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manten tu informacion personal actualizada.
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
            <AccountField label="Area o Departamento (opcional)" htmlFor="department" icon={<Building2 className="size-4" />}>
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
            <Save className="size-4" />
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
            <Button type="button" variant="outline" className="gap-2">
              <Upload className="size-4" />
              Cambiar foto
            </Button>
            <Button type="button" variant="outline" className="gap-2 text-destructive hover:text-destructive">
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </div>
        </Card>

        <Card className="rounded-xl p-6">
          <div>
            <h2 className="text-base font-bold">Preferencias de notificacion</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Elige como quieres recibir las notificaciones del sistema.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <ToggleRow
              icon={<Bell className="size-5" />}
              title="Notificaciones por email"
              description="Recibe notificaciones importantes en tu correo electronico."
              checked={draft.emailNotifications}
              onCheckedChange={(checked) => onDraftChange({ emailNotifications: checked })}
            />
            <ToggleRow
              icon={<MessageSquare className="size-5" />}
              title="Notificaciones en la plataforma"
              description="Recibe alertas dentro de la plataforma."
              checked={draft.platformNotifications}
              onCheckedChange={(checked) => onDraftChange({ platformNotifications: checked })}
            />
          </div>
          {/* <div>
            <Button type="button" variant="outline" className="gap-2">
              <Shield className="size-4" />
              Gestionar preferencias
            </Button>
          </div> */}
        </Card>
      </div>
    </div>
  );
}

function PasswordInput({
  id,
  value,
  placeholder,
  disabled,
  visible,
  onVisibleChange,
  onChange,
}: {
  id: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  visible: boolean;
  onVisibleChange: (value: boolean) => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 rounded-lg pl-12 pr-12"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
        onClick={() => onVisibleChange(!visible)}
        aria-label={visible ? "Ocultar contrasena" : "Mostrar contrasena"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}

function SecurityPanel({
  currentPassword,
  newPassword,
  confirmPassword,
  isSaving,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onShowCurrentPasswordChange,
  onShowNewPasswordChange,
  onShowConfirmPasswordChange,
  onSave,
}: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isSaving: boolean;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onShowCurrentPasswordChange: (value: boolean) => void;
  onShowNewPasswordChange: (value: boolean) => void;
  onShowConfirmPasswordChange: (value: boolean) => void;
  onSave: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <Card className="rounded-xl p-6">
            <div>
              <h2 className="text-base font-bold">Cambiar contrasena</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Actualiza tu contrasena regularmente para mantener tu cuenta segura.
              </p>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-semibold">
                  Contrasena actual
                </Label>
                <PasswordInput
                  id="currentPassword"
                  value={currentPassword}
                  onChange={onCurrentPasswordChange}
                  visible={showCurrentPassword}
                  onVisibleChange={onShowCurrentPasswordChange}
                  placeholder="Ingresa tu contrasena actual"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-semibold">
                  Nueva contrasena
                </Label>
                <PasswordInput
                  id="newPassword"
                  value={newPassword}
                  onChange={onNewPasswordChange}
                  visible={showNewPassword}
                  onVisibleChange={onShowNewPasswordChange}
                  placeholder="Ingresa tu nueva contrasena"
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  Minimo 8 caracteres. Usa letras, numeros y simbolos.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                  Confirmar nueva contrasena
                </Label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={onConfirmPasswordChange}
                  visible={showConfirmPassword}
                  onVisibleChange={onShowConfirmPasswordChange}
                  placeholder="Confirma tu nueva contrasena"
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="h-11 gap-2 rounded-lg bg-foreground px-6 text-background shadow-sm hover:bg-foreground/90"
              >
                <LockKeyhole className="size-4" />
                {isSaving ? "Actualizando..." : "Actualizar contrasena"}
              </Button>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-xl p-6">
              <div>
                <h2 className="text-base font-bold">Autenticacion de dos factores (2FA)</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Anade una capa adicional de seguridad a tu cuenta.
                </p>
              </div>
              <div className="flex gap-5">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <ShieldCheck className="size-9" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold">2FA desactivado</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Protege tu cuenta habilitando la verificacion en dos pasos.
                  </p>
                  <Button type="button" variant="outline" className="mt-4 gap-2">
                    <Shield className="size-4" />
                    Habilitar 2FA
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="rounded-xl p-6">
              <div>
                <h2 className="text-base font-bold">Sesiones activas</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Gestiona los dispositivos donde has iniciado sesion.
                </p>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Laptop className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">Chrome en Windows</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Santiago, Chile · IP: 190.128.XX.XX
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <div className="rounded-md bg-blue-50 px-2 py-1 font-semibold text-blue-700">
                      Sesion actual
                    </div>
                    <div className="mt-1 text-muted-foreground">Ahora</div>
                  </div>
                </div>
              </div>
              <button type="button" className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                Ver todas las sesiones (3)
                <ChevronDown className="size-4 -rotate-90" />
              </button>
            </Card>
          </div>
        </div>

        <Card className="rounded-xl p-6">
          <div>
            <h2 className="text-base font-bold">Actividad reciente</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisa los ultimos accesos realizados a tu cuenta.
            </p>
          </div>
          <div className="divide-y">
            {[
              ["Inicio de sesion exitoso", "15 may 2026, 11:37 a. m."],
              ["Inicio de sesion exitoso", "14 may 2026, 08:22 p. m."],
              ["Cambio de contrasena", "10 may 2026, 03:15 p. m."],
            ].map(([title, date]) => (
              <div key={`${title}-${date}`} className="flex items-center gap-4 py-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Santiago, Chile · IP: 190.128.XX.XX · Chrome en Windows
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">{date}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="rounded-xl border p-4 text-center text-sm text-muted-foreground">
          <Info className="mr-2 inline size-4 text-blue-600" />
          Si detectas actividad sospechosa, cambia tu contrasena inmediatamente o cierra tus sesiones activas.
        </div>
      </div>

      <aside className="space-y-6 rounded-none border-l px-6 py-6 xl:min-h-full">
        <div>
          <h2 className="text-lg font-bold">Que es la pestana de Seguridad?</h2>
          <p className="mt-6 text-sm leading-6 text-muted-foreground">
            La pestana de Seguridad centraliza todas las opciones relacionadas con la proteccion de la cuenta del usuario,
            mas alla de la informacion personal.
          </p>
        </div>

        <div className="space-y-5">
          {[
            ["Cambiar contrasena", "Permite al usuario actualizar su contrasena actual de forma segura."],
            ["Autenticacion de dos factores (2FA)", "Anade una capa extra de seguridad para evitar accesos no autorizados."],
            ["Sesiones activas", "Muestra los dispositivos y ubicaciones donde el usuario tiene su cuenta iniciada."],
            ["Actividad reciente", "Registra los ultimos inicios de sesion y cambios importantes realizados en la cuenta."],
          ].map(([title, description]) => (
            <div key={title} className="flex gap-4">
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
              <div>
                <div className="font-semibold">{title}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
          <div className="flex items-center gap-3 font-semibold">
            <ShieldCheck className="size-5 text-emerald-600" />
            Beneficios
          </div>
          <div className="mt-5 space-y-3 text-sm text-emerald-950/80">
            {[
              "Mejora la seguridad de la cuenta del usuario.",
              "Permite al usuario tener control sobre sus accesos.",
              "Reduce riesgos ante accesos no autorizados.",
            ].map((benefit) => (
              <div key={benefit} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function AccountProfileView() {
  const [activeTab, setActiveTab] = React.useState<AccountTab>("data");
  const [form, setForm] = React.useState<AccountFormState | null>(null);
  const [draft, setDraft] = React.useState<PersonalDraft>({
    firstName: "",
    lastName: "",
    phone: "+56 9 1234 5678",
    position: "Administrador",
    department: "Tecnologia de la Informacion",
    timezone: "America/Santiago",
    emailNotifications: true,
    platformNotifications: true,
  });

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

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
      const user = res.data;
      const names = splitFullName(user.full_name);
      const roleLabel = getRoleLabel(authUser.roleCode);

      setForm({
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        roleId: user.role_id,
        roleCode: authUser.roleCode,
        isActive: user.is_active,
      });
      setDraft((current) => ({
        ...current,
        ...names,
        position: current.position || roleLabel,
      }));
    } catch (error: unknown) {
      setError(getErrorMessage(error) || "No se pudo cargar tu cuenta.");
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

    const fullName = `${draft.firstName} ${draft.lastName}`.trim();
    if (!fullName) return setError("El nombre es requerido.");
    if (!form.email.trim()) return setError("El email es requerido.");

    if (newPassword || confirmPassword || currentPassword) {
      if (newPassword.length < 8) {
        return setError("La contrasena debe tener al menos 8 caracteres.");
      }
      if (newPassword !== confirmPassword) {
        return setError("Las contrasenas no coinciden.");
      }
    }

    setIsSaving(true);
    try {
      await usersApi.updateUser(form.id, {
        username: form.username,
        fullName,
        email: form.email.trim().toLowerCase(),
        roleId: form.roleId,
        isActive: form.isActive,
        password: newPassword ? newPassword : undefined,
      });

      const current = tokenStorage.getUser<AuthUser>();
      if (current?.id === form.id) {
        tokenStorage.setUser({
          ...current,
          fullName,
          email: form.email.trim().toLowerCase(),
        });
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Tus datos fueron actualizados correctamente.");
      await load();
    } catch (error: unknown) {
      setError(getErrorMessage(error) || "No se pudo actualizar tu cuenta.");
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

      <AccountHeader form={form} activeTab={activeTab} onTabChange={setActiveTab} />

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

      {activeTab === "data" ? (
        <DataPanel
          form={form}
          draft={draft}
          isSaving={isSaving}
          onDraftChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          onFormChange={(patch) => setForm((current) => (current ? { ...current, ...patch } : current))}
          onSave={handleSave}
        />
      ) : (
        <SecurityPanel
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          isSaving={isSaving}
          showCurrentPassword={showCurrentPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          onCurrentPasswordChange={setCurrentPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onShowCurrentPasswordChange={setShowCurrentPassword}
          onShowNewPasswordChange={setShowNewPassword}
          onShowConfirmPasswordChange={setShowConfirmPassword}
          onSave={handleSave}
        />
      )}
    </motion.div>
  );
}
