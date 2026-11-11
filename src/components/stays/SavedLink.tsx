"use client";

import Link from "next/link";
import { useFavourites } from "@/lib/favourites";

export function SavedLink({ className = "" }: { className?: string }) {
  const { list, ready } = useFavourites();
  if (!ready || list.length === 0) return null;
  return (
    <Link href="/stays/saved" className={`btn btn-ghost btn-sm ${className}`} aria-label={`Saved stays, ${list.length}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--brand-sun)" aria-hidden="true"><path d="M12 21s-7-4.6-9.3-8.6C.9 9.2 2.4 5 6.3 5c2 0 3.3 1 4.1 2.2L12 9l1.6-1.8C14.4 6 15.7 5 17.7 5c3.9 0 5.4 4.2 3.6 7.4C19 16.4 12 21 12 21z" /></svg>
      Saved ({list.length})
    </Link>
  );
}
