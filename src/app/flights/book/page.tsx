import type { Metadata } from "next";
import Link from "next/link";
import { getAirport, findRoute } from "@/lib/data/airports";
import { FlightCheckout } from "@/components/flights/FlightCheckout";

type SP = Record<string, string | string[] | undefined>;
export const metadata: Metadata = { title: "Request your flight", robots: { index: false, follow: false } };

export default async function FlightBookPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const from = getAirport(str("from"));
  const to = getAirport(str("to"));
  const route = from && to ? findRoute(from.code, to.code) : undefined;
  if (!from || !to || !route || !str("depart")) {
    return (
      <div className="container-x py-12">
        <h1 className="text-3xl text-ocean">Start with a flight search</h1>
        <p className="mt-2 text-ink-2">We need a route and a date before you can request a fare.</p>
        <Link href="/flights" className="btn btn-secondary mt-6">Search flights</Link>
      </div>
    );
  }
  const passengers = Math.min(9, Math.max(1, Number(str("passengers") || 1) || 1));
  const fare = Number(str("fare")) || route.sampleFareFromZar;
  return (
    <div className="container-x py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-3">
        <Link href={`/flights?from=${from.code}&to=${to.code}&depart=${str("depart")}${str("return") ? `&return=${str("return")}` : ""}&passengers=${passengers}`} className="hover:text-ink">‹ Back to flight options</Link>
      </nav>
      <h1 className="text-3xl md:text-4xl text-ocean">Request your flight</h1>
      <p className="mt-2 max-w-2xl text-ink-2">Add passenger names exactly as on their ID documents. We'll confirm the live fare with {str("airline") || route.airlines[0]} and email you before anything is charged.</p>
      <div className="mt-8">
        <FlightCheckout from={from} to={to} depart={str("depart")} ret={str("return")} passengers={passengers} airline={str("airline") || route.airlines[0]} time={str("time")} farePerPassenger={fare} />
      </div>
    </div>
  );
}
