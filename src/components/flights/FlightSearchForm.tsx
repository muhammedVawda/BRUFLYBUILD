"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { DateRangePicker } from "@/components/DateRangePicker";
import { airports, findRoute } from "@/lib/data/airports";
import { validateDateRange, dateRangeMessages, today, toISODate, parseISODate } from "@/lib/dates";
import { track } from "@/lib/analytics";

export interface FlightSearch {
  from: string;
  to: string;
  depart: string;
  return: string;
  passengers: number;
  oneWay: boolean;
}

export function FlightSearchForm({ initial, variant = "hero" }: { initial: Partial<FlightSearch>; variant?: "hero" | "bar" }) {
  const id = useId();
  const router = useRouter();
  const [s, setS] = useState<FlightSearch>({ from: initial.from ?? "JNB", to: initial.to ?? "CPT", depart: initial.depart ?? "", return: initial.return ?? "", passengers: initial.passengers ?? 1, oneWay: initial.oneWay ?? false });
  const [err, setErr] = useState<{ route?: string; dates?: string }>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof err = {};
    if (s.from === s.to) errs.route = "Choose two different airports.";
    else if (!findRoute(s.from, s.to)) errs.route = "We don't request this route yet. Try Johannesburg, Cape Town, Durban, George, Gqeberha, East London, Bloemfontein or Nelspruit.";
    if (!s.depart) errs.dates = "Choose a departure date.";
    else if ((parseISODate(s.depart) ?? today()) < today()) errs.dates = "Departure can't be in the past.";
    else if (!s.oneWay) {
      const v = validateDateRange(s.depart, s.return);
      if (!v.ok) errs.dates = v.error === "checkout_invalid" ? "Choose a return date, or switch to one way." : v.error === "checkout_not_after_checkin" ? "Return must be after departure." : dateRangeMessages[v.error];
    }
    setErr(errs);
    if (Object.keys(errs).length) return;
    track("search_submitted", { kind: "flight", route: `${s.from}-${s.to}`, passengers: s.passengers, one_way: s.oneWay });
    const p = new URLSearchParams({ from: s.from, to: s.to, depart: s.depart, passengers: String(s.passengers) });
    if (!s.oneWay && s.return) p.set("return", s.return);
    router.push(`/flights?${p.toString()}`);
  }

  const bar = variant === "bar";
  const sel = (label: string, key: "from" | "to") => (
    <div>
      <label htmlFor={`${id}-${key}`} className="label">{label}</label>
      <select id={`${id}-${key}`} className={`field ${bar ? "!min-h-[44px]" : ""}`} value={s[key]} onChange={(e) => setS({ ...s, [key]: e.target.value })} aria-invalid={Boolean(err.route)}>
        {airports.map((a) => (
          <option key={a.code} value={a.code}>{a.city} ({a.code}){a.city === "Johannesburg" ? ` · ${a.name.split(" ")[0]}` : ""}</option>
        ))}
      </select>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate aria-label="Search flights" className="grid gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="radio" name={`${id}-trip`} checked={!s.oneWay} onChange={() => setS({ ...s, oneWay: false })} className="accent-[var(--brand-ocean)]" /> Return</label>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="radio" name={`${id}-trip`} checked={s.oneWay} onChange={() => setS({ ...s, oneWay: true, return: "" })} className="accent-[var(--brand-ocean)]" /> One way</label>
      </div>
      <div className={`grid gap-3 ${bar ? "md:grid-cols-[1fr_1fr_1.4fr_0.8fr_auto] md:items-end" : "sm:grid-cols-2 md:grid-cols-[1fr_1fr] lg:grid-cols-[0.9fr_0.9fr_2fr_0.6fr] md:items-end"}`}>
        {sel("From", "from")}
        {sel("To", "to")}
        <DateRangePicker
          checkin={s.depart}
          checkout={s.return}
          single={s.oneWay}
          labels={{ start: "Depart", end: "Return" }}
          onChange={(depart, ret) => { setErr({}); setS({ ...s, depart, return: ret }); }}
          error={err.dates}
          compact={bar}
        />
        <div>
          <label htmlFor={`${id}-pax`} className="label">Passengers</label>
          <select id={`${id}-pax`} className={`field ${bar ? "!min-h-[44px]" : ""}`} value={s.passengers} onChange={(e) => setS({ ...s, passengers: Number(e.target.value) })}>
            {Array.from({ length: 9 }).map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
          </select>
        </div>
        {bar && <button type="submit" className="btn btn-primary w-full md:w-auto">Search flights</button>}
      </div>
      {err.route && <p className="error-text" role="alert">{err.route}</p>}
      {!bar && (
        <div>
          <button type="submit" className="btn btn-primary btn-lg w-full md:w-auto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            Search flights
          </button>
          <p className="mt-2 text-xs text-ink-3">{toISODate(today()) ? "Fares on FlySafair and LIFT. A BruFly team member checks every request before it is ticketed." : ""}</p>
        </div>
      )}
    </form>
  );
}
