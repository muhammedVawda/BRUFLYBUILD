"use client";

import Link from "next/link";
import { useState } from "react";
import { saOutline, project } from "@/lib/geo";
import { formatZar } from "@/lib/money";
import type { StayResult } from "@/lib/search";

/**
 * Self-hosted SVG map. Map tiles (OpenStreetMap/Google) are not loaded so
 * the page stays light; swap this for Leaflet/MapLibre when a tile provider
 * is configured. Pins are positioned by real coordinates. The map never
 * captures wheel/touch scrolling.
 */
export function StaysMap({ results, hrefFor, focusDestination }: { results: StayResult[]; hrefFor: (slug: string) => string; focusDestination?: { lat: number; lng: number } | null }) {
  const W = 600;
  const H = 500;
  const [active, setActive] = useState<string | null>(null);
  const outline = saOutline.map(([lat, lng]) => project(lat, lng, W, H));
  let viewBox = `0 0 ${W} ${H}`;
  let size = W;
  let focus: { x: number; y: number } | null = null;
  if (focusDestination && results.length) {
    const c = project(focusDestination.lat, focusDestination.lng, W, H);
    focus = c;
    const pts = results.map((r) => project(r.property.lat, r.property.lng, W, H));
    const minX = Math.min(c.x, ...pts.map((p) => p.x));
    const maxX = Math.max(c.x, ...pts.map((p) => p.x));
    const minY = Math.min(c.y, ...pts.map((p) => p.y));
    const maxY = Math.max(c.y, ...pts.map((p) => p.y));
    // Never zoom closer than ~60 km across: locations stay approximate.
    size = Math.max(20, (maxX - minX) * 1.8 + 8, (maxY - minY) * 1.8 + 8);
    viewBox = `${(minX + maxX) / 2 - size / 2} ${(minY + maxY) / 2 - (size * (H / W)) / 2} ${size} ${size * (H / W)}`;
  }
  const activeResult = results.find((r) => r.property.slug === active) ?? null;
  // Scale marks with the zoom so labels stay ~13px on screen.
  const fontSize = size * 0.022;
  const r = size * 0.009;
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-line bg-sky-100">
      <svg viewBox={viewBox} className="h-full w-full" role="img" aria-label={`Map showing ${results.length} stays`}>
        <path d={outline.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ") + " Z"} fill="#f3ede3" stroke="#d6cbb8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {focus && (
          <text x={focus.x} y={focus.y - r * 3} textAnchor="middle" fontSize={fontSize * 1.1} fontWeight="700" fill="var(--ink-3)" fontFamily="var(--font-body)" style={{ paintOrder: "stroke", stroke: "#f3ede3", strokeWidth: fontSize * 0.3 }}>
            {results[0]?.property.destinationName}
          </text>
        )}
        {results.map((res, i) => {
          const p = project(res.property.lat, res.property.lng, W, H);
          const isActive = active === res.property.slug;
          const label = res.quote ? formatZar(res.quote.totalZar) : `from ${formatZar(res.property.nightlyRateZar)}`;
          const above = i % 2 === 0;
          return (
            <g key={res.property.slug} transform={`translate(${p.x},${p.y})`} style={{ cursor: "pointer" }} onClick={() => setActive(isActive ? null : res.property.slug)}>
              <circle r={r} fill={isActive ? "var(--brand-sun)" : "var(--brand-ocean)"} stroke="#fff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <text y={above ? -r * 1.6 : r * 1.6 + fontSize} textAnchor="middle" fontSize={fontSize} fontWeight="700" fill="var(--brand-ocean)" fontFamily="var(--font-body)" style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: fontSize * 0.28 }}>
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      {activeResult && (
        <div className="absolute inset-x-3 bottom-3 rounded-xl border border-line bg-white p-3 shadow-lg fade-in" role="status">
          <p className="font-semibold text-ocean">{activeResult.property.name}</p>
          <p className="text-sm text-ink-2">{activeResult.property.area}</p>
          <Link href={hrefFor(activeResult.property.slug)} className="btn btn-primary btn-sm mt-2">
            View stay
          </Link>
          <button type="button" className="absolute right-2 top-2 rounded-full p-1 text-ink-3 hover:bg-sand-100" aria-label="Close" onClick={() => setActive(null)}>
            ✕
          </button>
        </div>
      )}
      <p className="absolute left-3 top-3 rounded-md bg-white/85 px-2 py-1 text-xs text-ink-3 backdrop-blur">Approximate locations. Exact addresses are shared after booking.</p>
    </div>
  );
}
