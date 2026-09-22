import Link from "next/link";
import { Illustration } from "@/components/Illustration";
import { formatZar } from "@/lib/money";
import { AMENITIES, PROPERTY_TYPES } from "@/lib/search-params";
import type { StayResult } from "@/lib/search";

const cancellationLabel = { flexible: "Free cancellation (24 h)", moderate: "Free cancellation (7 days)", strict: "Free cancellation (30 days)" } as const;
const modeLabel = { instant: "Instant booking", request: "Request to book", enquiry: "Enquiry only" } as const;

export function StayCard({ r, href, nights, priority = false }: { r: StayResult; href: string; nights: number; priority?: boolean }) {
  const p = r.property;
  const type = PROPERTY_TYPES.find((t) => t.id === p.type)?.label ?? p.type;
  const amenities = p.amenities.slice(0, 4).map((a) => AMENITIES.find((x) => x.id === a)?.label ?? a);
  const hasPhoto = p.photos.length > 0;
  return (
    <article className="card card-hover overflow-hidden">
      <Link href={href} className="block focus-visible:outline-none group" aria-label={`${p.name}: view stay`}>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-100">
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/images/stays/${p.slug}/${p.photos[0]}`}
              alt={`${p.name}, ${p.area}`}
              width={800}
              height={600}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <>
              <Illustration scene={p.scene} seed={p.slug} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" />
              <span className="absolute left-3 top-3 badge badge-neutral bg-white/85 backdrop-blur">Photos coming soon</span>
            </>
          )}
          {r.unavailableReason && (
            <span className="absolute right-3 top-3 badge badge-warn bg-white/90">Not available for these dates</span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">
                {type} · {p.area}
              </p>
              <h3 className="display mt-0.5 truncate text-lg font-semibold text-ocean">{p.name}</h3>
            </div>
            {r.rating ? (
              <p className="shrink-0 rounded-lg bg-ocean-100 px-2 py-1 text-sm font-bold text-ocean" aria-label={`Rated ${r.rating.average} out of 5 from ${r.rating.count} reviews`}>
                {r.rating.average.toFixed(1)}
                <span className="ml-1 font-medium text-ink-3">({r.rating.count})</span>
              </p>
            ) : (
              <p className="shrink-0 text-xs text-ink-3">No reviews yet</p>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-2">
            Sleeps {p.maxGuests}{p.roomBased ? " per room" : ""} · {p.bedrooms} {p.bedrooms === 1 ? "bedroom" : "bedrooms"} · {p.bathrooms} {p.bathrooms === 1 ? "bathroom" : "bathrooms"}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Amenities">
            {amenities.map((a) => (
              <li key={a} className="rounded-md bg-sand-100 px-2 py-0.5 text-xs font-medium text-ink-2">{a}</li>
            ))}
          </ul>
          <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
            <div>
              <p className="text-xs text-ink-3">{cancellationLabel[p.cancellation]} · {modeLabel[p.bookingMode]}</p>
              {r.quote ? (
                <>
                  <p className="mt-0.5 text-xl font-extrabold text-ink">
                    {formatZar(r.quote.totalZar)}
                    <span className="ml-1 text-sm font-medium text-ink-2">total for {nights} {nights === 1 ? "night" : "nights"}</span>
                  </p>
                  <p className="text-xs text-ink-3">
                    About {formatZar(r.quote.avgPerNightZar)} per night{r.quote.feesZar > 0 ? ", includes fees" : ""}
                    {p.roomBased && r.quote.guests.rooms && r.quote.guests.rooms > 1 ? ` · ${r.quote.guests.rooms} rooms` : ""}
                  </p>
                </>
              ) : r.unavailableReason ? (
                <p className="mt-0.5 text-sm font-semibold text-warn">{r.unavailableReason}</p>
              ) : (
                <>
                  <p className="mt-0.5 text-xl font-extrabold text-ink">
                    <span className="text-sm font-medium text-ink-2">from </span>
                    {formatZar(p.nightlyRateZar)}
                    <span className="ml-1 text-sm font-medium text-ink-2">per night</span>
                  </p>
                  <p className="text-xs text-ink-3">{p.roomBased ? "per room" : "whole place"} · excludes once-off fees · add dates for a total</p>
                </>
              )}
            </div>
            <span className="btn btn-outline btn-sm shrink-0 group-hover:border-ocean">{r.quote ? "View stay" : "Check availability"}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
