import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProperty, properties, propertiesForDestination } from "@/lib/data/properties";
import { getDestination } from "@/lib/data/destinations";
import { getAirport, routes } from "@/lib/data/airports";
import { quoteStay, cancellationCopy } from "@/lib/pricing";
import { ratingFor } from "@/lib/search";
import { AMENITIES, PROPERTY_TYPES } from "@/lib/search-params";
import { Gallery } from "@/components/stays/Gallery";
import { BookingPanel } from "@/components/stays/BookingPanel";
import { Illustration } from "@/components/Illustration";
import { formatLong } from "@/lib/dates";
import { company } from "@/config/business";
import { PropertyViewTracker } from "@/components/stays/PropertyViewTracker";
import { SaveButton } from "@/components/stays/SaveButton";
import { ShareButton } from "@/components/ShareButton";
import { AmenityIcon } from "@/components/AmenityIcon";
import { breadcrumbLd } from "@/lib/seo";

type SP = Record<string, string | string[] | undefined>;

export async function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) return { title: "Stay not found" };
  const d = getDestination(p.destination);
  const type = PROPERTY_TYPES.find((t) => t.id === p.type)?.label ?? p.type;
  return {
    title: `${p.name} | ${type} in ${p.area}, ${d?.name ?? ""}`,
    description: `${p.summary} Sleeps ${p.maxGuests}${p.roomBased ? " per room" : ""}. From R${p.nightlyRateZar} per night. ${cancellationCopy[p.cancellation].title}.`,
    alternates: { canonical: `/stays/${p.slug}` },
    openGraph: { title: p.name, description: p.summary, url: `/stays/${p.slug}`, type: "website" },
  };
}

const amenityGroups: { title: string; ids: string[] }[] = [
  { title: "Essentials", ids: ["wifi", "aircon", "backup_power", "parking", "workspace"] },
  { title: "Kitchen and dining", ids: ["kitchen", "breakfast", "braai"] },
  { title: "Outdoors and leisure", ids: ["pool", "sea_view", "gym", "spa"] },
  { title: "Suitability", ids: ["family", "pet_friendly"] },
];

