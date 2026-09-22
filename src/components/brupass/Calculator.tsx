"use client";

import { useState } from "react";
import { calculateBruPass, type Period } from "@/lib/brupass-calc";
import { brupass } from "@/config/business";
import { formatZar } from "@/lib/money";

export function BruPassCalculator() {
  const [planId, setPlanId] = useState<string>(brupass.plans[0].id);
  const [period, setPeriod] = useState<Period>("annual");
  const [bookings, setBookings] = useState("4");
  const [saving, setSaving] = useState(String(brupass.defaultAssumedSavingPerBookingZar));
  const r = calculateBruPass({ planId: planId as "monthly" | "annual", period, bookings: bookings === "" ? NaN : Number(bookings), assumedSavingPerBookingZar: saving === "" ? NaN : Number(saving) });
  const periodWord = period === "annual" ? "year" : "month";

  return (
    <div className="card p-5 md:p-6" id="calculator">
      <h2 className="text-2xl text-ocean">Is BruPass worth it for you?</h2>
      <p className="mt-1 text-sm text-ink-2">A simple check based on your own numbers. It does not predict fares.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="calc-plan" className="label">Plan</label>
          <select id="calc-plan" className="field" value={planId} onChange={(e) => setPlanId(e.target.value)}>
            {brupass.plans.map((p) => <option key={p.id} value={p.id}>{p.name} · R{p.priceZar} {p.billing === "monthly" ? "per month" : "per year"}</option>)}
          </select>
        </div>
        <div>
          <span className="label">Compare over</span>
          <div className="inline-flex rounded-full border border-line bg-white p-1" role="group" aria-label="Period">
            {(["monthly", "annual"] as Period[]).map((p) => (
              <button key={p} type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${period === p ? "bg-ocean text-white" : "text-ink-2"}`} aria-pressed={period === p} onClick={() => setPeriod(p)}>
                {p === "monthly" ? "A month" : "A year"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="calc-bookings" className="label">Eligible flight bookings per {periodWord}</label>
          <input id="calc-bookings" type="number" inputMode="numeric" min={0} max={100} step={1} className="field" value={bookings} onChange={(e) => setBookings(e.target.value)} aria-describedby="calc-bookings-hint" />
          <p id="calc-bookings-hint" className="hint">One booking = one flight request through BruFly, regardless of passengers.</p>
        </div>
        <div>
          <label htmlFor="calc-saving" className="label">Assumed saving per booking</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-ink-3">R</span>
            <input id="calc-saving" type="number" inputMode="numeric" min={0} max={5000} step={10} className="field !pl-8" value={saving} onChange={(e) => setSaving(e.target.value)} aria-describedby="calc-saving-hint" />
          </div>
          <p id="calc-saving-hint" className="hint">Your assumption. Real savings vary by route and date and are not guaranteed.</p>
        </div>
      </div>

      {!r.valid ? (
        <ul className="mt-4 space-y-1" role="alert">{r.errors.map((e) => <li key={e} className="error-text !mt-0">{e}</li>)}</ul>
      ) : (
        <dl className="mt-6 grid gap-3 sm:grid-cols-2" aria-live="polite">
          <div className="rounded-xl bg-sand-100 p-4"><dt className="text-sm text-ink-2">Membership cost per {periodWord}</dt><dd className="text-xl font-extrabold">{formatZar(r.membershipCostZar)}</dd></div>
          <div className="rounded-xl bg-sand-100 p-4"><dt className="text-sm text-ink-2">Estimated saving per {periodWord}</dt><dd className="text-xl font-extrabold">{formatZar(r.estimatedSavingZar)}</dd><dd className="text-xs text-ink-3">{r.bookings} × {formatZar(r.assumedSavingPerBookingZar)}</dd></div>
          <div className={`rounded-xl p-4 ${r.netZar >= 0 ? "bg-good-100" : "bg-bad-100"}`}>
            <dt className="text-sm text-ink-2">Estimated net {r.netZar >= 0 ? "saving" : "cost"} per {periodWord}</dt>
            <dd className={`text-2xl font-extrabold ${r.netZar >= 0 ? "text-good" : "text-bad"}`}>{formatZar(Math.abs(r.netZar))}</dd>
            {r.netZar < 0 && <dd className="text-xs text-ink-2">On these numbers BruPass would cost you more than it saves.</dd>}
          </div>
          <div className="rounded-xl bg-ocean-100 p-4">
            <dt className="text-sm text-ink-2">Break-even</dt>
            <dd className="text-2xl font-extrabold text-ocean">{Number.isFinite(r.breakEvenBookings) ? `${r.breakEvenBookings} ${r.breakEvenBookings === 1 ? "booking" : "bookings"}` : "—"}</dd>
            <dd className="text-xs text-ink-2">per {periodWord} to cover the membership cost at your assumed saving.</dd>
          </div>
        </dl>
      )}
      <details className="mt-4 text-sm text-ink-2">
        <summary className="cursor-pointer font-semibold">Assumptions and exclusions</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Savings are counted once per booking, not per passenger.</li>
          <li>Annual plans are shown per month as one twelfth of the annual price; the commitment is still 12 months.</li>
          {brupass.trial.days > 0 ? <li>Trial period of {brupass.trial.days} days is not included in the cost.</li> : <li>There is currently no free trial.</li>}
          {brupass.exclusions.map((x) => <li key={x}>{x}</li>)}
        </ul>
      </details>
    </div>
  );
}
