export const statusColorsByCode: Record<string, string> = {
  UNASSIGNED: "#6B7280",   // gris
  ASSIGNED: "#3B82F6",     // azul
  IN_PROGRESS: "#F59E0B",  // ámbar/naranja
  COMPLETED: "#22C55E",    // verde (si usas code distinto, ajusta)
  DONE: "#22C55E",
  TERMINATED: "#22C55E",
  TERMINADO: "#22C55E",
};

export const priorityColorsByCode: Record<string, string> = {
  LOW: "#22C55E",
  BAJA: "#22C55E",
  MEDIUM: "#F59E0B",
  MEDIA: "#F59E0B",
  HIGH: "#EF4444",
  ALTA: "#EF4444",
};

// fallback
export const neutral = {
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  bg: "#FFFFFF",
};

export function colorByStatusCode(code?: string) {
  if (!code) return "#9CA3AF";
  return statusColorsByCode[code.toUpperCase()] ?? "#9CA3AF";
}

export function colorByPriorityCode(code?: string) {
  if (!code) return "#9CA3AF";
  return priorityColorsByCode[code.toUpperCase()] ?? "#9CA3AF";
}