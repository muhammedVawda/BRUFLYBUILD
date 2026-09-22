import { NextResponse } from "next/server";
import { findRoute, getAirport } from "@/lib/data/airports";

export const dynamic = "force-dynamic";

/**
 * SAMPLE fare options. There is no airline/GDS integration in this build,
 * so results are explicitly labelled as sample fares and the booking is a
 * request that the BruFly team prices with the airline before confirming.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const from = getAirport(u.searchParams.get("from"));
  const to = getAirport(u.searchParams.get("to"));
  const route = from && to ? findRoute(from.code, to.code) : undefined;
  if (!from || !to || !route) return NextResponse.json({ ok: false, error: "Route not available." }, { status: 422 });
  const passengers = Math.min(9, Math.max(1, Number(u.searchParams.get("passengers") ?? 1)));
  const times = ["06:10", "08:45", "12:30", "15:20", "18:05"];
  const options = route.airlines.flatMap((airline, ai) =>
    times.filter((_, i) => (i + ai) % 2 === 0).map((t, i) => {
      const [h, m] = t.split(":").map(Number);
      const arr = new Date(2000, 0, 1, h, m + route.durationMin);
      const fare = route.sampleFareFromZar + i * 140 + ai * 60;
      return {
        id: `${airline}-${route.from}-${route.to}-${t}`.toLowerCase().replace(/\s+/g, ""),
        airline,
        depart: t,
        arrive: `${String(arr.getHours()).padStart(2, "0")}:${String(arr.getMinutes()).padStart(2, "0")}`,
        durationMin: route.durationMin,
        farePerPassengerZar: fare,
        totalZar: fare * passengers,
        sample: true,
      };
    }),
  );
  return NextResponse.json({ ok: true, from, to, passengers, options }, { headers: { "Cache-Control": "no-store" } });
}
