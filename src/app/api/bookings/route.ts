import { NextResponse } from "next/server";
import { getProperty } from "@/lib/data/properties";
import { quoteStay } from "@/lib/pricing";
import { createBooking, listBookingsForEmail } from "@/lib/bookings-store";
import { findRoute, getAirport } from "@/lib/data/airports";
import { stayBooking, flightBooking } from "@/config/business";
import { validateDateRange } from "@/lib/dates";

export const dynamic = "force-dynamic";

const rateWindow = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (rateWindow.get(ip) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  rateWindow.set(ip, arr);
  return arr.length > 20;
}

function validContact(c: unknown): c is { name: string; email: string; phone: string } {
  if (!c || typeof c !== "object") return false;
  const { name, email, phone } = c as Record<string, unknown>;
  return (
    typeof name === "string" && name.trim().length >= 2 && name.length <= 120 &&
    typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200 &&
    typeof phone === "string" && phone.replace(/\D/g, "").length >= 9 && phone.length <= 30
  );
}

/**
 * Creates a booking REQUEST. This build has no payment provider connected,
 * so it never captures money and never returns a "confirmed" status.
 * Price is re-validated server-side; if it differs from what the customer
 * accepted, the request is rejected with the new price for re-acceptance.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: "Too many requests. Please wait a minute." }, { status: 429 });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const idem = typeof body.idempotencyKey === "string" && /^[a-zA-Z0-9-]{8,80}$/.test(body.idempotencyKey) ? body.idempotencyKey : null;
  if (!idem) return NextResponse.json({ ok: false, error: "Missing idempotency key." }, { status: 400 });
  if (!validContact(body.contact)) return NextResponse.json({ ok: false, error: "Please check your name, email address and phone number." }, { status: 400 });
  if (body.acceptedTerms !== true) return NextResponse.json({ ok: false, error: "You need to accept the booking terms." }, { status: 400 });

  if (body.kind === "stay") {
    const slug = String(body.slug ?? "");
    const p = getProperty(slug);
    if (!p) return NextResponse.json({ ok: false, error: "Stay not found." }, { status: 404 });
    if (p.bookingMode === "instant" && !stayBooking.paymentProviderConnected) {
      return NextResponse.json({ ok: false, error: "Instant booking with payment is not available yet. Please send a request instead." }, { status: 503 });
    }
    const g = (body.guests ?? {}) as Record<string, unknown>;
    const result = quoteStay(p, String(body.checkin ?? ""), String(body.checkout ?? ""), {
      adults: Number(g.adults ?? 0),
      children: Number(g.children ?? 0),
      childAges: Array.isArray(g.childAges) ? (g.childAges as unknown[]).map(Number) : [],
      rooms: Number(g.rooms ?? 1),
    });
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error.message }, { status: 422 });
    if (result.quote.signature !== body.acceptedSignature) {
      return NextResponse.json(
        { ok: false, priceChanged: true, quote: result.quote, error: "The price or availability for this stay has changed since you reviewed it. Please check the new total and confirm again." },
        { status: 409 },
      );
    }
    const contact = body.contact as { name: string; email: string; phone: string };
    const { record, duplicate } = createBooking({
      kind: "stay",
      idempotencyKey: idem,
      summary: {
        slug: p.slug,
        name: p.name,
        area: p.area,
        checkin: result.quote.checkin,
        checkout: result.quote.checkout,
        nights: result.quote.nights,
        guests: result.quote.guests,
        lines: result.quote.lines,
        cancellation: p.cancellation,
        bookingMode: p.bookingMode,
        message: typeof body.message === "string" ? body.message.slice(0, 1000) : "",
      },
      totalZar: result.quote.totalZar,
      contact,
      initialNote:
        p.bookingMode === "enquiry"
          ? "Enquiry sent to the host. No payment has been taken."
          : `Request sent to the host. No payment has been taken. The host has ${stayBooking.confirmationWindowHours} hours to confirm.`,
    });
    return NextResponse.json({ ok: true, ref: record.ref, status: record.status, duplicate }, { status: duplicate ? 200 : 201 });
  }

  if (body.kind === "flight") {
    const from = getAirport(String(body.from ?? ""));
    const to = getAirport(String(body.to ?? ""));
    const route = from && to ? findRoute(from.code, to.code) : undefined;
    if (!from || !to || !route) return NextResponse.json({ ok: false, error: "We don't request this route yet." }, { status: 422 });
    const depart = String(body.depart ?? "");
    const ret = typeof body.return === "string" && body.return ? body.return : "";
    const v = validateDateRange(depart, ret || depart.replace(/\d{2}$/, (d) => String(Number(d) + 1).padStart(2, "0")));
    if (!v.ok && v.error !== "checkout_invalid") return NextResponse.json({ ok: false, error: "Please check your travel dates." }, { status: 422 });
    const passengers = Math.min(9, Math.max(1, Number(body.passengers ?? 1)));
    const names = Array.isArray(body.passengerNames) ? (body.passengerNames as unknown[]).map(String).map((s) => s.trim().slice(0, 120)) : [];
    if (names.length !== passengers || names.some((n) => n.length < 2)) return NextResponse.json({ ok: false, error: "Enter each passenger's full name as it appears on their ID." }, { status: 400 });
    const contact = body.contact as { name: string; email: string; phone: string };
    const estimate = route.sampleFareFromZar * passengers * (ret ? 2 : 1) + flightBooking.serviceFeeZar;
    const { record, duplicate } = createBooking({
      kind: "flight",
      idempotencyKey: idem,
      summary: { from: from.code, to: to.code, fromCity: from.city, toCity: to.city, depart, return: ret, passengers, passengerNames: names, airline: String(body.airline ?? ""), fareEstimateZar: estimate, fareIsEstimate: true },
      totalZar: estimate,
      contact,
      initialNote: `Request received. A BruFly team member will check the live fare and availability with the airline and confirm within ${flightBooking.confirmationWindowHours} hours. No payment has been taken.`,
    });
    return NextResponse.json({ ok: true, ref: record.ref, status: record.status, duplicate }, { status: duplicate ? 200 : 201 });
  }

  return NextResponse.json({ ok: false, error: "Unknown booking type." }, { status: 400 });
}

/** Lists bookings for an email (demo-grade lookup; real accounts need authentication). */
export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email") ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  const items = listBookingsForEmail(email).map((b) => ({ ref: b.ref, kind: b.kind, status: b.status, createdAt: b.createdAt, totalZar: b.totalZar, summary: b.summary }));
  return NextResponse.json({ ok: true, items }, { headers: { "Cache-Control": "no-store" } });
}
