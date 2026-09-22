/** Date helpers. All dates are handled as ISO `YYYY-MM-DD` strings in local time. */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string | null | undefined): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export function today(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Whole nights between two ISO dates. Returns 0 for invalid or non-positive ranges. */
export function nightsBetween(checkin: string, checkout: string): number {
  const a = parseISODate(checkin);
  const b = parseISODate(checkout);
  if (!a || !b) return 0;
  const ms = b.getTime() - a.getTime();
  const nights = Math.round(ms / 86_400_000);
  return nights > 0 ? nights : 0;
}

export type DateRangeError =
  | "checkin_invalid"
  | "checkout_invalid"
  | "checkin_past"
  | "checkout_not_after_checkin"
  | "too_long";

/** Validates a stay date range. Max 30 nights. */
export function validateDateRange(
  checkin: string | null | undefined,
  checkout: string | null | undefined,
  now: Date = today(),
): { ok: true; nights: number } | { ok: false; error: DateRangeError } {
  const a = parseISODate(checkin);
  if (!a) return { ok: false, error: "checkin_invalid" };
  const b = parseISODate(checkout);
  if (!b) return { ok: false, error: "checkout_invalid" };
  if (a.getTime() < now.getTime()) return { ok: false, error: "checkin_past" };
  const nights = nightsBetween(checkin!, checkout!);
  if (nights <= 0) return { ok: false, error: "checkout_not_after_checkin" };
  if (nights > 30) return { ok: false, error: "too_long" };
  return { ok: true, nights };
}

export const dateRangeMessages: Record<DateRangeError, string> = {
  checkin_invalid: "Choose a check-in date.",
  checkout_invalid: "Choose a check-out date.",
  checkin_past: "Check-in can't be in the past.",
  checkout_not_after_checkin: "Check-out must be after check-in.",
  too_long: "Stays are limited to 30 nights. Contact us for longer stays.",
};

const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "Fri, 3 Oct" */
export function formatShort(iso: string): string {
  const d = parseISODate(iso);
  if (!d) return "";
  return `${weekdaysShort[d.getDay()]}, ${d.getDate()} ${monthsShort[d.getMonth()]}`;
}

/** "3 Oct 2026" */
export function formatLong(iso: string): string {
  const d = parseISODate(iso);
  if (!d) return "";
  return `${d.getDate()} ${monthsShort[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatRange(checkin: string, checkout: string): string {
  const a = parseISODate(checkin);
  const b = parseISODate(checkout);
  if (!a || !b) return "";
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()}–${b.getDate()} ${monthsShort[a.getMonth()]} ${a.getFullYear()}`;
  }
  return `${a.getDate()} ${monthsShort[a.getMonth()]} – ${b.getDate()} ${monthsShort[b.getMonth()]} ${b.getFullYear()}`;
}
