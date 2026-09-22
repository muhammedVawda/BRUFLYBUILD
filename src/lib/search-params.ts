import type { Amenity, CancellationPolicy, PropertyType } from "@/lib/types";

export const PROPERTY_TYPES: { id: PropertyType; label: string }[] = [
  { id: "hotel", label: "Hotel" },
  { id: "guesthouse", label: "Guesthouse" },
  { id: "apartment", label: "Apartment" },
  { id: "villa", label: "Villa or house" },
  { id: "lodge", label: "Lodge" },
  { id: "cottage", label: "Cottage" },
];

export const AMENITIES: { id: Amenity; label: string }[] = [
  { id: "wifi", label: "Wi-Fi" },
  { id: "pool", label: "Pool" },
  { id: "parking", label: "Parking" },
  { id: "breakfast", label: "Breakfast included" },
  { id: "kitchen", label: "Kitchen" },
  { id: "aircon", label: "Air-conditioning" },
  { id: "sea_view", label: "Sea or lake view" },
  { id: "braai", label: "Braai" },
  { id: "pet_friendly", label: "Pet friendly" },
  { id: "backup_power", label: "Backup power" },
  { id: "family", label: "Family friendly" },
  { id: "gym", label: "Gym" },
  { id: "spa", label: "Spa" },
  { id: "workspace", label: "Work desk" },
];

export const CANCELLATION_OPTIONS: { id: CancellationPolicy; label: string }[] = [
  { id: "flexible", label: "Free cancellation (24 h)" },
  { id: "moderate", label: "Free cancellation (7 days)" },
];

export type SortKey = "recommended" | "price_asc" | "price_desc" | "rating";

export interface StaySearch {
  destination: string; // free text or slug; "" for anywhere
  checkin: string; // ISO or ""
  checkout: string;
  adults: number;
  children: number;
  childAges: number[];
  rooms: number;
  types: PropertyType[];
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  amenities: Amenity[];
  cancellation: CancellationPolicy | null;
  sort: SortKey;
  view: "list" | "map";
}

type ParamsLike = { get(name: string): string | null; getAll?(name: string): string[] };

function num(v: string | null, fallback: number, min: number, max: number): number {
  if (v == null || v === "") return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function list<T extends string>(v: string | null, allowed: readonly T[]): T[] {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is T => (allowed as readonly string[]).includes(s));
}

/**
 * Parses URL search params into a normalised search. `guests=N` (used in
 * shared links) is honoured as the number of adults when `adults` is absent.
 */
export function parseStaySearch(params: ParamsLike): StaySearch {
  const legacyGuests = params.get("guests");
  const adults = params.get("adults") != null ? num(params.get("adults"), 2, 1, 16) : num(legacyGuests, 2, 1, 16);
  const children = num(params.get("children"), 0, 0, 10);
  const childAges = (params.get("ages") ?? "")
    .split(",")
    .filter((s) => s !== "")
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 17)
    .slice(0, children);
  const iso = (s: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "");
  const sortRaw = params.get("sort");
  const sort: SortKey = (["recommended", "price_asc", "price_desc", "rating"] as const).includes(sortRaw as SortKey)
    ? (sortRaw as SortKey)
    : "recommended";
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");
  const bedrooms = params.get("bedrooms");
  const cancellation = params.get("cancellation");
  return {
    destination: (params.get("destination") ?? "").slice(0, 60),
    checkin: iso(params.get("checkin")),
    checkout: iso(params.get("checkout")),
    adults,
    children,
    childAges,
    rooms: num(params.get("rooms"), 1, 1, 6),
    types: list(params.get("type"), PROPERTY_TYPES.map((t) => t.id)),
    minPrice: minPrice ? num(minPrice, 0, 0, 100000) : null,
    maxPrice: maxPrice ? num(maxPrice, 0, 0, 100000) : null,
    bedrooms: bedrooms ? num(bedrooms, 0, 1, 10) : null,
    amenities: list(params.get("amenities"), AMENITIES.map((a) => a.id)),
    cancellation: cancellation === "flexible" || cancellation === "moderate" ? cancellation : null,
    sort,
    view: params.get("view") === "map" ? "map" : "list",
  };
}

export const defaultStaySearch: StaySearch = parseStaySearch({ get: () => null });

/** Serialises a search to URL params, omitting defaults so URLs stay short and shareable. */
export function serializeStaySearch(s: StaySearch): URLSearchParams {
  const p = new URLSearchParams();
  if (s.destination) p.set("destination", s.destination);
  if (s.checkin) p.set("checkin", s.checkin);
  if (s.checkout) p.set("checkout", s.checkout);
  p.set("adults", String(s.adults));
  if (s.children > 0) {
    p.set("children", String(s.children));
    if (s.childAges.length) p.set("ages", s.childAges.join(","));
  }
  if (s.rooms > 1) p.set("rooms", String(s.rooms));
  if (s.types.length) p.set("type", s.types.join(","));
  if (s.minPrice != null) p.set("minPrice", String(s.minPrice));
  if (s.maxPrice != null) p.set("maxPrice", String(s.maxPrice));
  if (s.bedrooms != null) p.set("bedrooms", String(s.bedrooms));
  if (s.amenities.length) p.set("amenities", s.amenities.join(","));
  if (s.cancellation) p.set("cancellation", s.cancellation);
  if (s.sort !== "recommended") p.set("sort", s.sort);
  if (s.view === "map") p.set("view", "map");
  return p;
}

/** Count of active refinement filters (excluding the primary search fields). */
export function activeFilterCount(s: StaySearch): number {
  let n = 0;
  if (s.types.length) n += s.types.length;
  if (s.minPrice != null || s.maxPrice != null) n += 1;
  if (s.bedrooms != null) n += 1;
  if (s.amenities.length) n += s.amenities.length;
  if (s.cancellation) n += 1;
  return n;
}

/** Params carried from a search page to a property page and back. */
export function stayContextParams(s: StaySearch): URLSearchParams {
  const p = new URLSearchParams();
  if (s.checkin) p.set("checkin", s.checkin);
  if (s.checkout) p.set("checkout", s.checkout);
  p.set("adults", String(s.adults));
  if (s.children > 0) {
    p.set("children", String(s.children));
    if (s.childAges.length) p.set("ages", s.childAges.join(","));
  }
  if (s.rooms > 1) p.set("rooms", String(s.rooms));
  return p;
}
