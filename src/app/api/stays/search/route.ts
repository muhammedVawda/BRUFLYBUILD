import { NextResponse } from "next/server";
import { parseStaySearch } from "@/lib/search-params";
import { searchStays } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = parseStaySearch(url.searchParams);
  const data = searchStays(search);
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
