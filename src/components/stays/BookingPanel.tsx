"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DateRangePicker } from "@/components/DateRangePicker";
import { GuestPicker } from "@/components/GuestPicker";
import { formatZar } from "@/lib/money";
import { track } from "@/lib/analytics";
import { cancellationCopy, type Quote, type QuoteError } from "@/lib/pricing";
import type { Property } from "@/lib/types";

interface Props {
  property: Pick<Property, "slug" | "name" | "nightlyRateZar" | "roomBased" | "maxGuests" | "minNights" | "bookingMode" | "cancellation" | "childPricing" | "cleaningFeeZar">;
  initial: { checkin: string; checkout: string; adults: number; children: number; childAges: number[]; rooms: number };
  /** Server-computed quote for the initial params, so the first paint has a price. */
  initialQuote: Quote | null;
  initialError: QuoteError | null;
}

const cta = { instant: "Book now", request: "Request to book", enquiry: "Send enquiry" } as const;
const modeExplain = {
  instant: "You'll pay now and get an immediate confirmation.",
  request: "Nothing is charged now. The host confirms within 24 hours; we'll email you either way.",
  enquiry: "This host answers enquiries before accepting bookings. Nothing is charged; we'll reply within one working day.",
} as const;

/**
 * Booking panel: re-quotes on the server whenever dates or guests change,
 * writes the selection to the URL (so it survives back navigation and can
 * be shared), and shows a compact sticky bar on phones.
 */
