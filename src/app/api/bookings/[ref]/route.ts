import { NextResponse } from "next/server";
import { getBooking, transition } from "@/lib/bookings-store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ ref: string }> }) {
  const { ref } = await ctx.params;
  const b = getBooking(ref);
  if (!b) return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
  return NextResponse.json({ ok: true, booking: b }, { headers: { "Cache-Control": "no-store" } });
}

/** Customer-initiated cancellation of a request that is not yet confirmed. */
export async function POST(req: Request, ctx: { params: Promise<{ ref: string }> }) {
  const { ref } = await ctx.params;
  const b = getBooking(ref);
  if (!b) return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
  const body = (await req.json().catch(() => ({}))) as { action?: string; email?: string };
  if (body.action !== "cancel") return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  if ((body.email ?? "").toLowerCase() !== b.contact.email.toLowerCase()) return NextResponse.json({ ok: false, error: "Email address does not match this booking." }, { status: 403 });
  if (b.status === "confirmed") {
    return NextResponse.json({ ok: false, error: "Confirmed bookings are cancelled by our team so the cancellation terms are applied correctly. Please contact us." }, { status: 409 });
  }
  if (b.status === "cancelled" || b.status === "declined") return NextResponse.json({ ok: true, booking: b });
  transition(b.ref, "cancelled", "Request cancelled by the customer before confirmation. Nothing was charged.");
  return NextResponse.json({ ok: true, booking: getBooking(b.ref) });
}