export default async function PropertyPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SP> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const p = getProperty(slug);
  if (!p) notFound();
  const d = getDestination(p.destination)!;
  const type = PROPERTY_TYPES.find((t) => t.id === p.type)?.label ?? p.type;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const initial = {
    checkin: /^\d{4}-\d{2}-\d{2}$/.test(str("checkin")) ? str("checkin") : "",
    checkout: /^\d{4}-\d{2}-\d{2}$/.test(str("checkout")) ? str("checkout") : "",
    adults: Math.min(16, Math.max(1, Number(str("adults") || str("guests") || 2) || 2)),
    children: Math.min(10, Math.max(0, Number(str("children") || 0) || 0)),
    childAges: str("ages").split(",").filter(Boolean).map(Number).filter((n) => n >= 0 && n <= 17),
    rooms: Math.min(6, Math.max(1, Number(str("rooms") || 1) || 1)),
  };
  let initialQuote = null;
  let initialError = null;
  if (initial.checkin && initial.checkout) {
    const q = quoteStay(p, initial.checkin, initial.checkout, initial);
    if (q.ok) initialQuote = q.quote;
    else initialError = q.error;
  }
  const rating = ratingFor(p);
  const airport = d.airport ? getAirport(d.airport) : undefined;
  const flightRoutes = airport ? routes.filter((r) => r.to === airport.code) : [];
  const nearby = propertiesForDestination(p.destination).filter((x) => x.slug !== p.slug).slice(0, 3);
  const back = `/stays?destination=${encodeURIComponent(d.name)}${initial.checkin ? `&checkin=${initial.checkin}&checkout=${initial.checkout}` : ""}&adults=${initial.adults}${initial.children ? `&children=${initial.children}` : ""}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": p.type === "hotel" ? "Hotel" : "LodgingBusiness",
    name: p.name,
    description: p.summary,
    url: `${company.domain}/stays/${p.slug}`,
    address: { "@type": "PostalAddress", addressLocality: p.area, addressRegion: d.province, addressCountry: "ZA" },
    geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
    amenityFeature: p.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: AMENITIES.find((x) => x.id === a)?.label ?? a, value: true })),
    priceRange: `From R${p.nightlyRateZar} per night`,
  };
  if (rating) jsonLd.aggregateRating = { "@type": "AggregateRating", ratingValue: rating.average, reviewCount: rating.count, bestRating: 5 };

  return (
    <div className="container-x py-6 md:py-10 pb-28 md:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd([{ name: "Stays", path: "/stays" }, { name: d.name, path: `/destinations/${d.slug}` }, { name: p.name, path: `/stays/${p.slug}` }])) }} />
      <PropertyViewTracker slug={p.slug} />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-3">
        <ol className="flex flex-wrap gap-1">
          <li><Link href="/stays" className="hover:text-ink">Stays</Link> ›</li>
          <li><Link href={`/destinations/${d.slug}`} className="hover:text-ink">{d.name}</Link> ›</li>
          <li aria-current="page" className="text-ink-2">{p.name}</li>
        </ol>
      </nav>
      <header className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-ink-3">{type} · {p.area}, {d.name}</p>
            <h1 className="mt-1 text-3xl md:text-4xl text-ocean">{p.name}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ShareButton title={p.name} />
            <SaveButton slug={p.slug} name={p.name} className="border border-line" />
          </div>
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-2">
          <span>Sleeps {p.maxGuests}{p.roomBased ? " per room" : ""}</span>
          <span>{p.bedrooms} {p.bedrooms === 1 ? "bedroom" : "bedrooms"}</span>
          <span>{p.beds} {p.beds === 1 ? "bed" : "beds"}</span>
          <span>{p.bathrooms} {p.bathrooms === 1 ? "bathroom" : "bathrooms"}</span>
          {rating ? (
            <span className="font-semibold text-ocean">{rating.average.toFixed(1)} · {rating.count} {rating.count === 1 ? "review" : "reviews"}</span>
          ) : (
            <span className="text-ink-3">No reviews yet</span>
          )}
        </p>
      </header>

      <Gallery name={p.name} slug={p.slug} photos={p.photos} scene={p.scene} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-12">
          <section aria-labelledby="about-h">
            <h2 id="about-h" className="text-2xl text-ocean">About this {type.toLowerCase()}</h2>
            <div className="prose-bru mt-3">
              {p.description.map((para) => <p key={para.slice(0, 20)}>{para}</p>)}
            </div>
            <p className="text-sm text-ink-3">Hosted by {p.hostName}. You'll deal with BruFly for booking and support; the host provides the accommodation.</p>
          </section>

          <section aria-labelledby="amen-h">
            <h2 id="amen-h" className="text-2xl text-ocean">What's included</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {amenityGroups.map((g) => {
                const items = g.ids.filter((id) => p.amenities.includes(id as never));
                if (!items.length) return null;
                return (
                  <div key={g.title}>
                    <h3 className="font-sans text-sm font-bold uppercase tracking-wide text-ink-3">{g.title}</h3>
                    <ul className="mt-2 space-y-2">
                      {items.map((id) => (
                        <li key={id} className="flex items-center gap-2.5 text-ink">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean-100 text-ocean"><AmenityIcon id={id} /></span>
                          {AMENITIES.find((a) => a.id === id)?.label ?? id}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="loc-h">
            <h2 id="loc-h" className="text-2xl text-ocean">Where you'll be</h2>
            <p className="mt-2 text-ink-2">{p.area}, {d.name}, {d.province}. The exact address is shared in your confirmation to protect the host's privacy.</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-line">
              <div className="aspect-[3/1]">
                <Illustration scene={d.scene} seed={d.slug} className="h-full w-full" />
              </div>
            </div>
            <p className="mt-3 text-ink-2">{d.intro} <Link href={`/destinations/${d.slug}`} className="link">Read our {d.name} guide</Link>.</p>
          </section>

          <section aria-labelledby="pol-h">
            <h2 id="pol-h" className="text-2xl text-ocean">Good to know</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="card p-4"><dt className="text-sm font-bold text-ink-3">Check-in</dt><dd className="mt-1">{p.checkIn}</dd></div>
              <div className="card p-4"><dt className="text-sm font-bold text-ink-3">Check-out</dt><dd className="mt-1">{p.checkOut}</dd></div>
              <div className="card p-4 sm:col-span-2"><dt className="text-sm font-bold text-ink-3">Cancellation</dt><dd className="mt-1 font-semibold">{cancellationCopy[p.cancellation].title}</dd><dd className="text-sm text-ink-2">{cancellationCopy[p.cancellation].detail}</dd></div>
              <div className="card p-4 sm:col-span-2">
                <dt className="text-sm font-bold text-ink-3">House rules</dt>
                <dd><ul className="mt-1 list-disc pl-5 text-ink-2">{p.houseRules.map((r) => <li key={r}>{r}</li>)}</ul></dd>
              </div>
              <div className="card p-4 sm:col-span-2">
                <dt className="text-sm font-bold text-ink-3">If something goes wrong</dt>
                <dd className="mt-1 text-ink-2">BruFly support is available {company.supportHours} on WhatsApp {company.whatsappDisplay} or {company.email}. Your confirmation includes the host's direct contact for arrival-day issues.</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="rev-h">
            <h2 id="rev-h" className="text-2xl text-ocean">Guest reviews</h2>
            {p.reviews.length ? (
              <ul className="mt-4 space-y-4">
                {p.reviews.map((r) => (
                  <li key={r.date + r.author} className="card p-4">
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-semibold">{r.author}</p>
                      <p className="text-ink-3">{formatLong(r.date)}</p>
                    </div>
                    <p className="mt-1 text-sm font-bold text-ocean" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}<span className="text-sand-200">{"★".repeat(5 - r.rating)}</span></p>
                    <p className="mt-2 text-ink-2">{r.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-ink-2">This listing hasn't been reviewed on BruFly yet. Reviews are only published from guests who stayed through BruFly.</p>
            )}
          </section>

          {flightRoutes.length > 0 && airport && (
            <section aria-labelledby="fly-h" className="rounded-2xl bg-ocean-100 p-6">
              <h2 id="fly-h" className="text-2xl text-ocean">Flying in?</h2>
              <p className="mt-2 text-ink-2">
                {d.name} is served by {airport.name} ({airport.code}). BruFly requests fares on {[...new Set(flightRoutes.flatMap((r) => r.airlines))].join(" and ")} from {flightRoutes.map((r) => getAirport(r.from)?.city).filter(Boolean).slice(0, 4).join(", ")}.
              </p>
              <Link
                href={`/flights?to=${airport.code}${initial.checkin ? `&depart=${initial.checkin}&return=${initial.checkout}` : ""}&passengers=${initial.adults + initial.children}`}
                className="btn btn-secondary mt-4"
              >
                Search flights to {airport.city}{initial.checkin ? " for these dates" : ""}
              </Link>
              <p className="mt-2 text-xs text-ink-3">Flights and stays are booked and confirmed separately. Booking one does not hold the other.</p>
            </section>
          )}

          {nearby.length > 0 && (
            <section aria-labelledby="near-h">
              <h2 id="near-h" className="text-2xl text-ocean">More stays in {d.name}</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {nearby.map((n) => (
                  <li key={n.slug}>
                    <Link href={`/stays/${n.slug}`} className="card card-hover block overflow-hidden">
                      <div className="aspect-[4/3]"><Illustration scene={n.scene} seed={n.slug} className="h-full w-full" /></div>
                      <div className="p-3">
                        <p className="font-semibold text-ocean">{n.name}</p>
                        <p className="text-sm text-ink-2">from R{n.nightlyRateZar} per night</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside aria-label="Book this stay" className="-order-1 lg:order-none">
          <BookingPanel
            property={{ slug: p.slug, name: p.name, nightlyRateZar: p.nightlyRateZar, roomBased: p.roomBased, maxGuests: p.maxGuests, minNights: p.minNights, bookingMode: p.bookingMode, cancellation: p.cancellation, childPricing: p.childPricing, cleaningFeeZar: p.cleaningFeeZar }}
            initial={initial}
            initialQuote={initialQuote}
            initialError={initialError}
            key={`${initial.checkin}|${initial.checkout}|${back}`}
          />
          <p className="sr-only">Back to search: {back}</p>
        </aside>
      </div>
    </div>
  );
}
