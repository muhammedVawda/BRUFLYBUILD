import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { StaysResults } from "@/components/stays/StaysResults";
import { parseStaySearch, serializeStaySearch } from "@/lib/search-params";
import { searchStays } from "@/lib/search";
import { properties } from "@/lib/data/properties";
import { destinations } from "@/lib/data/destinations";
import { FAQ, faqJsonLd } from "@/components/FAQ";
import type { Amenity, PropertyType } from "@/lib/types";
import { breadcrumbLd, itemListLd } from "@/lib/seo";

type SP = Record<string, string | string[] | undefined>;

function toParams(sp: SP): URLSearchParams {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") p.set(k, v);
    else if (Array.isArray(v) && v[0]) p.set(k, v[0]);
  }
  return p;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const hasParams = Object.keys(sp).length > 0;
  return {
    title: "BruFly Stays | Hotels, guesthouses and holiday homes in South Africa",
    description:
      "Search accommodation across South Africa with BruFly Stays: hotels, guesthouses, apartments, villas and lodges in Cape Town, Durban, Johannesburg, the Garden Route, Kruger and the Winelands. Clear total prices, no flight needed.",
    alternates: { canonical: "/stays" },
    // Filtered/dated searches are not indexed; the clean /stays and destination pages are.
    robots: hasParams ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title: "BruFly Stays", description: "Find a place to stay across South Africa. Clear total prices, checked by real people.", url: "/stays" },
  };
}

const faqs = [
  { q: "Do I need to book a flight to book a stay?", a: "No. BruFly Stays works on its own. Search, pick your dates and guests, and send a booking request. If you do want flights, we'll suggest matching dates once you've chosen a stay." },
  { q: "Is the price I see the price I pay?", a: "When you add dates, every card shows the total for your stay including any cleaning fee. Nightly rates include VAT. If a price or availability changes between your quote and your request, we'll show you the change and ask you to accept it before anything is sent." },
  { q: "When is my stay confirmed?", a: "Most stays are request-to-book. You send a request, nothing is charged, and the host or property confirms within 24 hours. Your booking is only confirmed when you receive a confirmation email and the status on your booking page reads 'Confirmed'." },
  { q: "Can I cancel?", a: "Each listing shows its cancellation terms on the card and again before you send a request. Free cancellation windows are 24 hours, 7 days or 30 days before check-in, depending on the listing." },
];

export default async function StaysPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const params = toParams(sp);
  const search = parseStaySearch(params);
  const data = searchStays(search);
  const key = serializeStaySearch(search).toString();
  const facets = {
    amenities: [...new Set(properties.flatMap((p) => p.amenities))] as Amenity[],
    types: [...new Set(properties.map((p) => p.type))] as PropertyType[],
    price: { min: Math.min(...properties.map((p) => p.nightlyRateZar)), max: Math.max(...properties.map((p) => p.nightlyRateZar)) },
  };
  const initialKey = params.toString();

  return (
    <div className="container-x py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd([{ name: "Home", path: "/" }, { name: "Stays", path: "/stays" }])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd("Destinations on BruFly Stays", destinations.map((d) => ({ name: d.name, path: `/destinations/${d.slug}` })))) }} />
      <header className="max-w-3xl">
        <p className="eyebrow">BruFly Stays</p>
        <h1 className="mt-2 text-3xl md:text-5xl text-ocean">Find a place to stay, anywhere in South Africa</h1>
        <p className="mt-3 text-lg text-ink-2">
          Hotels, guesthouses, apartments, villas and lodges from {destinations.map((d) => d.name).slice(0, 3).join(", ")} and beyond. No flight needed. Add your dates to see the full price for your stay, then send a request and a real person confirms it.
        </p>
      </header>
      <div className="mt-8">
        <Suspense fallback={<div className="skeleton h-40 w-full" />}>
          <StaysResults initialKey={initialKey} initialData={data} facets={facets} key={key} />
        </Suspense>
      </div>

      <section className="mt-16 grid gap-6 md:grid-cols-3" aria-label="How booking a stay works">
        {[
          { n: "1", t: "Search and compare", d: "Filter by type, price, bedrooms and amenities. Every card shows capacity, cancellation terms and how booking works for that listing." },
          { n: "2", t: "Send a request", d: "Add your details and send a booking request. Nothing is charged at this step and you can cancel the request before it is confirmed." },
          { n: "3", t: "Get a real confirmation", d: "The host or property confirms within 24 hours. Only then is your stay confirmed, and you'll get the full details by email." },
        ].map((s) => (
          <div key={s.n} className="card p-6">
            <span className="display text-3xl font-bold text-sun">{s.n}</span>
            <h2 className="mt-2 font-sans text-lg font-bold">{s.t}</h2>
            <p className="mt-1 text-ink-2">{s.d}</p>
          </div>
        ))}
      </section>

      <section className="mt-16" aria-labelledby="dest-h">
        <h2 id="dest-h" className="text-2xl md:text-3xl text-ocean">Browse by destination</h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {destinations.map((d) => (
            <li key={d.slug}>
              <Link href={`/destinations/${d.slug}`} className="chip hover:border-ocean">
                {d.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-16">
        <FAQ items={faqs} id="stays-faq" />
      </div>
    </div>
  );
}
