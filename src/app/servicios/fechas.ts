/**
 * Utilidades para LocalDateTime del backend (sin zona horaria).
 * Un <input type="datetime-local"> da "2026-11-20T15:00"; el backend acepta ese formato
 * y también "2026-11-20T15:00:00".
 */

/** "2026-11-20T15:00" → "2026-11-20T15:00:00" */
export function aLocalDateTime(valorInput: string): string {
  return valorInput && valorInput.length === 16 ? `${valorInput}:00` : valorInput;
}

/** "2026-11-20T15:00:00" → "2026-11-20T15:00" (para precargar un datetime-local) */
export function aInputLocal(valor: string | null | undefined): string {
  return valor ? valor.substring(0, 16) : '';
}

/** Fecha actual en formato datetime-local, útil como mínimo del input. */
export function ahoraInputLocal(minutosExtra = 0): string {
  const d = new Date(Date.now() + minutosExtra * 60000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Interpreta un LocalDateTime como hora local del navegador. */
export function parseLocal(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
}
