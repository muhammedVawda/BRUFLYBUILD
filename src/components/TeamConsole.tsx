"use client";

import { useState } from "react";
import { statusCopy, type BookingStatus } from "@/lib/booking-status";
import type { BookingRecord } from "@/lib/bookings-store";
import { formatZar } from "@/lib/money";

export function TeamConsole() {
  const [token, setToken] = useState("");
  const [ref, setRef] = useState("");
  const [b, setB] = useState<BookingRecord | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function load(e?: React.FormEvent) {
    e?.preventDefault();
    setMsg(null);
    const res = await fetch(`/api/bookings/${ref.trim().toUpperCase()}`);
    const json = await res.json();
    if (!json.ok) return setMsg(json.error);
    setB(json.booking);
  }
  async function move(status: BookingStatus) {
    setMsg(null);
    const res = await fetch("/api/team", { method: "POST", headers: { "content-type": "application/json", "x-team-token": token }, body: JSON.stringify({ ref: b?.ref, status, note }) });
    const json = await res.json();
    if (!json.ok) return setMsg(json.error);
    setB(json.booking);
    setNote("");
    setMsg(`Moved to ${statusCopy[status].label}.`);
  }
  const next: BookingStatus[] = b ? ({ request_received: ["awaiting_confirmation", "confirmed", "declined"], awaiting_confirmation: ["confirmed", "declined"], confirmed: ["cancelled"], declined: [], cancelled: [] } as Record<BookingStatus, BookingStatus[]>)[b.status] : [];

  return (
    <div className="space-y-6">
      <form onSubmit={load} className="card grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div><label htmlFor="tt" className="label">Team token</label><input id="tt" type="password" className="field" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" /></div>
        <div><label htmlFor="tr" className="label">Booking reference</label><input id="tr" className="field uppercase" value={ref} onChange={(e) => setRef(e.target.value)} /></div>
        <button type="submit" className="btn btn-secondary">Load</button>
      </form>
      {msg && <p className="rounded-xl bg-sand-100 p-3 text-sm font-medium" role="status">{msg}</p>}
      {b && (
        <section className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="display text-xl font-semibold text-ocean">{b.ref} <span className="ml-2 badge badge-ocean">{statusCopy[b.status].label}</span></h2>
            <p className="text-sm text-ink-2">{b.kind} · {formatZar(b.totalZar)}{b.kind === "flight" ? " est." : ""}</p>
          </div>
          <p className="mt-1 text-sm text-ink-2">{b.contact.name} · {b.contact.email} · {b.contact.phone}</p>
          <pre className="mt-3 max-h-48 overflow-auto rounded-xl bg-sand-100 p-3 text-xs">{JSON.stringify(b.summary, null, 2)}</pre>
          {next.length > 0 ? (
            <>
              <label htmlFor="note" className="label mt-4">Note to customer (optional)</label>
              <input id="note" className="field" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
              <div className="mt-3 flex flex-wrap gap-2">
                {next.map((s) => (
                  <button key={s} type="button" className={`btn btn-sm ${s === "confirmed" ? "btn-primary" : s === "declined" || s === "cancelled" ? "btn-outline" : "btn-secondary"}`} onClick={() => move(s)}>
                    Mark {statusCopy[s].label.toLowerCase()}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-ink-3">This booking is in a final state.</p>
          )}
        </section>
      )}
    </div>
  );
}
