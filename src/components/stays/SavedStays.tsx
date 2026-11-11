"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useFavourites } from "@/lib/favourites";
import { StayCard } from "@/components/stays/StayCard";
import type { StayResult } from "@/lib/search";

export function SavedStays() {
  const { list, ready } = useFavourites();
  const [results, setResults] = useState<StayResult[] | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (!list.length) return setResults([]);
    fetch(`/api/stays/search?adults=1`)
      .then((r) => r.json())
      .then((d: { results: StayResult[] }) => setResults(list.map((s) => d.results.find((r) => r.property.slug === s)).filter(Boolean) as StayResult[]))
      .catch(() => setResults([]));
  }, [list, ready]);
  if (!ready || results === null) return <div className="skeleton h-40 w-full" />;
  if (!results.length)
    return (
      <div className="card p-8 text-center">
        <p className="display text-xl text-ocean">Nothing saved yet</p>
        <p className="mt-2 text-ink-2">Tap the heart on any stay to keep it here.</p>
        <Link href="/stays" className="btn btn-primary mt-4">Browse stays</Link>
      </div>
    );
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((r) => (
        <li key={r.property.slug}><StayCard r={r} href={`/stays/${r.property.slug}`} nights={0} /></li>
      ))}
    </ul>
  );
}
