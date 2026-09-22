import { properties } from "@/lib/data/properties";
import { resolveDestination, getDestination } from "@/lib/data/destinations";
import { quoteStay, type Quote } from "@/lib/pricing";
import { validateDateRange } from "@/lib/dates";
import type { Property } from "@/lib/types";
import type { StaySearch } from "@/lib/search-params";

export interface StayResult {
  property: Pick<
    Property,
    | "slug"
    | "name"
    | "type"
    | "area"
    | "lat"
    | "lng"
    | "scene"
    | "summary"
    | "maxGuests"
    | "bedrooms"
    | "beds"
    | "bathrooms"
    | "roomBased"
    | "amenities"
    | "nightlyRateZar"
    | "cancellation"
    | "bookingMode"
    | "minNights"
    | "photos"
  > & { destinationName: string };
  rating: { average: number; count: number } | null;
  /** Present when dates were supplied and the stay is available. */
  quote: Quote | null;
  /** Reason the property is not bookable for these dates, if any. */
  unavailableReason: string | null;
}

export interface StaySearchResponse {
  results: StayResult[];
  total: number;
  /** Number of properties matching destination before refinement filters. */
  totalBeforeFilters: number;
  destination: { slug: string; name: string } | null;
  nights: number;
  dateError: string | null;
  /** Suggestions when there are no results: which constraints could be relaxed. */
  relaxations: { label: string; param: string }[];
}

export function ratingFor(p: Property): { average: number; count: number } | null {
  if (!p.reviews.length) return null;
  const sum = p.reviews.reduce((a, r) => a + r.rating, 0);
  return { average: Math.round((sum / p.reviews.length) * 10) / 10, count: p.reviews.length };
}

export function searchStays(s: StaySearch, now?: Date): StaySearchResponse {
  const dest = s.destination ? resolveDestination(s.destination) : null;
  let pool = dest ? properties.filter((p) => p.destination === dest.slug) : properties.slice();
  const totalBeforeFilters = pool.length;

  let nights = 0;
  let dateError: string | null = null;
  const hasDates = Boolean(s.checkin || s.checkout);
  if (hasDates) {
    const v = validateDateRange(s.checkin, s.checkout, now);
    if (v.ok) nights = v.nights;
    else {
      const messages: Record<string, string> = {
        checkin_invalid: "Choose a check-in date to see prices for your dates.",
        checkout_invalid: "Choose a check-out date to see prices for your dates.",
        checkin_past: "Your check-in date is in the past. Choose a new date.",
        checkout_not_after_checkin: "Check-out must be after check-in.",
        too_long: "Stays are limited to 30 nights.",
      };
      dateError = messages[v.error];
    }
  }

  const guests = s.adults + s.children;
  // Capacity: for room-based properties the guest count can spread over rooms.
  pool = pool.filter((p) => guests <= p.maxGuests * (p.roomBased ? s.rooms : 1));

  if (s.types.length) pool = pool.filter((p) => s.types.includes(p.type));
  if (s.bedrooms != null) pool = pool.filter((p) => p.bedrooms >= s.bedrooms!);
  if (s.amenities.length) pool = pool.filter((p) => s.amenities.every((a) => p.amenities.includes(a)));
  if (s.cancellation === "flexible") pool = pool.filter((p) => p.cancellation === "flexible");
  if (s.cancellation === "moderate") pool = pool.filter((p) => p.cancellation !== "strict");
  if (s.minPrice != null) pool = pool.filter((p) => p.nightlyRateZar >= s.minPrice!);
  if (s.maxPrice != null) pool = pool.filter((p) => p.nightlyRateZar <= s.maxPrice!);

  const results: StayResult[] = pool.map((p) => {
    let quote: Quote | null = null;
    let unavailableReason: string | null = null;
    if (nights > 0) {
      const q = quoteStay(
        p,
        s.checkin,
        s.checkout,
        { adults: s.adults, children: s.children, childAges: s.childAges, rooms: s.rooms },
        now,
      );
      if (q.ok) quote = q.quote;
      else if (q.error.code === "child_ages") {
        // Price without child ages: show base quote for adults only, flag that ages are needed.
        const base = quoteStay(p, s.checkin, s.checkout, { adults: s.adults, children: 0, rooms: s.rooms }, now);
        quote = base.ok ? base.quote : null;
        unavailableReason = null;
      } else unavailableReason = q.error.message;
    }
    return {
      property: {
        slug: p.slug,
        name: p.name,
        type: p.type,
        area: p.area,
        lat: p.lat,
        lng: p.lng,
        scene: p.scene,
        summary: p.summary,
        maxGuests: p.maxGuests,
        bedrooms: p.bedrooms,
        beds: p.beds,
        bathrooms: p.bathrooms,
        roomBased: p.roomBased,
        amenities: p.amenities,
        nightlyRateZar: p.nightlyRateZar,
        cancellation: p.cancellation,
        bookingMode: p.bookingMode,
        minNights: p.minNights,
        photos: p.photos,
        destinationName: getDestination(p.destination)?.name ?? "",
      },
      rating: ratingFor(p),
      quote,
      unavailableReason,
    };
  });

  const price = (r: StayResult) => (r.quote ? r.quote.totalZar : r.property.nightlyRateZar);
  switch (s.sort) {
    case "price_asc":
      results.sort((a, b) => price(a) - price(b));
      break;
    case "price_desc":
      results.sort((a, b) => price(b) - price(a));
      break;
    case "rating":
      results.sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0) || (b.rating?.count ?? 0) - (a.rating?.count ?? 0));
      break;
    default:
      // Recommended: available first, then reviewed, then by price.
      results.sort((a, b) => {
        const av = Number(Boolean(b.quote) || !hasDates) - Number(Boolean(a.quote) || !hasDates);
        if (av !== 0) return av;
        const rv = (b.rating?.count ?? 0) - (a.rating?.count ?? 0);
        if (rv !== 0) return rv;
        return price(a) - price(b);
      });
  }

  const relaxations: { label: string; param: string }[] = [];
  if (results.length === 0) {
    if (s.amenities.length) relaxations.push({ label: "Remove amenity filters", param: "amenities" });
    if (s.types.length) relaxations.push({ label: "Include all property types", param: "type" });
    if (s.maxPrice != null || s.minPrice != null) relaxations.push({ label: "Widen the price range", param: "price" });
    if (s.bedrooms != null) relaxations.push({ label: "Fewer bedrooms", param: "bedrooms" });
    if (s.cancellation) relaxations.push({ label: "Any cancellation policy", param: "cancellation" });
    if (guests > 4) relaxations.push({ label: "Fewer guests or more rooms", param: "guests" });
    if (dest == null && s.destination) relaxations.push({ label: "Try a different destination", param: "destination" });
  }

  return {
    results,
    total: results.length,
    totalBeforeFilters,
    destination: dest ? { slug: dest.slug, name: dest.name } : null,
    nights,
    dateError,
    relaxations,
  };
}