export function BookingPanel({ property, initial, initialQuote, initialError }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [sel, setSel] = useState(initial);
  const [quote, setQuote] = useState<Quote | null>(initialQuote);
  const [error, setError] = useState<QuoteError | null>(initialError);
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);
  const first = useRef(true);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (sel.checkin) p.set("checkin", sel.checkin);
    if (sel.checkout) p.set("checkout", sel.checkout);
    p.set("adults", String(sel.adults));
    if (sel.children) {
      p.set("children", String(sel.children));
      if (sel.childAges.length) p.set("ages", sel.childAges.join(","));
    }
    if (property.roomBased && sel.rooms > 1) p.set("rooms", String(sel.rooms));
    return p.toString();
  }, [sel, property.roomBased]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Keep URL in sync (replace, so back goes to the search, not each tweak).
    router.replace(`${pathname}?${qs}`, { scroll: false });
    if (!sel.checkin || !sel.checkout) {
      setQuote(null);
      setError(null);
      return;
    }
    const my = ++seq.current;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stays/${property.slug}/quote?${qs}`);
        const json = await res.json();
        if (my !== seq.current) return;
        if (json.ok) {
          setQuote(json.quote);
          setError(null);
        } else {
          setQuote(null);
          setError(json.error);
        }
      } catch {
        if (my !== seq.current) return;
        setError({ code: "dates", message: "We couldn't price these dates. Check your connection and try again." });
      } finally {
        if (my === seq.current) setLoading(false);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [qs, sel.checkin, sel.checkout, pathname, router, property.slug]);

  const back = params.get("back");
  const bookHref = `/stays/${property.slug}/book?${qs}`;
  const canBook = Boolean(quote) && !loading;
  const cancel = cancellationCopy[property.cancellation];

  const panel = (
    <div className="card p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p>
          <span className="text-2xl font-extrabold">{formatZar(property.nightlyRateZar)}</span>
          <span className="ml-1 text-ink-2">per night{property.roomBased ? " per room" : ""}</span>
        </p>
        <span className="badge badge-ocean">{property.bookingMode === "instant" ? "Instant" : property.bookingMode === "request" ? "Request to book" : "Enquiry"}</span>
      </div>
      <div className="mt-4 space-y-3">
        <DateRangePicker
          checkin={sel.checkin}
          checkout={sel.checkout}
          onChange={(checkin, checkout) => setSel({ ...sel, checkin, checkout })}
          error={error && error.code !== "capacity" && error.code !== "child_ages" ? error.message : null}
          minNights={property.minNights}
          compact
        />
        <GuestPicker
          value={{ adults: sel.adults, children: sel.children, childAges: sel.childAges, rooms: sel.rooms }}
          onChange={(g) => setSel({ ...sel, ...g })}
          rooms={property.roomBased}
          childAges={Boolean(property.childPricing)}
          maxGuests={property.maxGuests * (property.roomBased ? 6 : 1)}
          compact
        />
        {error && (error.code === "capacity" || error.code === "child_ages") && <p className="error-text" role="alert">{error.message}</p>}
        {error && error.code === "unavailable" && (
          <p className="text-sm text-ink-2">Unavailable nights: {error.dates.join(", ")}. Try different dates.</p>
        )}
      </div>

      <div className="mt-4 min-h-[64px]" aria-live="polite">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-ink-2"><span className="spinner" aria-hidden="true" /> Updating price…</div>
        ) : quote ? (
          <dl className="space-y-1.5 text-sm">
            {quote.lines.map((l) => (
              <div key={l.label} className="flex justify-between gap-3">
                <dt className="text-ink-2">
                  {l.label}
                  {l.note && <span className="block text-xs text-ink-3">{l.note}</span>}
                </dt>
                <dd className="tabular-nums">{formatZar(l.amountZar)}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold">
              <dt>Total for {quote.nights} {quote.nights === 1 ? "night" : "nights"}</dt>
              <dd className="tabular-nums">{formatZar(quote.totalZar)}</dd>
            </div>
            <p className="text-xs text-ink-3">Includes VAT and all mandatory fees. No hidden extras at checkout.</p>
          </dl>
        ) : (
          <p className="text-sm text-ink-2">Add your dates to see the total for your stay, including fees.</p>
        )}
      </div>

      {canBook ? (
        <Link href={bookHref} className="btn btn-primary btn-lg mt-4 w-full" onClick={() => track("booking_started", { kind: "stay", slug: property.slug, nights: quote?.nights ?? 0, total: quote?.totalZar ?? 0 })}>
          {cta[property.bookingMode]}
        </Link>
      ) : (
        <button type="button" className="btn btn-primary btn-lg mt-4 w-full" disabled aria-disabled="true">
          {cta[property.bookingMode]}
        </button>
      )}
      <p className="mt-2 text-center text-xs text-ink-2">{modeExplain[property.bookingMode]}</p>
      <div className="mt-4 rounded-xl bg-sand-100 p-3 text-sm">
        <p className="font-semibold">{cancel.title}</p>
        <p className="mt-0.5 text-ink-2">{cancel.detail}</p>
      </div>
      {back && (
        <Link href={back} className="mt-3 block text-center text-sm link">
          Back to results
        </Link>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden md:block sticky" style={{ top: "calc(var(--header-h) + 16px)" }}>{panel}</div>
      <div className="md:hidden" id="booking-panel">{panel}</div>
      {/* Compact sticky action on phones */}
      <div className="fixed inset-x-0 bottom-0 z-[45] border-t border-line bg-white/95 p-3 backdrop-blur md:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {quote ? (
              <>
                <p className="truncate text-lg font-extrabold">{formatZar(quote.totalZar)} <span className="text-sm font-medium text-ink-2">total</span></p>
                <p className="truncate text-xs text-ink-3">{quote.nights} {quote.nights === 1 ? "night" : "nights"} · {quote.guests.adults + quote.guests.children} guests</p>
              </>
            ) : (
              <>
                <p className="text-lg font-extrabold">{formatZar(property.nightlyRateZar)} <span className="text-sm font-medium text-ink-2">/ night</span></p>
                <p className="text-xs text-ink-3">Add dates for a total</p>
              </>
            )}
          </div>
          {canBook ? (
            <Link href={bookHref} className="btn btn-primary shrink-0">{cta[property.bookingMode]}</Link>
          ) : (
            <a href="#booking-panel" className="btn btn-primary shrink-0">Select dates</a>
          )}
        </div>
      </div>
    </>
  );
}
