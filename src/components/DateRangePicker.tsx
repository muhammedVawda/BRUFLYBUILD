"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { addDays, formatShort, nightsBetween, parseISODate, toISODate, today } from "@/lib/dates";

interface Props {
  checkin: string;
  checkout: string;
  onChange: (checkin: string, checkout: string) => void;
  /** Shown under the fields (e.g. validation). */
  error?: string | null;
  labels?: { start: string; end: string };
  /** Single date mode (flights one-way). */
  single?: boolean;
  minNights?: number;
  compact?: boolean;
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dow = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/**
 * Lightweight date-range picker. Two months side by side on wide screens,
 * one on phones. Past dates are disabled. Keyboard: arrow keys move, Enter
 * selects, Escape closes and restores focus.
 */
export function DateRangePicker({ checkin, checkout, onChange, error, labels, single = false, minNights = 1, compact = false }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState<"start" | "end">("start");
  const [hover, setHover] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string>(checkin || toISODate(today()));
  const min = today();
  const startBtn = useRef<HTMLButtonElement>(null);
  const endBtn = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = parseISODate(checkin) ?? today();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 720px)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node) && !startBtn.current?.contains(e.target as Node) && !endBtn.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        (focus === "start" ? startBtn : endBtn).current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, focus]);

  const nights = nightsBetween(checkin, checkout);

  function pick(iso: string) {
    if (single) {
      onChange(iso, "");
      setOpen(false);
      startBtn.current?.focus();
      return;
    }
    if (focus === "start" || !checkin || (checkout && iso < checkin)) {
      onChange(iso, "");
      setFocus("end");
      return;
    }
    // choosing end
    if (iso <= checkin) {
      onChange(iso, "");
      setFocus("end");
      return;
    }
    onChange(checkin, iso);
    setOpen(false);
    endBtn.current?.focus();
  }

  const grid = useMemo(() => {
    const monthsToShow = wide && !single ? 2 : 1;
    const out: { label: string; cells: (string | null)[] }[] = [];
    for (let m = 0; m < monthsToShow; m++) {
      const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + m, 1);
      const offset = (first.getDay() + 6) % 7; // Monday first
      const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      const cells: (string | null)[] = Array(offset).fill(null);
      for (let d = 1; d <= days; d++) cells.push(toISODate(new Date(first.getFullYear(), first.getMonth(), d)));
      out.push({ label: `${months[first.getMonth()]} ${first.getFullYear()}`, cells });
    }
    return out;
  }, [viewMonth, wide, single]);

  const minIso = toISODate(min);
  const rangeEnd = checkout || (focus === "end" && hover && checkin && hover > checkin ? hover : "");

  function onGridKey(e: React.KeyboardEvent, iso: string) {
    const d = parseISODate(iso)!;
    let next: Date | null = null;
    if (e.key === "ArrowRight") next = addDays(d, 1);
    if (e.key === "ArrowLeft") next = addDays(d, -1);
    if (e.key === "ArrowDown") next = addDays(d, 7);
    if (e.key === "ArrowUp") next = addDays(d, -7);
    if (next) {
      e.preventDefault();
      const n = toISODate(next);
      setCursor(n);
      const nm = new Date(next.getFullYear(), next.getMonth(), 1);
      const lastShown = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + grid.length, 0);
      if (next < viewMonth || next > lastShown) setViewMonth(nm);
      requestAnimationFrame(() => popRef.current?.querySelector<HTMLElement>(`[data-iso="${n}"]`)?.focus());
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (iso >= minIso) pick(iso);
    }
  }

  const fieldClass = `field flex items-center text-left ${compact ? "min-h-[44px]" : ""}`;
  const l = labels ?? { start: "Check-in", end: "Check-out" };

  return (
    <div className="relative">
      <div className={`grid ${single ? "grid-cols-1" : "grid-cols-2"} gap-2`}>
        <div>
          <label htmlFor={`${id}-start`} className="label">{l.start}</label>
          <button
            id={`${id}-start`}
            ref={startBtn}
            type="button"
            className={fieldClass}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-invalid={error ? true : undefined}
            onClick={() => {
              setFocus("start");
              setOpen(true);
            }}
          >
            <span className={checkin ? "" : "text-ink-3"}>{checkin ? formatShort(checkin) : "Add date"}</span>
          </button>
        </div>
        {!single && (
          <div>
            <label htmlFor={`${id}-end`} className="label">{l.end}</label>
            <button
              id={`${id}-end`}
              ref={endBtn}
              type="button"
              className={fieldClass}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-invalid={error ? true : undefined}
              onClick={() => {
                setFocus(checkin ? "end" : "start");
                setOpen(true);
              }}
            >
              <span className={checkout ? "" : "text-ink-3"}>{checkout ? formatShort(checkout) : "Add date"}</span>
            </button>
          </div>
        )}
      </div>
      {error ? (
        <p className="error-text" role="alert">{error}</p>
      ) : nights > 0 && !single ? (
        <p className="hint">{nights} {nights === 1 ? "night" : "nights"}</p>
      ) : null}

      {open && (
        <div
          ref={popRef}
          role="dialog"
          aria-label="Choose dates"
          className="absolute left-0 z-40 mt-2 w-[min(92vw,640px)] rounded-2xl border border-line bg-white p-4 shadow-lg fade-in"
        >
          <div className="mb-3 flex items-center justify-between">
            <button type="button" className="btn btn-ghost btn-sm" aria-label="Previous month" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} disabled={viewMonth <= new Date(min.getFullYear(), min.getMonth(), 1)}>
              ‹
            </button>
            <p className="text-sm font-semibold text-ink-2">
              {single ? "Choose a date" : focus === "start" ? "Choose check-in" : `Choose check-out${minNights > 1 ? ` (minimum ${minNights} nights)` : ""}`}
            </p>
            <button type="button" className="btn btn-ghost btn-sm" aria-label="Next month" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}>
              ›
            </button>
          </div>
          <div className={`grid gap-6 ${grid.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {grid.map((m) => (
              <div key={m.label}>
                <p className="mb-2 text-center font-semibold">{m.label}</p>
                <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-semibold text-ink-3" aria-hidden="true">
                  {dow.map((d) => <span key={d}>{d}</span>)}
                </div>
                <div role="grid" className="mt-1 grid grid-cols-7 gap-y-1">
                  {m.cells.map((iso, i) => {
                    if (!iso) return <span key={`e${i}`} />;
                    const disabled = iso < minIso;
                    const isStart = iso === checkin;
                    const isEnd = iso === checkout || (!checkout && iso === rangeEnd);
                    const inRange = checkin && rangeEnd && iso > checkin && iso < rangeEnd;
                    return (
                      <button
                        key={iso}
                        type="button"
                        role="gridcell"
                        data-iso={iso}
                        tabIndex={iso === cursor ? 0 : -1}
                        disabled={disabled}
                        aria-disabled={disabled}
                        aria-selected={isStart || isEnd}
                        aria-label={formatShort(iso)}
                        onMouseEnter={() => setHover(iso)}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setCursor(iso)}
                        onKeyDown={(e) => onGridKey(e, iso)}
                        onClick={() => pick(iso)}
                        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors ${
                          disabled
                            ? "text-ink-3/50 line-through"
                            : isStart || isEnd
                              ? "bg-ocean font-bold text-white"
                              : inRange
                                ? "bg-ocean-100 text-ocean"
                                : "hover:bg-sand-100"
                        }`}
                      >
                        {Number(iso.slice(-2))}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
            <button type="button" className="link" onClick={() => { onChange("", ""); setFocus("start"); }}>
              Clear dates
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
