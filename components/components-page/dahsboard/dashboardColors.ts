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

// Colores del grafico "Activas por grupo".
// Mantener tonos bien separados para evitar confusiones entre categorias.
export const groupColorsByName: Record<string, string> = {
  ANALISIS_CRIMINAL: "#009E73",      // verde
  EXTRACCION_TELEFONICA: "#0072B2",  // azul
  OFICIO_609: "#CC79A7",             // morado
  PATRIMONIAL: "#D55E00",            // naranjo/rojo
};

export const groupFallbackColors = [
  "#F0E442", // amarillo
  "#56B4E9", // celeste
  "#7F3C8D", // violeta oscuro
  "#11A579", // turquesa
  "#3969AC", // azul oscuro
  "#E73F74", // rosado fuerte
];

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

export function colorByGroupName(name?: string, fallbackIndex = 0) {
  if (!name) return groupFallbackColors[fallbackIndex % groupFallbackColors.length] ?? "#9CA3AF";

  const key = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return groupColorsByName[key] ?? groupFallbackColors[fallbackIndex % groupFallbackColors.length] ?? "#9CA3AF";
}
