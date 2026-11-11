"use client";

import { useState } from "react";
import { FlightSearchForm } from "@/components/flights/FlightSearchForm";
import { StaySearchForm } from "@/components/stays/StaySearchForm";
import { defaultStaySearch } from "@/lib/search-params";

/** Tabbed hero search: flights and stays side by side, so stays are discoverable from the first screen. */
export function HeroSearch() {
  const [tab, setTab] = useState<"flights" | "stays">("flights");
  return (
    <div className="card overflow-hidden">
      <div role="tablist" aria-label="What are you looking for?" className="flex border-b border-line bg-sand-50">
        {(
          [
            ["flights", "Flights", "M3 12l18-8-6 18-3-7-9-3z"],
            ["stays", "Stays", "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"],
          ] as const
        ).map(([id, label, d]) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            type="button"
            onClick={() => setTab(id)}
            className={`relative flex items-center gap-2 px-5 py-3.5 text-[0.95rem] font-bold transition-colors ${tab === id ? "bg-white text-ocean" : "text-ink-2 hover:text-ink"}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
            {label}
            {tab === id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-sun" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <div className="p-4 md:p-6">
        <div role="tabpanel" id="panel-flights" aria-labelledby="tab-flights" hidden={tab !== "flights"}>
          <FlightSearchForm initial={{}} />
        </div>
        <div role="tabpanel" id="panel-stays" aria-labelledby="tab-stays" hidden={tab !== "stays"}>
          <StaySearchForm initial={defaultStaySearch} showType={false} />
        </div>
      </div>
    </div>
  );
}
