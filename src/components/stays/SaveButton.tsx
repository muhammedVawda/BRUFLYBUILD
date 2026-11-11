"use client";

import { useFavourites } from "@/lib/favourites";

export function SaveButton({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const fav = useFavourites();
  const on = fav.has(slug);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from saved stays` : `Save ${name}`}
      title={on ? "Saved" : "Save"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        fav.toggle(slug);
      }}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={on ? "var(--brand-sun)" : "none"} stroke={on ? "var(--brand-sun)" : "var(--brand-ocean)"} strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 21s-7-4.6-9.3-8.6C.9 9.2 2.4 5 6.3 5c2 0 3.3 1 4.1 2.2L12 9l1.6-1.8C14.4 6 15.7 5 17.7 5c3.9 0 5.4 4.2 3.6 7.4C19 16.4 12 21 12 21z" />
      </svg>
    </button>
  );
}
