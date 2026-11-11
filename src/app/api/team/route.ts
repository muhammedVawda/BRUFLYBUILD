import { NextResponse } from "next/server";
import { getBooking, transition, type BookingStatus } from "@/lib/bookings-store";

/**
 * Team console API. Protected by TEAM_TOKEN (set in the environment). This is
 * how a request becomes Awaiting confirmation, Confirmed or Unavailable: a
 * person moves it, never a browser redirect. Replace with real auth before
 * production.
 */
const allowed: Record<BookingStatus, BookingStatus[]> = {
  request_received: ["awaiting_confirmation", "confirmed", "declined", "cancelled"],
  awaiting_confirmation: ["confirmed", "declined", "cancelled"],
  confirmed: ["cancelled"],
  declined: [],
  cancelled: [],
};

function authorised(req: Request): boolean {
  const token = process.env.TEAM_TOKEN;
  if (!token) return false;
  return req.headers.get("x-team-token") === token;
}

export async function POST(req: Request) {
  if (!authorised(req)) return NextResponse.json({ ok: false, error: "Not authorised. Set TEAM_TOKEN and send it as x-team-token." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { ref?: string; status?: BookingStatus; note?: string };
  const booking = b.ref ? getBooking(b.ref) : undefined;
  if (!booking) return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
  if (!b.status || !allowed[booking.status].includes(b.status)) {
    return NextResponse.json({ ok: false, error: `Cannot move ${booking.status} to ${b.status ?? "?"}.` }, { status: 409 });
  }
  const defaults: Record<BookingStatus, string> = {
    request_received: "",
    awaiting_confirmation: "BruFly has sent your request to the supplier and is waiting for their confirmation.",
    confirmed: "Confirmed by the supplier. Payment instructions have been emailed to you.",
    declined: "The supplier could not confirm this booking. Nothing has been charged.",
    cancelled: "Cancelled by the BruFly team at your request.",
  };
  const updated = transition(booking.ref, b.status, (b.note ?? "").slice(0, 500) || defaults[b.status]);
  console.info("[email stub]", { to: booking.contact.email, subject: `BruFly ${booking.ref}: ${b.status}` });
  return NextResponse.json({ ok: true, booking: updated });
}
