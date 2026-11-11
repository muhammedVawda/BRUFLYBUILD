const paths: Record<string, string> = {
  wifi: "M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01M2 9a14 14 0 0 1 20 0",
  pool: "M3 17c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0M3 21c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0M8 14V5a2 2 0 0 1 4 0M14 14V5a2 2 0 0 1 4 0",
  parking: "M6 20V4h7a5 5 0 0 1 0 10H6",
  breakfast: "M4 10h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 11h2a2 2 0 0 1 0 4h-2M7 3v3M10 3v3M13 3v3",
  kitchen: "M4 4h16v16H4zM4 12h16M9 7h.01M12 7h.01",
  aircon: "M3 7h18v6H3zM7 17l-1 3M12 17v3M17 17l1 3",
  sea_view: "M2 18c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M4 12a8 8 0 0 1 16 0M12 4v2",
  braai: "M4 10h16l-2 7H6zM12 17v4M8 21h8M8 7c0-2 1-2 1-4M12 7c0-2 1-2 1-4M16 7c0-2 1-2 1-4",
  pet_friendly: "M12 21c-3 0-5-2-5-4 0-1.5 2-3 5-3s5 1.5 5 3c0 2-2 4-5 4zM7 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM10 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  backup_power: "M13 2 4 14h7l-1 8 9-12h-7z",
  family: "M9 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 21v-5a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v5M15 21v-4a3 3 0 0 1 3-3h1a3 3 0 0 1 2 1",
  gym: "M4 10v4M20 10v4M7 8v8M17 8v8M7 12h10",
  spa: "M12 21c-5 0-8-3-8-7 3 0 6 1 8 4 2-3 5-4 8-4 0 4-3 7-8 7zM12 3c-2 2-3 4-3 6 0 2 1 3 3 4 2-1 3-2 3-4 0-2-1-4-3-6z",
  workspace: "M3 5h18v10H3zM2 18h20M12 15v3",
};

export function AmenityIcon({ id, size = 16 }: { id: string; size?: number }) {
  const d = paths[id];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d ? <path d={d} /> : <path d="m5 12 5 5L20 7" />}
    </svg>
  );
}
