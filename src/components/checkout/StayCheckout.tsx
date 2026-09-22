"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ContactFields, validateContact, type Contact } from "@/components/checkout/ContactFields";
import { useIdempotencyKey } from "@/components/checkout/useIdempotencyKey";
import { formatZar } from "@/lib/money";
import { formatShort } from "@/lib/dates";
import { track } from "@/lib/analytics";
import { cancellationCopy, type Quote } from "@/lib/pricing";
import type { Property } from "@/lib/types";
import { stayBooking } from "@/config/business";

interface Props {
  property: Pick<Property, "slug" | "name" | "area" | "bookingMode" | "cancellation" | "checkIn" | "checkOut" | "hostName">;
  quote: Quote;
  destinationName: string;
}

const DRAFT_KEY = "brufly-checkout-draft";

export function StayCheckout({ property, quote: initialQuote, destinationName }: Props) {
  const router = useRouter();
  const idem = useIdempotencyKey(`stay-${property.slug}`);
  const [quote, setQuote] = useState(initialQuote);
  const [accepted, setAccepted] = useState<string>(initialQuote.signature);
  const [contact, setContact] = useState<Contact>({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>> & { terms?: string }>({});
  const [state, setState] = useState<"idle" | "submitting" | "error" | "price_changed">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const submitting = useRef(false);
  const alertRef = useRef<HTMLDivElement>(null);

  // Keep the visitor's typed details if the page reloads or the request fails.
  useEffect(() => {
    try {
      const d = sessionStorage.getItem(DRAFT_KEY);
      if (d) setContact(JSON.parse(d));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(contact));
    } catch {}
  }, [contact]);

  useEffect(() => {
    if (state === "error" || state === "price_changed") alertRef.current?.focus();
  }, [state]);

  const isEnquiry = property.bookingMode === "enquiry";
  const cta = isEnquiry ? "Send enquiry" : "Send booking request";
  const cancel = cancellationCopy[property.cancellation];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current) return; // hard guard against double submission
    const errs = { ...validateContact(contact), ...(terms ? {} : { terms: "Please confirm you've read the price, cancellation terms and how confirmation works." }) };
    setErrors(errs);
    if (Object.keys(errs).length) return;
    submitting.current = true;
    setState("submitting");
    setServerError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "stay",
          slug: property.slug,
          checkin: quote.checkin,
          checkout: quote.checkout,
          guests: quote.guests,
          acceptedSignature: accepted,
          idempotencyKey: idem,
          contact,
          message,
          acceptedTerms: terms,
        }),
      });
      const json = await res.json();
      if (res.status === 409 && json.priceChanged) {
        setQuote(json.quote);
        setState("price_changed");
        submitting.current = false;
        return;
      }
      if (!res.ok || !json.ok) {
        setServerError(json.error ?? "Something went wrong. Your details are still here; please try again.");
        setState("error");
        submitting.current = false;
        return;
      }
      track("request_submitted", { kind: "stay", slug: property.slug, total: quote.totalZar, mode: property.bookingMode });
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      router.push(`/bookings/${json.ref}?new=1`);
      // keep submitting.current = true so the button stays disabled during navigation
    } catch {
      setServerError("We couldn't reach BruFly. Check your connection and try again. Nothing has been sent.");
      setState("error");
      submitting.current = false;
    }
  }

  const summary = (
    <div className="card p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-ink-3">{destinationName}</p>
      <p className="display text-xl font-semibold text-ocean">{property.name}</p>
      <p className="text-sm text-ink-2">{property.area}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-ink-3">Check-in</dt><dd className="font-semibold">{formatShort(quote.checkin)}</dd><dd className="text-xs text-ink-3">{property.checkIn}</dd></div>
        <div><dt className="text-ink-3">Check-out</dt><dd className="font-semibold">{formatShort(quote.checkout)}</dd><dd className="text-xs text-ink-3">{property.checkOut}</dd></div>
        <div className="col-span-2"><dt className="text-ink-3">Guests</dt><dd className="font-semibold">{quote.guests.adults} {quote.guests.adults === 1 ? "adult" : "adults"}{quote.guests.children ? `, ${quote.guests.children} ${quote.guests.children === 1 ? "child" : "children"}` : ""}{quote.guests.rooms && quote.guests.rooms > 1 ? ` · ${quote.guests.rooms} rooms` : ""}</dd></div>
      </dl>
      <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
        {quote.lines.map((l) => (
          <div key={l.label} className="flex justify-between gap-3">
            <dt className="text-ink-2">{l.label}{l.note && <span className="block text-xs text-ink-3">{l.note}</span>}</dt>
            <dd className="tabular-nums">{formatZar(l.amountZar)}</dd>
          </div>
        ))}
        <div className="flex justify-between border-t border-line pt-2 text-lg font-extrabold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatZar(quote.totalZar)}</dd>
        </div>
        <p className="text-xs text-ink-3">Includes VAT and all mandatory fees. Prices in South African rand.</p>
      </dl>
      <div className="mt-4 rounded-xl bg-sand-100 p-3 text-sm">
        <p className="font-semibold">{cancel.title}</p>
        <p className="mt-0.5 text-ink-2">{cancel.detail}</p>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        {(state === "error" || state === "price_changed") && (
          <div ref={alertRef} tabIndex={-1} role="alert" className={`rounded-2xl border p-4 ${state === "price_changed" ? "border-warn bg-warn-100" : "border-bad bg-bad-100"}`}>
            {state === "price_changed" ? (
              <>
                <p className="font-bold">The price for this stay has changed</p>
                <p className="mt-1 text-sm">The new total is <strong>{formatZar(quote.totalZar)}</strong>. Nothing has been sent. Review the updated summary and, if you're happy, confirm the new price below and send your request.</p>
                <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => { setAccepted(quote.signature); setState("idle"); }}>
                  I accept the new total of {formatZar(quote.totalZar)}
                </button>
              </>
            ) : (
              <p className="font-semibold">{serverError}</p>
            )}
          </div>
        )}

        <section className="card p-5 md:p-6">
          <h2 className="font-sans text-lg font-bold">How this booking works</h2>
          <ol className="mt-3 space-y-2 text-sm text-ink-2">
            <li className="flex gap-3"><span className="badge badge-ocean shrink-0">1</span> You send a {isEnquiry ? "enquiry" : "booking request"} with your details. <strong className="text-ink">No payment is taken now.</strong></li>
            <li className="flex gap-3"><span className="badge badge-ocean shrink-0">2</span> {isEnquiry ? `The host replies within one working day and we send you a bookable offer if the dates suit.` : `The host confirms within ${stayBooking.confirmationWindowHours} hours. We email you either way, and you can cancel the request at any time before it is confirmed.`}</li>
            <li className="flex gap-3"><span className="badge badge-ocean shrink-0">3</span> {isEnquiry ? "Only once you accept an offer and the host confirms is your stay booked." : "Once confirmed, we send payment instructions and your booking becomes Confirmed. Until then your dates are not held."}</li>
          </ol>
        </section>

        <section className="card p-5 md:p-6">
          <ContactFields value={contact} onChange={setContact} errors={errors} disabled={state === "submitting"} />
        </section>

        <section className="card p-5 md:p-6">
          <label htmlFor="msg" className="font-sans text-lg font-bold">Message to the host (optional)</label>
          <textarea id="msg" className="field mt-3 min-h-[110px] py-3" maxLength={1000} placeholder="Arrival time, special requests, who's travelling…" value={message} onChange={(e) => setMessage(e.target.value)} disabled={state === "submitting"} />
        </section>

        <section className="card p-5 md:p-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--brand-ocean)]" checked={terms} onChange={(e) => setTerms(e.target.checked)} aria-invalid={Boolean(errors.terms)} aria-describedby={errors.terms ? "terms-err" : undefined} disabled={state === "submitting"} />
            <span className="text-sm text-ink-2">
              I've checked the total of <strong className="text-ink">{formatZar(quote.totalZar)}</strong>, the cancellation terms ({cancel.title.toLowerCase()}) and I understand my stay is only confirmed once BruFly emails a confirmation. I agree to the <Link href="/terms" className="link" target="_blank">terms of service</Link>.
            </span>
          </label>
          {errors.terms && <p id="terms-err" className="error-text">{errors.terms}</p>}
          <button type="submit" className="btn btn-primary btn-lg mt-5 w-full" disabled={state === "submitting" || state === "price_changed"} aria-busy={state === "submitting"}>
            {state === "submitting" ? (<><span className="spinner !border-t-white" aria-hidden="true" /> Sending…</>) : cta}
          </button>
          <p className="mt-2 text-center text-xs text-ink-3">No payment is taken at this step.</p>
        </section>
      </div>
      <aside className="lg:sticky lg:self-start" style={{ top: "calc(var(--header-h) + 16px)" }}>{summary}</aside>
    </form>
  );
}
