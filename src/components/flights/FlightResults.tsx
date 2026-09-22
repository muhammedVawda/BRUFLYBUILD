"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatZar } from "@/lib/money";
import { formatShort } from "@/lib/dates";
import { track } from "@/lib/analytics";
import type { Airport, FlightRoute } from "@/lib/types";

interface Option { id: string; airline: string; depart: string; arrive: string; durationMin: number; farePerPassengerZar: number; totalZar: number; sample: boolean }

export function FlightResults({ from, to, depart, ret, passengers, route }: { from: Airport; to: Airport; depart: string; ret: string; passengers: number; route: FlightRoute | null }) {
  const [state, setState] = useState<"loading" | "idle" | "error">("loading");
  const [options, setOptions] = useState<Option[]>([]);
  const seq = useRef(0);
  const key = `${from.code}|${to.code}|${passengers}`;

  async function load() {
    const my = ++seq.current;
    setState("loading");
    try {
      const res = await fetch(`/api/flights/search?from=${from.code}&to=${to.code}&passengers=${passengers}`);
      const json = await res.json();
      if (my !== seq.current) return;
      if (!json.ok) throw new Error(json.error);
      setOptions(json.options);
      setState("idle");
      track("results_viewed", { kind: "flight", count: json.options.length });
    } catch {
      if (my !== seq.current) return;
      setState("error");
    }
  }
  useEffect(() => {
    if (route) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!route) {
    return (
      <div className="card p-8" role="alert">
        <p className="display text-xl text-ocean">We don't request {from.city} → {to.city} yet</p>
        <p className="mt-2 text-ink-2">Try one of the routes on our popular list, or ask us on WhatsApp and we'll check the airlines for you.</p>
      </div>
    );
  }
  const hrs = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;

  return (
    <section aria-label="Flight options" aria-busy={state === "loading"}>
      <h2 className="text-xl md:text-2xl text-ocean">
        {from.city} → {to.city} · {formatShort(depart)}{ret ? ` – ${formatShort(ret)}` : " · one way"} · {passengers} {passengers === 1 ? "passenger" : "passengers"}
      </h2>
      <p className="mt-1 rounded-lg bg-warn-100 px-3 py-2 text-sm text-warn">
        <strong>Sample fares.</strong> These times and prices are indicative for this route. Your request is priced live with the airline and confirmed with you before anything is charged.
      </p>
      {state === "error" ? (
        <div className="card mt-4 p-6" role="alert">
          <p className="font-semibold">We couldn't load flight options.</p>
          <button type="button" className="btn btn-primary btn-sm mt-3" onClick={load}>Try again</button>
        </div>
      ) : state === "loading" ? (
        <ul className="mt-4 space-y-3">{[1, 2, 3].map((i) => <li key={i} className="skeleton h-24 w-full" />)}</ul>
      ) : (
        <ul className="mt-4 space-y-3">
          {options.map((o) => (
            <li key={o.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <span className="badge badge-ocean">{o.airline}</span>
                <div>
                  <p className="text-lg font-extrabold tabular-nums">{o.depart} <span className="text-ink-3">→</span> {o.arrive}</p>
                  <p className="text-sm text-ink-2">{from.code} – {to.code} · {hrs(o.durationMin)} · direct</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right">
                  <p className="text-xl font-extrabold">{formatZar(o.totalZar)}{ret ? <span className="text-sm font-medium text-ink-2"> outbound</span> : null}</p>
                  <p className="text-xs text-ink-3">{formatZar(o.farePerPassengerZar)} per passenger · sample fare</p>
                </div>
                <Link
                  href={`/flights/book?from=${from.code}&to=${to.code}&depart=${depart}${ret ? `&return=${ret}` : ""}&passengers=${passengers}&airline=${encodeURIComponent(o.airline)}&time=${o.depart}&fare=${o.farePerPassengerZar}`}
                  className="btn btn-primary btn-sm shrink-0"
                  onClick={() => track("booking_started", { kind: "flight", route: `${from.code}-${to.code}`, airline: o.airline })}
                >
                  Request this fare
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
