"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, LogIn, User, Loader2 } from "lucide-react";

import { loginSchemaData, type LoginSchemaData } from "@/schemas/auth/login.schema";
import { useAuth } from "@/hooks/auth/useAuth";
import { alerts } from "@/utils/alerts/alerts";

function LoginSkeleton() {
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="h-7 w-44 rounded bg-muted animate-pulse" />
      <div className="h-4 w-72 rounded bg-muted animate-pulse" />

      <div className="space-y-3 mt-6">
        <div className="h-11 w-full rounded-xl bg-muted animate-pulse" />
        <div className="h-11 w-full rounded-xl bg-muted animate-pulse" />
        <div className="h-11 w-full rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  );
}

export default function LoginForm() {
  const { login, isBootstrapping, isAuthenticated } = useAuth();

  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<LoginSchemaData>({
    resolver: zodResolver(loginSchemaData),
    defaultValues: { username: "", password: "" },
    mode: "onBlur",
  });

  // ✅ Mostrar alerta si venimos por token expirado
  React.useEffect(() => {
    const url = new URL(window.location.href);
    const reason = url.searchParams.get("reason");

    if (reason === "expired") {
      // evita repetir
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.pathname + url.search);

      void alerts.error("Sesión expirada", "Tu sesión expiró. Inicia sesión nuevamente.");
    }
  }, []);

  React.useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      // Si existe next=..., vuelve ahí. Si no, dashboard.
      const url = new URL(window.location.href);
      const next = url.searchParams.get("next");
      window.location.href = next ? next : "/dashboard";
    }
  }, [isBootstrapping, isAuthenticated]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);
      await login(values);
    } catch (e: any) {
      await alerts.error(
        "No se pudo iniciar sesión",
        e?.message ?? "Verifica tus credenciales."
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative bg-gradient-to-br from-neutral-950 to-neutral-800 text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
        <div className="relative p-10 flex flex-col gap-6 w-full">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-2xl bg-white/10 grid place-items-center">
              <LogIn className="size-5" />
            </div>
            <div className="font-semibold tracking-tight text-lg">Request Center</div>
          </div>

          <div className="mt-auto max-w-md">
            <h1 className="text-3xl font-semibold leading-tight">
              Sistema de gestión de solicitudes.
            </h1>
            <p className="mt-3 text-white/70">
              Registro de solicitudes, asignación, seguimiento y estadísticas de gestión.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {isBootstrapping ? (
            <LoginSkeleton />
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Ingresa tus credenciales para acceder.
                </p>
              </div>

              <form className="space-y-4" onSubmit={onSubmit} noValidate>
                <div>
                  <label className="text-sm font-medium">Usuario</label>
                  <div className="mt-2 relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      className="w-full h-11 rounded-xl border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
                      placeholder="Tu usuario"
                      autoComplete="username"
                      {...form.register("username")}
                      aria-invalid={Boolean(form.formState.errors.username)}
                    />
                  </div>
                  {form.formState.errors.username?.message && (
                    <p className="mt-1 text-xs text-red-600">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Contraseña</label>
                  <div className="mt-2 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      className="w-full h-11 rounded-xl border bg-background pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      {...form.register("password")}
                      aria-invalid={Boolean(form.formState.errors.password)}
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password?.message && (
                    <p className="mt-1 text-xs text-red-600">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  Si tienes problemas para ingresar, contacta al administrador.
                </p>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}