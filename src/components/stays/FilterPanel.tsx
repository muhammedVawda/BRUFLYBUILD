"use client";

import { AMENITIES, CANCELLATION_OPTIONS, PROPERTY_TYPES, type StaySearch } from "@/lib/search-params";
import type { Amenity, PropertyType } from "@/lib/types";

interface Props {
  value: StaySearch;
  onChange: (v: StaySearch) => void;
  onReset: () => void;
  /** Amenities actually present in the current destination pool, so we don't offer dead filters. */
  availableAmenities: Amenity[];
  availableTypes: PropertyType[];
  priceRange: { min: number; max: number };
}

export function FilterPanel({ value, onChange, onReset, availableAmenities, availableTypes, priceRange }: Props) {
  const types = PROPERTY_TYPES.filter((t) => availableTypes.includes(t.id));
  const amenities = AMENITIES.filter((a) => availableAmenities.includes(a.id));
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-2 font-semibold">Price per night</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">
            <span className="label !mb-1">Min</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">R</span>
              <input type="number" inputMode="numeric" min={0} step={100} className="field !min-h-[44px] !pl-7" placeholder={String(priceRange.min)} value={value.minPrice ?? ""} onChange={(e) => onChange({ ...value, minPrice: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) })} />
            </div>
          </label>
          <label className="text-sm">
            <span className="label !mb-1">Max</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">R</span>
              <input type="number" inputMode="numeric" min={0} step={100} className="field !min-h-[44px] !pl-7" placeholder={String(priceRange.max)} value={value.maxPrice ?? ""} onChange={(e) => onChange({ ...value, maxPrice: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) })} />
            </div>
          </label>
        </div>
        <p className="hint">Base nightly rate, before once-off fees. Stays here range {`R${priceRange.min}–R${priceRange.max}`}.</p>
      </fieldset>

      {types.length > 1 && (
        <fieldset>
          <legend className="mb-2 font-semibold">Property type</legend>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => {
              const on = value.types.includes(t.id);
              return (
                <button key={t.id} type="button" className="chip" aria-pressed={on} onClick={() => onChange({ ...value, types: on ? value.types.filter((x) => x !== t.id) : [...value.types, t.id] })}>
                  {t.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 font-semibold">Bedrooms</legend>
        <div className="flex flex-wrap gap-2">
          {[null, 1, 2, 3, 4].map((n) => (
            <button key={String(n)} type="button" className="chip" aria-pressed={value.bedrooms === n} onClick={() => onChange({ ...value, bedrooms: n })}>
              {n === null ? "Any" : `${n}+`}
            </button>
          ))}
        </div>
      </fieldset>

      {amenities.length > 0 && (
        <fieldset>
          <legend className="mb-2 font-semibold">Amenities</legend>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
            {amenities.map((a) => (
              <li key={a.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-line accent-[var(--brand-ocean)]"
                    checked={value.amenities.includes(a.id)}
                    onChange={(e) => onChange({ ...value, amenities: e.target.checked ? [...value.amenities, a.id] : value.amenities.filter((x) => x !== a.id) })}
                  />
                  {a.label}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 font-semibold">Cancellation</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={value.cancellation === null} onClick={() => onChange({ ...value, cancellation: null })}>Any</button>
          {CANCELLATION_OPTIONS.map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={value.cancellation === c.id} onClick={() => onChange({ ...value, cancellation: c.id })}>
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>

      <button type="button" className="btn btn-outline btn-sm w-full" onClick={onReset}>
        Reset filters
      </button>
    </div>
  );
}
