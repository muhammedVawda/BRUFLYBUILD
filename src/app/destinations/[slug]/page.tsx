import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { destinations, getDestination } from "@/lib/data/destinations";
import { propertiesForDestination } from "@/lib/data/properties";
import { getAirport, routes } from "@/lib/data/airports";
import { searchStays, } from "@/lib/search";
import { parseStaySearch } from "@/lib/search-params";
import { StayCard } from "@/components/stays/StayCard";
import { Illustration } from "@/components/Illustration";
import { company } from "@/config/business";

export async function generateStaticParams() {
  return destinations.filter((d) => propertiesForDestination(d.slug).length > 0).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d) return { title: "Destination not found" };
  const n = propertiesForDestination(slug).length;
  return {
    title: `Stays in ${d.name}: ${n} places to stay and how to get there`,
    description: `${d.intro} Compare ${n} hotels, guesthouses and holiday homes in ${d.name} with clear total prices, plus flights via ${d.airport ?? "the nearest airport"}.`,
    alternates: { canonical: `/destinations/${d.slug}` },
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d || propertiesForDestination(slug).length === 0) notFound();
  const results = searchStays(parseStaySearch(new URLSearchParams({ destination: d.slug })));
  const airport = d.airport ? getAirport(d.airport) : undefined;
  const inbound = airport ? routes.filter((r) => r.to === airport.code) : [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: d.name,
    description: d.intro,
    url: `${company.domain}/destinations/${d.slug}`,
    containedInPlace: { "@type": "AdministrativeArea", name: d.province },
  };
  return (
    <div className="container-x py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-3"><Link href="/stays" className="hover:text-ink">Stays</Link> › <span className="text-ink-2">{d.name}</span></nav>
      <header className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div>
          <p className="eyebrow">{d.province}</p>
          <h1 className="mt-2 text-3xl md:text-5xl text-ocean">Stays in {d.name}</h1>
          <p className="mt-3 text-lg text-ink-2">{d.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/stays?destination=${encodeURIComponent(d.name)}&adults=2`} className="btn btn-primary">Search stays with dates</Link>
            {airport && <Link href={`/flights?to=${airport.code}`} className="btn btn-outline">Flights to {airport.city}</Link>}
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl"><div className="aspect-[4/3]"><Illustration scene={d.scene} seed={d.slug} className="h-full w-full" label={`Illustration of ${d.name}`} /></div></div>
      </header>
      <section className="prose-bru mt-12 max-w-3xl" aria-label={`About ${d.name}`}>
        {d.body.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
      </section>
      <section className="mt-12" aria-labelledby="stays-h">
        <h2 id="stays-h" className="text-2xl md:text-3xl text-ocean">{results.total} places to stay in {d.name}</h2>
        <p className="mt-1 text-ink-2">Prices shown per night. Add dates to see the total for your stay.</p>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.results.map((r) => <li key={r.property.slug}><StayCard r={r} href={`/stays/${r.property.slug}`} nights={0} /></li>)}
        </ul>
      </section>
      {airport && inbound.length > 0 && (
        <section className="mt-12 rounded-2xl bg-ocean-100 p-6" aria-labelledby="fly-h">
          <h2 id="fly-h" className="text-2xl text-ocean">Getting to {d.name}</h2>
          <p className="mt-2 text-ink-2">Fly into {airport.name} ({airport.code}). BruFly requests fares on these routes:</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {inbound.map((r) => { const a = getAirport(r.from)!; return <li key={r.from}><Link href={`/flights?from=${r.from}&to=${airport.code}`} className="chip hover:border-ocean">{a.city} → {airport.city} · from R{r.sampleFareFromZar}</Link></li>; })}
          </ul>
          <p className="mt-2 text-xs text-ink-3">Sample fares, confirmed with the airline before you pay.</p>
        </section>
      )}
      <section className="mt-12" aria-labelledby="other-h">
        <h2 id="other-h" className="font-sans text-lg font-bold">Other destinations</h2>
        <ul className="mt-3 flex flex-wrap gap-2">{destinations.filter((x) => x.slug !== d.slug).map((x) => <li key={x.slug}><Link href={`/destinations/${x.slug}`} className="chip hover:border-ocean">{x.name}</Link></li>)}</ul>
      </section>
    </div>
  );
}
