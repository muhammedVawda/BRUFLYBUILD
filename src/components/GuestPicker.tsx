"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface GuestValue {
  adults: number;
  children: number;
  childAges: number[];
  rooms: number;
}

interface Props {
  value: GuestValue;
  onChange: (v: GuestValue) => void;
  /** Show the rooms control (hotels / room-based inventory). */
  rooms?: boolean;
  /** Ask for each child's age (supplier prices by age). */
  childAges?: boolean;
  maxGuests?: number;
  compact?: boolean;
  label?: string;
}

function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint?: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p id={id} className="font-semibold">{label}</p>
        {hint && <p className="text-xs text-ink-3">{hint}</p>}
      </div>
      <div className="flex items-center gap-2" role="group" aria-labelledby={id}>
        <button type="button" className="btn btn-outline h-10 w-10 !min-h-0 !p-0 text-lg" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
        <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">{value}</span>
        <button type="button" className="btn btn-outline h-10 w-10 !min-h-0 !p-0 text-lg" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

export function guestSummary(v: GuestValue, rooms = false): string {
  const parts = [`${v.adults} ${v.adults === 1 ? "adult" : "adults"}`];
  if (v.children) parts.push(`${v.children} ${v.children === 1 ? "child" : "children"}`);
  if (rooms && v.rooms > 1) parts.push(`${v.rooms} rooms`);
  return parts.join(", ");
}

export function GuestPicker({ value, onChange, rooms = false, childAges = false, maxGuests = 16, compact = false, label = "Guests" }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!pop.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const total = value.adults + value.children;

  return (
    <div className="relative">
      <label htmlFor={id} className="label">{label}</label>
      <button
        id={id}
        ref={btn}
        type="button"
        className={`field flex items-center text-left ${compact ? "min-h-[44px]" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {guestSummary(value, rooms)}
      </button>
      {open && (
        <div ref={pop} role="dialog" aria-label="Guests" className="absolute right-0 z-40 mt-2 w-[min(92vw,320px)] rounded-2xl border border-line bg-white p-4 shadow-lg fade-in">
          <Stepper label="Adults" hint="Ages 18+" value={value.adults} min={1} max={Math.max(1, maxGuests - value.children)} onChange={(n) => onChange({ ...value, adults: n })} />
          <Stepper
            label="Children"
            hint="Ages 0–17"
            value={value.children}
            min={0}
            max={Math.max(0, maxGuests - value.adults)}
            onChange={(n) => onChange({ ...value, children: n, childAges: value.childAges.slice(0, n).concat(Array(Math.max(0, n - value.childAges.length)).fill(-1)).map((a) => (a < 0 ? 8 : a)) })}
          />
          {childAges && value.children > 0 && (
            <div className="mt-1 grid grid-cols-2 gap-2 border-t border-line pt-3">
              {Array.from({ length: value.children }).map((_, i) => (
                <label key={i} className="text-sm">
                  <span className="label !mb-1">Child {i + 1} age</span>
                  <select
                    className="field !min-h-[44px]"
                    value={value.childAges[i] ?? 8}
                    onChange={(e) => {
                      const ages = [...value.childAges];
                      ages[i] = Number(e.target.value);
                      onChange({ ...value, childAges: ages });
                    }}
                  >
                    {Array.from({ length: 18 }).map((_, a) => (
                      <option key={a} value={a}>{a === 0 ? "Under 1" : a}</option>
                    ))}
                  </select>
                </label>
              ))}
              <p className="col-span-2 text-xs text-ink-3">Ages are needed because this property prices children by age.</p>
            </div>
          )}
          {rooms && <Stepper label="Rooms" value={value.rooms} min={1} max={6} onChange={(n) => onChange({ ...value, rooms: n })} />}
          {total >= maxGuests && <p className="mt-2 text-xs text-warn">Maximum {maxGuests} guests for this search.</p>}
          <div className="mt-3 flex justify-end border-t border-line pt-3">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setOpen(false); btn.current?.focus(); }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
