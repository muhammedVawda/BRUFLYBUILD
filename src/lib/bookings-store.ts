/**
 * In-memory booking store.
 *
 * This is a stand-in for the real database. It keeps the server-side
 * behaviour honest (idempotency, status transitions, price re-validation)
 * without pretending a payment provider is connected. Replace `store` with
 * your database client; keep the interface.
 */
import { randomBytes } from "node:crypto";
import type { BookingStatus } from "@/lib/booking-status";
export { statusCopy, type BookingStatus } from "@/lib/booking-status";

export type BookingKind = "stay" | "flight";

export interface BookingRecord {
  ref: string;
  kind: BookingKind;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  /** Idempotency key from the client, to reject duplicate submissions. */
  idempotencyKey: string;
  /** Snapshot of what the customer accepted. */
  summary: Record<string, unknown>;
  totalZar: number;
  contact: { name: string; email: string; phone: string };
  /** Free-text history for the customer-facing timeline. */
  timeline: { at: string; status: BookingStatus; note: string }[];
}

const store = new Map<string, BookingRecord>();
const byIdempotency = new Map<string, string>();

function makeRef(kind: BookingKind): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let s = "";
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `${kind === "stay" ? "BS" : "BF"}-${s}`;
}

export function createBooking(input: {
  kind: BookingKind;
  idempotencyKey: string;
  summary: Record<string, unknown>;
  totalZar: number;
  contact: BookingRecord["contact"];
  initialNote: string;
}): { record: BookingRecord; duplicate: boolean } {
  const existingRef = byIdempotency.get(input.idempotencyKey);
  if (existingRef) {
    const existing = store.get(existingRef);
    if (existing) return { record: existing, duplicate: true };
  }
  const now = new Date().toISOString();
  let ref = makeRef(input.kind);
  while (store.has(ref)) ref = makeRef(input.kind);
  const record: BookingRecord = {
    ref,
    kind: input.kind,
    status: "request_received",
    createdAt: now,
    updatedAt: now,
    idempotencyKey: input.idempotencyKey,
    summary: input.summary,
    totalZar: input.totalZar,
    contact: input.contact,
    timeline: [{ at: now, status: "request_received", note: input.initialNote }],
  };
  store.set(ref, record);
  byIdempotency.set(input.idempotencyKey, ref);
  return { record, duplicate: false };
}

export function getBooking(ref: string): BookingRecord | undefined {
  return store.get(ref.toUpperCase());
}

export function listBookingsForEmail(email: string): BookingRecord[] {
  const e = email.trim().toLowerCase();
  return [...store.values()].filter((b) => b.contact.email.toLowerCase() === e).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function transition(ref: string, status: BookingStatus, note: string): BookingRecord | undefined {
  const b = store.get(ref);
  if (!b) return undefined;
  const now = new Date().toISOString();
  b.status = status;
  b.updatedAt = now;
  b.timeline.push({ at: now, status, note });
  return b;
}

