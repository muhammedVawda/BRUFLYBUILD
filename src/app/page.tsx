import Link from "next/link";
import type { Metadata } from "next";
import { HeroSearch } from "@/components/HeroSearch";
import { RouteAnimation } from "@/components/RouteAnimation";
import { HeroScene } from "@/components/HeroScene";
import { Illustration } from "@/components/Illustration";
import { Reveal } from "@/components/Reveal";
import { FAQ, faqJsonLd } from "@/components/FAQ";
import { destinations } from "@/lib/data/destinations";
import { propertiesForDestination } from "@/lib/data/properties";
import { airports, findRoute, popularRoutes } from "@/lib/data/airports";
import { company, flightBooking, brupass } from "@/config/business";
import { websiteLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "BruFly | Cheap flights and stays across South Africa, checked by real people",
  description: `Request ${flightBooking.airlines.join(" and ")} flights and book stays in Cape Town, Durban, Johannesburg, the Garden Route, Kruger and the Winelands. Clear prices, no call centre, every booking checked by a person.`,
  alternates: { canonical: "/" },
};

const faqs = [
  { q: "Is BruFly an airline or a travel agent?", a: "Neither in the traditional sense. BruFly is a South African booking service. We request flights on FlySafair and LIFT on your behalf and list stays from hosts and properties we've reviewed. A real person checks every request before it's confirmed." },
  { q: "Why isn't my booking confirmed immediately?", a: "Because we check the live fare or availability with the airline or host first, so the price you pay is the real price. Most requests are confirmed within 24 hours. Until then your booking page reads 'Request received' and nothing is charged." },
  { q: "Can I book a stay without a flight?", a: "Yes. BruFly Stays works on its own. Search by destination and dates at /stays." },
  { q: "What is BruPass?", a: `A paid membership from R${brupass.plans[0].priceZar} per month that gives access to member fares on flights requested through BruFly. It doesn't discount stays. There's a calculator on the BruPass page to check whether it's worth it for you.` },
];

