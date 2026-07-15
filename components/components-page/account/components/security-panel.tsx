"use client";

import {
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

function RequirementRow({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={[
          "flex size-5 shrink-0 items-center justify-center rounded-full border",
          valid ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-muted-foreground/30 text-muted-foreground",
        ].join(" ")}
      >
        <Check className="size-3" />
      </span>
      <span className={valid ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function getPasswordStrength(password: string) {
  if (!password) {
    return {
      score: 0,
      label: "Sin evaluar",
      colorClass: "bg-muted",
      textClass: "text-muted-foreground",
    };
  }

  const checks = [
    password.length >= 8,
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;

  if (score <= 1) {
    return {
      score,
      label: "Debil",
      colorClass: "bg-red-500",
      textClass: "text-red-600",
    };
  }

  if (score <= 3) {
    return {
      score,
      label: "Media",
      colorClass: "bg-amber-500",
      textClass: "text-amber-600",
    };
  }

  if (score === 4) {
    return {
      score,
      label: "Fuerte",
      colorClass: "bg-emerald-500",
      textClass: "text-emerald-600",
    };
  }

  return {
    score,
    label: "Muy fuerte",
    colorClass: "bg-emerald-600",
    textClass: "text-emerald-700",
  };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-3 text-sm font-semibold">
          <ShieldCheck className={["size-5", strength.textClass].join(" ")} />
          <span className={strength.textClass}>Seguridad: {strength.label}</span>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-5 gap-1.5">
          {Array.from({ length: 5 }).map((_, index) => {
            const active = index < strength.score;
            return (
              <span
                key={index}
                className={[
                  "h-1.5 rounded-full transition-colors",
                  active ? strength.colorClass : "bg-muted",
                ].join(" ")}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SecurityPanel({
  newPassword,
  confirmPassword,
  isSaving,
  showNewPassword,
  showConfirmPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onShowNewPasswordChange,
  onShowConfirmPasswordChange,
  onSave,
}: {
  newPassword: string;
  confirmPassword: string;
  isSaving: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onShowNewPasswordChange: (value: boolean) => void;
  onShowConfirmPasswordChange: (value: boolean) => void;
  onSave: () => void;
}) {
  const hasPasswordInput = Boolean(newPassword || confirmPassword);
  const meetsLength = newPassword.length >= 8;
  const matchesConfirmation = hasPasswordInput && newPassword === confirmPassword;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="rounded-xl p-6">
        <div>
          <h2 className="text-base font-bold">Cambiar contrasena</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-semibold">
              Nueva contraseña
            </Label>
            <PasswordInput
              id="newPassword"
              value={newPassword}
              onChange={onNewPasswordChange}
              visible={showNewPassword}
              onVisibleChange={onShowNewPasswordChange}
              placeholder="Nueva contraseña"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">Minimo 8 caracteres.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold">
              Confirmar contraseña
            </Label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={onConfirmPasswordChange}
              visible={showConfirmPassword}
              onVisibleChange={onShowConfirmPasswordChange}
              placeholder="Confirmar contraseña"
              disabled={isSaving}
            />
          </div>
        </div>

        <PasswordStrengthMeter password={newPassword} />

        <div className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3 text-sm text-muted-foreground">

          </div>
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="h-11 shrink-0 gap-2 rounded-lg bg-foreground px-6 text-background shadow-sm hover:bg-foreground/90"
          >
            {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
            {isSaving ? "Actualizando..." : "Actualizar contrasena"}
          </Button>
        </div>
      </Card>

      <div className="space-y-5">
        <Card className="rounded-xl p-6">
          <div className="flex items-center gap-3">

            <div>
              <h2 className="text-base font-bold">Requisitos de contrasena</h2>
              <p className="mt-1 text-sm text-muted-foreground">Verifica tu nueva contrasena antes de guardar.</p>
            </div>
          </div>
          <div className="space-y-3 rounded-lg border p-4">
            <RequirementRow valid={meetsLength} label="Debe tener al menos 8 caracteres." />
            <RequirementRow valid={matchesConfirmation} label="Debe coincidir con la confirmacion." />
          </div>
        </Card>

        <Card className="rounded-xl p-6">
          <div className="flex items-center gap-3">

            <div>
              <h2 className="text-base font-bold">Buenas practicas</h2>
              <p className="mt-1 text-sm text-muted-foreground">Recomendaciones utiles para reducir riesgos.</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>Evita reutilizar contrasenas de otros sistemas.</span>
            </div>
            <div className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>Usa una combinacion que no incluya datos personales evidentes.</span>
            </div>
            <div className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>Cambia la contrasena si sospechas que alguien mas pudo verla.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
