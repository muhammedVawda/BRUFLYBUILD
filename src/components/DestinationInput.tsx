"use client";

import { useEffect, useId, useRef, useState } from "react";
import { suggestDestinations } from "@/lib/data/destinations";
import { propertiesForDestination } from "@/lib/data/properties";

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  compact?: boolean;
  error?: string | null;
}

/** Destination autocomplete backed by the real destination list (with stay counts). */
export function DestinationInput({ value, onChange, label = "Where to?", placeholder = "City, town or region", compact = false, error }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrap = useRef<HTMLDivElement>(null);
  const items = suggestDestinations(value, 6);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function choose(name: string) {
    onChange(name);
    setOpen(false);
    setActive(-1);
  }

  return (
    <div ref={wrap} className="relative">
      <label htmlFor={id} className="label">{label}</label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        aria-autocomplete="list"
        aria-invalid={error ? true : undefined}
        autoComplete="off"
        className={`field ${compact ? "min-h-[44px]" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(items.length - 1, a + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(-1, a - 1));
          } else if (e.key === "Enter" && open && active >= 0) {
            e.preventDefault();
            choose(items[active].name);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {error && <p className="error-text" role="alert">{error}</p>}
      {open && items.length > 0 && (
        <ul id={`${id}-list`} role="listbox" className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-2xl border border-line bg-white py-1 shadow-lg fade-in">
          {items.map((d, i) => {
            const count = propertiesForDestination(d.slug).length;
            return (
              <li
                key={d.slug}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                className={`flex cursor-pointer items-center justify-between px-4 py-2.5 ${i === active ? "bg-sand-100" : "hover:bg-sand-100"}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(d.name)}
                onMouseEnter={() => setActive(i)}
              >
                <span>
                  <span className="font-semibold">{d.name}</span>
                  <span className="ml-2 text-sm text-ink-3">{d.province}</span>
                </span>
                <span className="text-xs text-ink-3">{count} {count === 1 ? "stay" : "stays"}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
