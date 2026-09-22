"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatZar } from "@/lib/money";
import { formatShort } from "@/lib/dates";
import { statusCopy } from "@/lib/booking-status";
import type { BookingRecord } from "@/lib/bookings-store";
import { company } from "@/config/business";
import { track } from "@/lib/analytics";

export function BookingStatus({ refCode, isNew }: { refCode: string; isNew: boolean }) {
  const [b, setB] = useState<BookingRecord | null>(null);
  const [state, setState] = useState<"loading" | "idle" | "missing" | "error">("loading");
  const [cancelEmail, setCancelEmail] = useState("");
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);

  async function load() {
    setState("loading");
    try {
      const res = await fetch(`/api/bookings/${refCode}`);
      if (res.status === 404) return setState("missing");
      const json = await res.json();
      setB(json.booking);
      setState("idle");
      if (json.booking?.status === "confirmed") track("booking_confirmed", { kind: json.booking.kind });
    } catch {
      setState("error");
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refCode]);

  if (state === "loading") return <div className="skeleton h-48 w-full max-w-2xl" aria-label="Loading booking" />;
  if (state === "missing")
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl text-ocean">We can't find booking {refCode}</h1>
        <p className="mt-2 text-ink-2">Check the reference in your email, or contact us on WhatsApp {company.whatsappDisplay}. Note: in this preview, bookings are kept in memory and are cleared when the server restarts.</p>
        <Link href="/account" className="btn btn-secondary mt-6">Find my bookings</Link>
      </div>
    );
  if (state === "error" || !b)
    return (
      <div role="alert" className="max-w-2xl">
        <h1 className="text-3xl text-ocean">We couldn't load this booking</h1>
        <button type="button" className="btn btn-primary mt-4" onClick={load}>Try again</button>
      </div>
    );

  const s = statusCopy[b.status];
  const tone = { pending: "badge-warn", good: "badge-good", bad: "badge-bad", neutral: "badge-neutral" }[s.tone];
  const sum = b.summary as Record<string, string | number | undefined>;
  const canCancel = b.status === "request_received" || b.status === "awaiting_confirmation";

  async function cancel(e: React.FormEvent) {
    e.preventDefault();
    setCancelMsg(null);
    const res = await fetch(`/api/bookings/${refCode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "cancel", email: cancelEmail }) });
    const json = await res.json();
    if (!json.ok) return setCancelMsg(json.error);
    setB(json.booking);
    setCancelMsg("Your request has been cancelled. Nothing was charged.");
  }

  return (
    <div className="max-w-3xl">
      {isNew && b.status === "request_received" && (
        <div className="mb-6 rounded-2xl border border-line bg-white p-5" role="status">
          <p className="display text-2xl font-semibold text-ocean">Lekker, your request is in.</p>
          <p className="mt-1 text-ink-2">This is <strong>not a confirmation yet</strong>. {s.explain} We've emailed a copy to {b.contact.email}.</p>
        </div>
      )}
      <p className="text-sm text-ink-3">Booking reference</p>
      <h1 className="display text-3xl font-bold tracking-wide text-ocean">{b.ref}</h1>
      <p className="mt-3"><span className={`badge ${tone} !text-sm !px-3 !py-1`}>{s.label}</span></p>
      <p className="mt-2 max-w-xl text-ink-2">{s.explain}</p>

      <section className="card mt-6 p-5">
        {b.kind === "stay" ? (
          <>
            <h2 className="font-sans text-lg font-bold">{sum.name}</h2>
            <p className="text-ink-2">{sum.area}</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div><dt className="text-ink-3">Check-in</dt><dd className="font-semibold">{formatShort(String(sum.checkin))}</dd></div>
              <div><dt className="text-ink-3">Check-out</dt><dd className="font-semibold">{formatShort(String(sum.checkout))}</dd></div>
              <div><dt className="text-ink-3">Nights</dt><dd className="font-semibold">{sum.nights}</dd></div>
              <div><dt className="text-ink-3">Total</dt><dd className="font-semibold">{formatZar(b.totalZar)}</dd></div>
            </dl>
          </>
        ) : (
          <>
            <h2 className="font-sans text-lg font-bold">{sum.fromCity} ({sum.from}) → {sum.toCity} ({sum.to}){sum.return ? " and back" : ""}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div><dt className="text-ink-3">Depart</dt><dd className="font-semibold">{formatShort(String(sum.depart))}</dd></div>
              {sum.return ? <div><dt className="text-ink-3">Return</dt><dd className="font-semibold">{formatShort(String(sum.return))}</dd></div> : null}
              <div><dt className="text-ink-3">Passengers</dt><dd className="font-semibold">{sum.passengers}</dd></div>
              <div><dt className="text-ink-3">Estimated fare</dt><dd className="font-semibold">{formatZar(b.totalZar)}</dd><dd className="text-xs text-ink-3">to be confirmed</dd></div>
            </dl>
          </>
        )}
        <p className="mt-4 text-sm text-ink-3">Payment: <strong className="text-ink">nothing has been charged.</strong> {b.status === "confirmed" ? "Payment instructions were sent with your confirmation." : "We only send payment instructions once the booking is confirmed."}</p>
      </section>

      <section className="mt-6" aria-labelledby="tl-h">
        <h2 id="tl-h" className="font-sans text-lg font-bold">Timeline</h2>
        <ol className="mt-3 space-y-3 border-l-2 border-line pl-4">
          {b.timeline.map((t, i) => (
            <li key={i}>
              <p className="text-sm font-semibold">{statusCopy[t.status].label} <span className="font-normal text-ink-3">· {new Date(t.at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</span></p>
              <p className="text-sm text-ink-2">{t.note}</p>
            </li>
          ))}
        </ol>
      </section>

      {canCancel && (
        <section className="card mt-6 p-5">
          <h2 className="font-sans text-lg font-bold">Cancel this request</h2>
          <p className="mt-1 text-sm text-ink-2">Free while the request is unconfirmed. Enter the email address you booked with.</p>
          <form onSubmit={cancel} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="cancel-email">Email address</label>
            <input id="cancel-email" type="email" className="field" placeholder="you@example.com" value={cancelEmail} onChange={(e) => setCancelEmail(e.target.value)} required />
            <button type="submit" className="btn btn-outline shrink-0">Cancel request</button>
          </form>
          {cancelMsg && <p className="mt-2 text-sm font-medium" role="status">{cancelMsg}</p>}
        </section>
      )}

      <p className="mt-8 text-sm text-ink-2">
        Questions? WhatsApp <a className="link" href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`}>{company.whatsappDisplay}</a> or email <a className="link" href={`mailto:${company.email}`}>{company.email}</a> and quote {b.ref}.
      </p>
    </div>
  );
}
