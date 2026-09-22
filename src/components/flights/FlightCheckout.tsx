"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ContactFields, validateContact, type Contact } from "@/components/checkout/ContactFields";
import { useIdempotencyKey } from "@/components/checkout/useIdempotencyKey";
import { formatZar } from "@/lib/money";
import { formatShort } from "@/lib/dates";
import { track } from "@/lib/analytics";
import { flightBooking } from "@/config/business";
import type { Airport } from "@/lib/types";

interface Props { from: Airport; to: Airport; depart: string; ret: string; passengers: number; airline: string; time: string; farePerPassenger: number }

export function FlightCheckout({ from, to, depart, ret, passengers, airline, time, farePerPassenger }: Props) {
  const router = useRouter();
  const idem = useIdempotencyKey(`flight-${from.code}${to.code}`);
  const [names, setNames] = useState<string[]>(Array(passengers).fill(""));
  const [contact, setContact] = useState<Contact>({ name: "", email: "", phone: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>> & { names?: string; terms?: string }>({});
  const [state, setState] = useState<"idle" | "submitting" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const submitting = useRef(false);
  const legs = ret ? 2 : 1;
  const estimate = farePerPassenger * passengers * legs + flightBooking.serviceFeeZar;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    const errs: typeof errors = validateContact(contact);
    if (names.some((n) => n.trim().length < 2)) errs.names = "Enter every passenger's full name.";
    if (!terms) errs.terms = "Please confirm you understand this is a request, not a ticket.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    submitting.current = true;
    setState("submitting");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "flight", from: from.code, to: to.code, depart, return: ret, passengers, passengerNames: names, airline, time, idempotencyKey: idem, contact, acceptedTerms: terms }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.");
        setState("error");
        submitting.current = false;
        return;
      }
      track("request_submitted", { kind: "flight", route: `${from.code}-${to.code}`, passengers });
      router.push(`/bookings/${json.ref}?new=1`);
    } catch {
      setServerError("We couldn't reach BruFly. Check your connection and try again. Nothing has been sent.");
      setState("error");
      submitting.current = false;
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        {state === "error" && <div role="alert" className="rounded-2xl border border-bad bg-bad-100 p-4 font-semibold">{serverError}</div>}
        <section className="card p-5 md:p-6">
          <h2 className="font-sans text-lg font-bold">What happens next</h2>
          <ol className="mt-3 space-y-2 text-sm text-ink-2">
            <li className="flex gap-3"><span className="badge badge-ocean shrink-0">1</span> You send this request. <strong className="text-ink">No payment is taken and no seat is held yet.</strong></li>
            <li className="flex gap-3"><span className="badge badge-ocean shrink-0">2</span> A BruFly team member checks the live {airline} fare and availability and emails you the exact price within {flightBooking.confirmationWindowHours} hours.</li>
            <li className="flex gap-3"><span className="badge badge-ocean shrink-0">3</span> You approve and pay. Only then is the ticket issued and your booking shown as Confirmed.</li>
          </ol>
        </section>
        <section className="card p-5 md:p-6">
          <fieldset disabled={state === "submitting"}>
            <legend className="mb-3 font-sans text-lg font-bold">Passengers</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {names.map((n, i) => (
                <div key={i}>
                  <label htmlFor={`pax-${i}`} className="label">Passenger {i + 1} full name</label>
                  <input id={`pax-${i}`} className="field" autoComplete={i === 0 ? "name" : "off"} value={n} aria-invalid={Boolean(errors.names) && n.trim().length < 2} onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value : x)))} />
                </div>
              ))}
            </div>
            {errors.names && <p className="error-text" role="alert">{errors.names}</p>}
            <p className="hint">Names must match the ID or passport used at check-in. Airlines charge for name changes after ticketing.</p>
          </fieldset>
        </section>
        <section className="card p-5 md:p-6"><ContactFields value={contact} onChange={setContact} errors={errors} disabled={state === "submitting"} /></section>
        <section className="card p-5 md:p-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--brand-ocean)]" checked={terms} onChange={(e) => setTerms(e.target.checked)} aria-invalid={Boolean(errors.terms)} disabled={state === "submitting"} />
            <span className="text-sm text-ink-2">I understand this is a <strong className="text-ink">request, not a ticket</strong>. The estimate of {formatZar(estimate)} is based on a sample fare; BruFly will confirm the exact fare and I'll only be charged after I approve it. I agree to the <Link href="/terms" className="link" target="_blank">terms of service</Link>.</span>
          </label>
          {errors.terms && <p className="error-text">{errors.terms}</p>}
          <button type="submit" className="btn btn-primary btn-lg mt-5 w-full" disabled={state === "submitting"} aria-busy={state === "submitting"}>
            {state === "submitting" ? (<><span className="spinner !border-t-white" aria-hidden="true" /> Sending…</>) : "Send flight request"}
          </button>
          <p className="mt-2 text-center text-xs text-ink-3">No payment is taken at this step.</p>
        </section>
      </div>
      <aside className="lg:sticky lg:self-start" style={{ top: "calc(var(--header-h) + 16px)" }}>
        <div className="card p-5">
          <p className="badge badge-ocean">{airline}</p>
          <p className="display mt-2 text-xl font-semibold text-ocean">{from.city} → {to.city}{ret ? " and back" : ""}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-3">Depart</dt><dd className="font-semibold">{formatShort(depart)}{time ? ` · ${time}` : ""}</dd></div>
            {ret && <div className="flex justify-between"><dt className="text-ink-3">Return</dt><dd className="font-semibold">{formatShort(ret)}</dd></div>}
            <div className="flex justify-between"><dt className="text-ink-3">Passengers</dt><dd className="font-semibold">{passengers}</dd></div>
          </dl>
          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-2">Sample fare × {passengers} × {legs} {legs === 1 ? "leg" : "legs"}</dt><dd className="tabular-nums">{formatZar(farePerPassenger * passengers * legs)}</dd></div>
            {flightBooking.serviceFeeZar > 0 && <div className="flex justify-between"><dt className="text-ink-2">BruFly service fee</dt><dd className="tabular-nums">{formatZar(flightBooking.serviceFeeZar)}</dd></div>}
            <div className="flex justify-between border-t border-line pt-2 text-lg font-extrabold"><dt>Estimated total</dt><dd className="tabular-nums">{formatZar(estimate)}</dd></div>
            <p className="text-xs text-ink-3">Estimate only. The exact fare is confirmed with the airline before you pay. Return leg estimated at the same sample fare.</p>
          </dl>
        </div>
      </aside>
    </form>
  );
}
