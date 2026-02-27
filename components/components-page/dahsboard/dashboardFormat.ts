export function hoursToDhM(hours: number) {
  if (!Number.isFinite(hours) || hours <= 0) return "0 min";

  const totalMinutes = Math.round(hours * 60);
  const d = Math.floor(totalMinutes / (60 * 24));
  const h = Math.floor((totalMinutes - d * 60 * 24) / 60);
  const m = totalMinutes - d * 60 * 24 - h * 60;

  const parts: string[] = [];
  if (d > 0) parts.push(`${d} d`);
  if (h > 0) parts.push(`${h} h`);
  if (d === 0 && m > 0) parts.push(`${m} min`); // si hay días, el minuto suele ser ruido
  return parts.join(" ");
}

export function clampTopN<T>(arr: T[], n: number) {
  return arr.slice(0, Math.max(0, n));
}