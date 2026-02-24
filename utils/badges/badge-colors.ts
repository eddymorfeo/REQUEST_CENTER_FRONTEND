// src/utils/badges/badge-colors.ts
type MaybeString = string | null | undefined;

function norm(value: MaybeString) {
  return (value ?? "").toString().trim().toUpperCase();
}

/**
 * Paleta:
 * - UNASSIGNED: gris
 * - ASSIGNED: azul
 * - IN_PROGRESS: ámbar
 * - DONE/TERMINADO: verde
 */
export function statusBadgeClass(statusCodeOrName: MaybeString) {
  const v = norm(statusCodeOrName);

  if (v.includes("UNASSIGNED") || v.includes("SIN ASIGNAR")) {
    return "bg-slate-100 text-slate-700 border-slate-200";
  }
  if (v.includes("ASSIGNED") || v.includes("ASIGNADO")) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  if (v.includes("IN_PROGRESS") || v.includes("EN PROGRESO")) {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }
  if (v.includes("DONE") || v.includes("TERMINADO") || v.includes("COMPLET")) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return "bg-muted text-foreground border-border";
}

/**
 * Paleta:
 * - LOW/BAJA: verde suave
 * - MEDIUM/MEDIA: ámbar suave
 * - HIGH/ALTA: rojo suave
 */
export function priorityBadgeClass(priorityCodeOrName: MaybeString) {
  const v = norm(priorityCodeOrName);

  if (v.includes("LOW") || v.includes("BAJA")) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (v.includes("MEDIUM") || v.includes("MEDIA")) {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }
  if (v.includes("HIGH") || v.includes("ALTA")) {
    return "bg-rose-100 text-rose-700 border-rose-200";
  }

  return "bg-muted text-foreground border-border";
}