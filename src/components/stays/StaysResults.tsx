"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StaySearchForm } from "@/components/stays/StaySearchForm";
import { FilterPanel } from "@/components/stays/FilterPanel";
import { StayCard } from "@/components/stays/StayCard";
import { StaysMap } from "@/components/stays/StaysMap";
import { activeFilterCount, parseStaySearch, serializeStaySearch, stayContextParams, AMENITIES, PROPERTY_TYPES, type SortKey, type StaySearch } from "@/lib/search-params";
import type { StaySearchResponse } from "@/lib/search";
import { formatRange } from "@/lib/dates";
import { track } from "@/lib/analytics";
import { destinations } from "@/lib/data/destinations";
import type { Amenity, PropertyType } from "@/lib/types";

interface Props {
  initialKey: string;
  initialData: StaySearchResponse;
  /** Amenities/types/prices available across the whole inventory (for filters). */
  facets: { amenities: Amenity[]; types: PropertyType[]; price: { min: number; max: number } };
}

/**
 * The URL is the single source of truth: every change to search or
 * filters is written to the query string, so results are shareable and
 * browser back/forward restores the previous search. Fetches are
 * sequenced: a slower, older response can never overwrite a newer one.
 */
export function StaysResults({ initialKey, initialData, facets }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const key = params.toString();
  const search = useMemo(() => parseStaySearch(params), [params]);

  const [data, setData] = useState<StaySearchResponse>(initialData);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const seq = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const lastKey = useRef(initialKey);
  const filterBtn = useRef<HTMLButtonElement>(null);

  const load = useCallback(async (k: string) => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    const mySeq = ++seq.current;
    setStatus("loading");
    try {
      const res = await fetch(`/api/stays/search?${k}`, { signal: controller.signal, headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as StaySearchResponse;
      if (mySeq !== seq.current) return; // stale response: ignore
      setData(json);
      setStatus("idle");
      track("results_viewed", { kind: "stay", count: json.total, has_dates: json.nights > 0 });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      if (mySeq !== seq.current) return;
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (key === lastKey.current) return;
    lastKey.current = key;
    load(key);
  }, [key, load]);

  function update(next: StaySearch, mode: "push" | "replace" = "replace") {
    const qs = serializeStaySearch(next).toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (mode === "push") router.push(url, { scroll: false });
    else router.replace(url, { scroll: false });
  }

  function resetFilters() {
    update({ ...search, types: [], minPrice: null, maxPrice: null, bedrooms: null, amenities: [], cancellation: null }, "push");
  }

  // Focus management for the mobile filter sheet.
  useEffect(() => {
    if (!filtersOpen) return;
    document.body.dataset.scrollLock = "true";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFiltersOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      delete document.body.dataset.scrollLock;
      document.removeEventListener("keydown", onKey);
      filterBtn.current?.focus();
    };
  }, [filtersOpen]);

  const ctx = stayContextParams(search).toString();
  const hrefFor = (slug: string) => `/stays/${slug}${ctx ? `?${ctx}` : ""}`;
  const nFilters = activeFilterCount(search);
  const dest = data.destination ? destinations.find((d) => d.slug === data.destination!.slug) : null;
  const guestsLabel = `${search.adults} ${search.adults === 1 ? "adult" : "adults"}${search.children ? `, ${search.children} ${search.children === 1 ? "child" : "children"}` : ""}${search.rooms > 1 ? `, ${search.rooms} rooms` : ""}`;

  const chips: { label: string; onRemove: () => void }[] = [];
  for (const t of search.types) chips.push({ label: PROPERTY_TYPES.find((x) => x.id === t)?.label ?? t, onRemove: () => update({ ...search, types: search.types.filter((x) => x !== t) }, "push") });
  if (search.minPrice != null || search.maxPrice != null) chips.push({ label: `R${search.minPrice ?? 0}–${search.maxPrice != null ? `R${search.maxPrice}` : "any"} per night`, onRemove: () => update({ ...search, minPrice: null, maxPrice: null }, "push") });
  if (search.bedrooms != null) chips.push({ label: `${search.bedrooms}+ bedrooms`, onRemove: () => update({ ...search, bedrooms: null }, "push") });
  for (const a of search.amenities) chips.push({ label: AMENITIES.find((x) => x.id === a)?.label ?? a, onRemove: () => update({ ...search, amenities: search.amenities.filter((x) => x !== a) }, "push") });
  if (search.cancellation) chips.push({ label: search.cancellation === "flexible" ? "Free cancellation (24 h)" : "Free cancellation (7 days)", onRemove: () => update({ ...search, cancellation: null }, "push") });

  const filterPanel = (
    <FilterPanel value={search} onChange={(v) => update(v, "replace")} onReset={resetFilters} availableAmenities={facets.amenities} availableTypes={facets.types} priceRange={facets.price} />
  );

  return (
    <div>
      {/* Search bar */}
      <div className="card p-4 md:p-5">
        <StaySearchForm key={key} initial={search} variant="bar" showType={false} onSearch={(s) => update({ ...s, view: search.view }, "push")} />
      </div>

      {/* Summary row */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl text-ocean" aria-live="polite">
            {status === "loading" ? "Searching…" : `${data.total} ${data.total === 1 ? "stay" : "stays"}${dest ? ` in ${dest.name}` : " across South Africa"}`}
          </h2>
          <p className="mt-0.5 text-sm text-ink-2">
            {data.nights > 0 ? `${formatRange(search.checkin, search.checkout)} · ${data.nights} ${data.nights === 1 ? "night" : "nights"} · ` : "Add dates to see total prices · "}
            {guestsLabel}
          </p>
          {data.dateError && <p className="error-text" role="alert">{data.dateError}</p>}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">
            <span className="sr-only">Sort results</span>
            <select className="field !min-h-[44px] !w-auto !pr-8" value={search.sort} onChange={(e) => update({ ...search, sort: e.target.value as SortKey }, "push")}>
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="rating">Guest rating</option>
            </select>
          </label>
          <div className="inline-flex rounded-full border border-line bg-white p-1" role="group" aria-label="View">
            <button type="button" className={`rounded-full px-3 py-1.5 text-sm font-semibold ${search.view === "list" ? "bg-ocean text-white" : "text-ink-2"}`} aria-pressed={search.view === "list"} onClick={() => update({ ...search, view: "list" })}>List</button>
            <button type="button" className={`rounded-full px-3 py-1.5 text-sm font-semibold ${search.view === "map" ? "bg-ocean text-white" : "text-ink-2"}`} aria-pressed={search.view === "map"} onClick={() => update({ ...search, view: "map" })}>Map</button>
          </div>
          <button ref={filterBtn} type="button" className="btn btn-outline btn-sm lg:hidden" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(true)}>
            Filters{nFilters ? ` (${nFilters})` : ""}
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="Active filters">
          {chips.map((c) => (
            <li key={c.label}>
              <button type="button" className="chip chip-on" onClick={c.onRemove} aria-label={`Remove filter ${c.label}`}>
                {c.label} <span aria-hidden="true">✕</span>
              </button>
            </li>
          ))}
          <li>
            <button type="button" className="link text-sm" onClick={resetFilters}>Clear all</button>
          </li>
        </ul>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky p-5" style={{ top: "calc(var(--header-h) + 16px)" }}>
            <h2 className="mb-4 font-sans text-base font-bold">Filters</h2>
            {filterPanel}
          </div>
        </aside>

        <section aria-label="Results" aria-busy={status === "loading"}>
          {status === "error" ? (
            <div className="card p-8 text-center" role="alert">
              <p className="display text-xl text-ocean">We couldn't load stays right now.</p>
              <p className="mt-2 text-ink-2">Your search hasn't been lost. Check your connection and try again.</p>
              <button type="button" className="btn btn-primary mt-4" onClick={() => load(key)}>Try again</button>
            </div>
          ) : search.view === "map" ? (
            <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
              <div className="h-[60vh] min-h-[380px] xl:h-[calc(100vh-var(--header-h)-120px)] xl:sticky" style={{ top: "calc(var(--header-h) + 16px)" }}>
                <StaysMap results={data.results} hrefFor={hrefFor} focusDestination={dest ? { lat: dest.lat, lng: dest.lng } : null} />
              </div>
              <div className="hidden xl:block space-y-4">
                {data.results.map((r) => (
                  <StayCard key={r.property.slug} r={r} href={hrefFor(r.property.slug)} nights={data.nights} />
                ))}
              </div>
            </div>
          ) : status === "loading" && data.results.length === 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2" aria-label="Loading results">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="card overflow-hidden">
                  <div className="skeleton aspect-[4/3] w-full !rounded-none" />
                  <div className="space-y-2 p-4">
                    <div className="skeleton h-4 w-1/3" />
                    <div className="skeleton h-6 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                </li>
              ))}
            </ul>
          ) : data.results.length === 0 ? (
            <div className="card p-8">
              <p className="display text-2xl text-ocean">No stays match all of your filters</p>
              <p className="mt-2 text-ink-2">
                {data.totalBeforeFilters > 0
                  ? `There ${data.totalBeforeFilters === 1 ? "is" : "are"} ${data.totalBeforeFilters} ${data.totalBeforeFilters === 1 ? "stay" : "stays"}${dest ? ` in ${dest.name}` : ""} before filters. Try one of these:`
                  : "We don't have stays in that destination yet. Try one of the places we cover:"}
              </p>
              {data.relaxations.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {data.relaxations.map((rx) => (
                    <li key={rx.param}>
                      <button
                        type="button"
                        className="chip"
                        onClick={() => {
                          const next = { ...search };
                          if (rx.param === "amenities") next.amenities = [];
                          if (rx.param === "type") next.types = [];
                          if (rx.param === "price") { next.minPrice = null; next.maxPrice = null; }
                          if (rx.param === "bedrooms") next.bedrooms = null;
                          if (rx.param === "cancellation") next.cancellation = null;
                          if (rx.param === "guests") { next.adults = 2; next.children = 0; next.childAges = []; }
                          if (rx.param === "destination") next.destination = "";
                          update(next, "push");
                        }}
                      >
                        {rx.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {destinations.map((d) => (
                    <li key={d.slug}>
                      <button type="button" className="chip" onClick={() => update({ ...search, destination: d.name }, "push")}>{d.name}</button>
                    </li>
                  ))}
                </ul>
              )}
              {nFilters > 0 && (
                <button type="button" className="btn btn-secondary mt-5" onClick={resetFilters}>Reset all filters</button>
              )}
            </div>
          ) : (
            <ul className={`grid gap-5 sm:grid-cols-2 transition-opacity ${status === "loading" ? "opacity-60" : ""}`}>
              {data.results.map((r, i) => (
                <li key={r.property.slug}>
                  <StayCard r={r} href={hrefFor(r.property.slug)} nights={data.nights} priority={i < 2} />
                </li>
              ))}
            </ul>
          )}
          {data.total > 0 && data.total < data.totalBeforeFilters && (
            <p className="mt-6 text-sm text-ink-3">
              Showing {data.total} of {data.totalBeforeFilters} stays{dest ? ` in ${dest.name}` : ""}. <button type="button" className="link" onClick={resetFilters}>Show all</button>
            </p>
          )}
          <p className="mt-8 text-sm text-ink-3">
            Looking for somewhere we don't list yet? <Link href="/host" className="link">Hosts can list their place with BruFly</Link>.
          </p>
        </section>
      </div>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="presentation" onClick={() => setFiltersOpen(false)}>
          <div className="absolute inset-0 bg-ocean/50 fade-in" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-lg sheet-enter"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-sans text-lg font-bold">Filters</h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setFiltersOpen(false)}>Close</button>
            </div>
            {filterPanel}
            <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => setFiltersOpen(false)}>
              Show {data.total} {data.total === 1 ? "stay" : "stays"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