export default function HomePage() {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: company.domain,
    email: company.email,
    telephone: company.whatsapp,
    address: { "@type": "PostalAddress", addressLocality: company.city, addressCountry: "ZA" },
    sameAs: Object.values(company.social),
  };
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd()) }} />

      {/* Hero: layered poster scene with parallax; search card floats on top */}
      <section className="relative -mt-[var(--header-h)] overflow-hidden" aria-labelledby="hero-h">
        <div className="absolute inset-0 -z-10 bg-ocean"><HeroScene /></div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-sand-50 to-transparent" aria-hidden="true" />
        <div className="container-x pt-[calc(var(--header-h)+2.5rem)] pb-16 md:pt-[calc(var(--header-h)+5rem)] md:pb-24">
          <div className="max-w-2xl">
            <p className="eyebrow !text-[#ffd2b3]">Flights · Stays · BruPass</p>
            <h1 id="hero-h" className="mt-3 text-4xl leading-[1.02] text-white drop-shadow-[0_2px_12px_rgba(11,42,74,0.45)] md:text-6xl lg:text-7xl">
              Fly cheaper. Stay better. <span className="text-[#ffd2b3]">Sorted by a person.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/90 drop-shadow-[0_1px_6px_rgba(11,42,74,0.5)]">
              {flightBooking.airlines.join(" and ")} flights and stays across South Africa. Clear prices, no call centre, and a real person checks every booking before it's confirmed.
            </p>
          </div>
          <div className="mt-8 max-w-4xl shadow-[var(--shadow-lg)] rounded-[var(--radius)]"><HeroSearch /></div>
          <p className="mt-4 text-sm text-white/85 drop-shadow-[0_1px_4px_rgba(11,42,74,0.6)]">Nothing is charged until you approve the final price.</p>
        </div>
      </section>

      {/* How it works */}
      <Reveal as="section" className="container-x py-12 md:py-16">
        <h2 className="text-2xl md:text-4xl text-ocean">Booking with BruFly, step by step</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-4">
          {[
            ["Search", "Flights between eight South African airports, and stays in six destinations. Real fares and real listings, nothing invented."],
            ["Compare", "Times, prices and cancellation terms side by side. Stay prices show the full total for your dates."],
            ["Request", "Send your details. Nothing is charged. A BruFly person checks the live price with the airline or host."],
            ["Confirmed", "We confirm within 24 hours, you approve and pay, and your booking status reads Confirmed. Not before."],
          ].map(([t, d], i) => (
            <li key={t} className="card p-6">
              <span className="display text-3xl font-bold text-sun">{i + 1}</span>
              <h3 className="mt-2 font-sans text-lg font-bold">{t}</h3>
              <p className="mt-1 text-ink-2">{d}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* Popular routes */}
      <Reveal as="section" className="container-x py-8 md:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Flights</p>
            <h2 className="mt-1 text-2xl md:text-4xl text-ocean">Popular routes</h2>
          </div>
          <Link href="/flights" className="btn btn-ghost btn-sm">All routes</Link>
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
        <ul className="grid gap-4 sm:grid-cols-2">
          {popularRoutes.map(([a, b]) => {
            const r = findRoute(a, b)!;
            const A = airports.find((x) => x.code === a)!;
            const B = airports.find((x) => x.code === b)!;
            return (
              <li key={a + b}>
                <Link href={`/flights?from=${a}&to=${b}`} className="card card-hover block p-5">
                  <p className="text-sm text-ink-3">{A.city} → {B.city}</p>
                  <p className="display mt-1 text-xl font-semibold text-ocean">{a} – {b}</p>
                  <p className="mt-2 text-sm text-ink-2">Sample fares from <strong className="text-ink">R{r.sampleFareFromZar}</strong> · {r.airlines.join(", ")}</p>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mx-auto w-full max-w-sm lg:max-w-none"><RouteAnimation className="h-auto w-full" /></div>
        </div>
        <p className="mt-3 text-xs text-ink-3">Sample fares are for planning; the exact fare is confirmed with the airline before you pay.</p>
      </Reveal>

      {/* Stays */}
      <Reveal as="section" className="container-x py-8 md:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">BruFly Stays</p>
            <h2 className="mt-1 text-2xl md:text-4xl text-ocean">Places to stay, priced for your dates</h2>
          </div>
          <Link href="/stays" className="btn btn-ghost btn-sm">Search stays</Link>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d, i) => {
            const n = propertiesForDestination(d.slug).length;
            return (
              <li key={d.slug} className={i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
                <Link href={`/destinations/${d.slug}`} className="card card-hover group block overflow-hidden h-full">
                  <div className={`relative ${i === 0 ? "aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[420px]" : "aspect-[16/9]"}`}>
                    <Illustration scene={d.scene} seed={d.slug} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.04]" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ocean/85 via-ocean/30 to-transparent p-5 pt-16 text-white">
                      <p className="display text-2xl font-semibold">{d.name}</p>
                      <p className="text-sm text-white/85">{n} {n === 1 ? "stay" : "stays"} · {d.province}</p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Reveal>

      {/* BruPass */}
      <Reveal as="section" className="container-x py-8 md:py-12">
        <div className="grid gap-8 overflow-hidden rounded-3xl bg-ocean p-8 text-white md:grid-cols-[1.2fr_1fr] md:items-center md:p-12">
          <div>
            <p className="eyebrow !text-[#ffd2b3]">BruPass</p>
            <h2 className="mt-2 text-2xl md:text-4xl text-white">Fly often? Check if BruPass pays for itself.</h2>
            <p className="mt-3 text-white/80">Member fares on {flightBooking.airlines.join(" and ")} flights from R{brupass.plans[0].priceZar} a month. It's a paid membership for flights only, so we built a calculator instead of a promise.</p>
            <Link href="/brupass#calculator" className="btn btn-primary mt-6">Try the calculator</Link>
          </div>
          <ul className="grid gap-3 text-sm">
            {["Member fares on flights requested through BruFly", `Up to ${brupass.passengersPerBooking} passengers per booking`, "Monthly or annual, conditions shown before you join", "Does not discount stays"].map((x) => (
              <li key={x} className="flex items-start gap-2 rounded-xl bg-white/10 p-3"><span aria-hidden="true">•</span>{x}</li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* Trust */}
      <Reveal as="section" className="container-x py-8 md:py-12">
        <h2 className="text-2xl md:text-4xl text-ocean">Straight talk about how we work</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Who provides what", "Flights are operated by the airline on your ticket. Stays are provided by the host on your confirmation. BruFly handles the booking, the checking and the support."],
            ["What you pay", "Flight fares are confirmed with the airline before you pay. Stay totals include VAT and all mandatory fees. No surprises at checkout."],
            ["When it's confirmed", "A request is not a booking. Your status changes to Confirmed only after the airline or host confirms and we've emailed you."],
          ].map(([t, d]) => (
            <li key={t} className="card p-6"><h3 className="font-sans text-lg font-bold">{t}</h3><p className="mt-1 text-ink-2">{d}</p></li>
          ))}
        </ul>
      </Reveal>

      <Reveal as="section" className="container-x py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
          <FAQ items={faqs} id="home-faq" />
          <div className="card h-fit p-6">
            <p className="eyebrow">Hosts</p>
            <h2 className="mt-1 text-2xl text-ocean">Own a guesthouse, cottage or apartment?</h2>
            <p className="mt-2 text-ink-2">List it on BruFly Stays. No listing fee, you approve every booking, and your address stays private until a guest is confirmed.</p>
            <Link href="/host" className="btn btn-secondary mt-4">List your place</Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
