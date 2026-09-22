import { NextResponse } from "next/server";
import { brupass } from "@/config/business";

const seen = new Map<string, string>();

/** Records a membership REQUEST. Billing needs a subscription/payment provider; none is connected here. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const plan = brupass.plans.find((p) => p.id === body.planId);
  if (!plan) return NextResponse.json({ ok: false, error: "Choose a plan." }, { status: 400 });
  if (body.acceptedTerms !== true) return NextResponse.json({ ok: false, error: "Please accept the terms." }, { status: 400 });
  const key = typeof body.idempotencyKey === "string" ? body.idempotencyKey : "";
  if (!key) return NextResponse.json({ ok: false, error: "Missing key." }, { status: 400 });
  const existing = seen.get(key);
  const ref = existing ?? `BP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  seen.set(key, ref);
  return NextResponse.json({
    ok: true,
    ref,
    message: `We'll email you within one working day with payment instructions for ${plan.name} (${plan.priceZar} rand ${plan.billing === "monthly" ? "per month" : "per year"}). Your membership starts only after payment is received and you have approved the billing terms.`,
  });
}
