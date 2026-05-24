/**
 * Parse a consecutivo string into its parts.
 * Example: "COT-2026-001" → { tipo: "COT", anio: 2026, numero: 1 }
 */
export function parseConsecutivo(consecutivo: string) {
  const parts = consecutivo.split("-");
  if (parts.length !== 3) return null;
  return {
    tipo: parts[0],
    anio: parseInt(parts[1], 10),
    numero: parseInt(parts[2], 10),
  };
}

/**
 * Build a consecutivo string from parts.
 * Example: ("COT", 2026, 1) → "COT-2026-001"
 */
export function buildConsecutivo(tipo: string, anio: number, numero: number): string {
  return `${tipo}-${anio}-${String(numero).padStart(3, "0")}`;
}
