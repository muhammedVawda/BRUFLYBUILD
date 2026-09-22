import { NextResponse } from "next/server";
import { getProperty } from "@/lib/data/properties";
import { quoteStay } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/** Server-side quote. The client never computes prices it will be charged. */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const p = getProperty(slug);
  if (!p) return NextResponse.json({ ok: false, error: { code: "not_found", message: "Stay not found." } }, { status: 404 });
  const u = new URL(req.url);
  const adults = Number(u.searchParams.get("adults") ?? 2);
  const children = Number(u.searchParams.get("children") ?? 0);
  const rooms = Number(u.searchParams.get("rooms") ?? 1);
  const childAges = (u.searchParams.get("ages") ?? "").split(",").filter(Boolean).map(Number);
  const result = quoteStay(p, u.searchParams.get("checkin") ?? "", u.searchParams.get("checkout") ?? "", { adults, children, childAges, rooms });
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" }, status: result.ok ? 200 : 422 });
}
