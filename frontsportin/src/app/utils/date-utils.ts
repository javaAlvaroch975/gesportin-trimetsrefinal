/**
 * Utility to normalize date values into an ISO-like date-time string accepted by the backend.
 *
 * The backend expects strings like `YYYY-MM-DDTHH:mm:ss` (note the literal 'T' between date and time).
 *
 * Accepts values like:
 * - Date objects
 * - ISO strings like `2026-03-04T00:00:00Z` or `2026-03-04T00:00:00`
 * - Strings like `2026-03-04 00:00:00` or `2026-03-04`
 */
export function toIsoDateTime(value: string | Date | null | undefined): string {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    // Normalize Date objects to a date-only value (midnight) to avoid sending current time.
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = value.getFullYear();
    const mm = pad(value.getMonth() + 1);
    const dd = pad(value.getDate());
    return `${yyyy}-${mm}-${dd}T00:00:00`;
  }

  const text = String(value).trim();
  if (!text) {
    return '';
  }

  // Normalize separator between date and time to 'T'
  const normalized = text.replace(' ', 'T');
  let [datePart, timePart = ''] = normalized.split('T');

  // Support dd/MM/yyyy input (common in Spanish locales).
  if (datePart.includes('/') && datePart.split('/').length === 3) {
    const [dd, mm, yyyy] = datePart.split('/');
    // Only convert if the first part looks like a day
    if (dd.length === 2 && mm.length === 2 && yyyy.length === 4) {
      datePart = `${yyyy}-${mm}-${dd}`;
    }
  }

  if (!timePart) {
    return `${datePart}T00:00:00`;
  }

  // Remove timezone/milliseconds if present (e.g., 2026-03-04T00:00:00.000Z or 2026-03-04T00:00:00+01:00).
  const cleanTime = timePart.split(/[.+Z]/)[0];
  const [hour = '00', minute = '00', second = '00'] = cleanTime.split(':');
  const hh = hour.padStart(2, '0');
  const mm = (minute || '00').padStart(2, '0');
  const ss = (second || '00').padStart(2, '0');

  return `${datePart}T${hh}:${mm}:${ss}`;
}
