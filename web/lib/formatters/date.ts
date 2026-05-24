/**
 * Format a date string or Date as "23 de mayo de 2026"
 */
export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(date);
}

/**
 * Format a date as ISO string YYYY-MM-DD
 */
export function formatDateISO(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().split("T")[0];
}
