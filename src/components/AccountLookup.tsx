"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { statusCopy, type BookingStatus } from "@/lib/booking-status";
import { formatZar } from "@/lib/money";

interface Item { ref: string; kind: "stay" | "flight"; status: BookingStatus; createdAt: string; totalZar: number; summary: Record<string, unknown> }

export function AccountLookup() {
  const router = useRouter();
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [items, setItems] = useState<Item[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function byEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setItems(json.items);
    } catch (x) {
      setErr((x as Error).message || "Couldn't look up bookings.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); if (ref.trim()) router.push(`/bookings/${ref.trim().toUpperCase()}`); }} className="card p-5">
        <label htmlFor="ref" className="label">Booking reference</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="ref" className="field uppercase" placeholder="e.g. BS-7KQ2MN" value={ref} onChange={(e) => setRef(e.target.value)} />
          <button type="submit" className="btn btn-secondary shrink-0">Open booking</button>
        </div>
      </form>
      <form onSubmit={byEmail} className="card p-5">
        <label htmlFor="em" className="label">Or the email address you booked with</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="em" type="email" className="field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="btn btn-outline shrink-0" disabled={loading}>{loading ? "Searching…" : "Find bookings"}</button>
        </div>
        {err && <p className="error-text" role="alert">{err}</p>}
      </form>
      {items && (
        <section aria-live="polite">
          <h2 className="font-sans text-lg font-bold">{items.length ? `${items.length} ${items.length === 1 ? "booking" : "bookings"}` : "No bookings for that email"}</h2>
          <ul className="mt-3 space-y-3">
            {items.map((b) => {
              const s = statusCopy[b.status];
              const tone = { pending: "badge-warn", good: "badge-good", bad: "badge-bad", neutral: "badge-neutral" }[s.tone];
              const title = b.kind === "stay" ? String(b.summary.name) : `${b.summary.fromCity} → ${b.summary.toCity}`;
              return (
                <li key={b.ref}>
                  <Link href={`/bookings/${b.ref}`} className="card card-hover flex items-center justify-between gap-4 p-4">
                    <div><p className="font-semibold">{title}</p><p className="text-sm text-ink-3">{b.ref} · {new Date(b.createdAt).toLocaleDateString("en-ZA")}</p></div>
                    <div className="text-right"><span className={`badge ${tone}`}>{s.label}</span><p className="mt-1 text-sm">{formatZar(b.totalZar)}{b.kind === "flight" ? " est." : ""}</p></div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
