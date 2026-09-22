import type { Metadata } from "next";
import Link from "next/link";
import { FlightSearchForm } from "@/components/flights/FlightSearchForm";
import { FlightResults } from "@/components/flights/FlightResults";
import { airports, findRoute, getAirport, popularRoutes } from "@/lib/data/airports";
import { destinations } from "@/lib/data/destinations";
import { FAQ, faqJsonLd } from "@/components/FAQ";
import { flightBooking } from "@/config/business";
import { Illustration } from "@/components/Illustration";

type SP = Record<string, string | string[] | undefined>;

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const has = Object.keys(sp).length > 0;
  return {
    title: "Cheap flights in South Africa on FlySafair and LIFT",
    description: "Request domestic flights between Johannesburg, Cape Town, Durban, George, Gqeberha, East London, Bloemfontein and Nelspruit. Every request is checked by a real person before it is ticketed.",
    alternates: { canonical: "/flights" },
    robots: has ? { index: false, follow: true } : { index: true, follow: true },
  };
}

const faqs = [
  { q: "Are these live fares?", a: "The fares on the results page are sample fares for the route, shown so you can compare times and plan. When you send a request, a BruFly team member checks the live fare with the airline and confirms the exact price with you before anything is ticketed or charged." },
  { q: "When is my flight booked?", a: `It isn't booked until you receive a confirmation from BruFly with your airline reference. Your request page shows 'Request received' until then, and we confirm or decline within ${flightBooking.confirmationWindowHours} hours.` },
  { q: "Do I pay when I send a request?", a: "No. Nothing is charged when you send a request. Once we've confirmed the fare and availability, we send you payment instructions. Only after payment is received is the ticket issued." },
  { q: "Can I change or cancel?", a: "Before confirmation you can cancel a request at no cost from your booking page. After ticketing, the airline's change and cancellation rules apply; we'll show you those rules with your confirmed fare." },
];

export default async function FlightsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const from = getAirport(str("from"));
  const to = getAirport(str("to"));
  const searching = Boolean(from && to && str("depart"));
  const initial = { from: from?.code, to: to?.code, depart: str("depart"), return: str("return"), passengers: Math.min(9, Math.max(1, Number(str("passengers") || 1) || 1)), oneWay: Boolean(str("depart")) && !str("return") };
  const destForTo = to?.destination ? destinations.find((d) => d.slug === to.destination) : null;

  return (
    <div className="container-x py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      <header className="max-w-3xl">
        <p className="eyebrow">Flights</p>
        <h1 className="mt-2 text-3xl md:text-5xl text-ocean">Domestic flights, checked by a real person</h1>
        <p className="mt-3 text-lg text-ink-2">Search FlySafair and LIFT routes across South Africa. Send a request, we confirm the live fare with the airline, and nothing is charged until you approve it.</p>
      </header>
      <div className="card mt-8 p-4 md:p-6">
        <FlightSearchForm initial={initial} variant={searching ? "bar" : "hero"} />
      </div>

      {searching && from && to ? (
        <div className="mt-8">
          <FlightResults from={from} to={to} depart={str("depart")} ret={str("return")} passengers={initial.passengers} route={findRoute(from.code, to.code) ?? null} />
          {destForTo && (
            <section className="mt-10 rounded-2xl bg-ocean-100 p-6" aria-labelledby="stay-sug">
              <div className="grid gap-6 md:grid-cols-[1fr_260px] md:items-center">
                <div>
                  <h2 id="stay-sug" className="text-2xl text-ocean">Need a place to stay in {destForTo.name}?</h2>
                  <p className="mt-2 text-ink-2">{destForTo.intro} We'll carry your dates and passenger count across. Stays are booked and confirmed separately from flights.</p>
                  <Link href={`/stays?destination=${encodeURIComponent(destForTo.name)}${str("depart") && str("return") ? `&checkin=${str("depart")}&checkout=${str("return")}` : ""}&adults=${initial.passengers}`} className="btn btn-secondary mt-4">
                    See stays in {destForTo.name}
                  </Link>
                </div>
                <div className="overflow-hidden rounded-xl"><div className="aspect-[4/3]"><Illustration scene={destForTo.scene} seed={destForTo.slug} className="h-full w-full" /></div></div>
              </div>
            </section>
          )}
        </div>
      ) : (
        <section className="mt-12" aria-labelledby="pop-h">
          <h2 id="pop-h" className="text-2xl md:text-3xl text-ocean">Popular routes</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularRoutes.map(([a, b]) => {
              const r = findRoute(a, b)!;
              const A = airports.find((x) => x.code === a)!;
              const B = airports.find((x) => x.code === b)!;
              return (
                <li key={a + b}>
                  <Link href={`/flights?from=${a}&to=${b}`} className="card card-hover block p-5">
                    <p className="text-sm text-ink-3">{A.city} → {B.city}</p>
                    <p className="display mt-1 text-xl font-semibold text-ocean">{a} – {b}</p>
                    <p className="mt-2 text-sm text-ink-2">Sample fares from <strong className="text-ink">R{r.sampleFareFromZar}</strong> one way · {r.airlines.join(", ")}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-ink-3">Sample fares are indicative for planning. The exact fare is confirmed with the airline before you pay.</p>
        </section>
      )}

      <div className="mt-16"><FAQ items={faqs} id="flights-faq" title="Flight booking questions" /></div>
    </div>
  );
}
