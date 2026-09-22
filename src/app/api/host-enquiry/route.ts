import { NextResponse } from "next/server";

const seen = new Set<string>();

/** Stores a host enquiry. Wire to your CRM/email provider; until then it is logged server-side. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const s = (k: string, max = 200) => (typeof b[k] === "string" ? (b[k] as string).trim().slice(0, max) : "");
  if (s("name").length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s("email")) || s("phone").replace(/\D/g, "").length < 9 || s("town").length < 2 || !s("type")) {
    return NextResponse.json({ ok: false, error: "Please complete your name, email, phone, town and property type." }, { status: 400 });
  }
  const key = s("idempotencyKey", 80);
  if (key && seen.has(key)) return NextResponse.json({ ok: true, duplicate: true });
  if (key) seen.add(key);
  console.info("[host-enquiry]", { name: s("name"), town: s("town"), type: s("type") });
  return NextResponse.json({ ok: true });
}
