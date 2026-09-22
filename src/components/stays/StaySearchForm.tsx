"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DestinationInput } from "@/components/DestinationInput";
import { DateRangePicker } from "@/components/DateRangePicker";
import { GuestPicker } from "@/components/GuestPicker";
import { validateDateRange, dateRangeMessages } from "@/lib/dates";
import { serializeStaySearch, PROPERTY_TYPES, type StaySearch } from "@/lib/search-params";
import { track } from "@/lib/analytics";
import type { PropertyType } from "@/lib/types";

interface Props {
  initial: StaySearch;
  /** Called instead of navigating when provided (results page keeps state in URL). */
  onSearch?: (s: StaySearch) => void;
  variant?: "hero" | "bar";
  showType?: boolean;
}

export function StaySearchForm({ initial, onSearch, variant = "hero", showType = true }: Props) {
  const router = useRouter();
  const [s, setS] = useState<StaySearch>(initial);
  const [dateError, setDateError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (s.checkin || s.checkout) {
      const v = validateDateRange(s.checkin, s.checkout);
      if (!v.ok) {
        setDateError(dateRangeMessages[v.error]);
        return;
      }
    }
    setDateError(null);
    track("search_submitted", { kind: "stay", has_dates: Boolean(s.checkin), adults: s.adults, children: s.children, destination: s.destination || "anywhere" });
    if (onSearch) onSearch(s);
    else router.push(`/stays?${serializeStaySearch(s).toString()}`);
  }

  const bar = variant === "bar";
  return (
    <form onSubmit={submit} className={bar ? "grid gap-3 md:grid-cols-[1.3fr_1.6fr_1fr_auto] md:items-end" : "grid gap-4 md:grid-cols-[1.3fr_1.6fr_1fr] md:items-end"} aria-label="Search stays" noValidate>
      <DestinationInput value={s.destination} onChange={(destination) => setS({ ...s, destination })} compact={bar} />
      <DateRangePicker
        checkin={s.checkin}
        checkout={s.checkout}
        onChange={(checkin, checkout) => {
          setDateError(null);
          setS({ ...s, checkin, checkout });
        }}
        error={dateError}
        compact={bar}
      />
      <GuestPicker
        value={{ adults: s.adults, children: s.children, childAges: s.childAges, rooms: s.rooms }}
        onChange={(g) => setS({ ...s, adults: g.adults, children: g.children, childAges: g.childAges, rooms: g.rooms })}
        rooms
        compact={bar}
      />
      {showType && !bar && (
        <fieldset className="md:col-span-3">
          <legend className="label">Type of place (optional)</legend>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((t) => {
              const on = s.types.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  className="chip"
                  aria-pressed={on}
                  onClick={() => setS({ ...s, types: on ? s.types.filter((x) => x !== t.id) : [...s.types, t.id as PropertyType] })}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      <div className={bar ? "" : "md:col-span-3"}>
        <button type="submit" className={`btn btn-primary ${bar ? "w-full md:w-auto" : "btn-lg w-full md:w-auto"}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          Search stays
        </button>
      </div>
    </form>
  );
}
