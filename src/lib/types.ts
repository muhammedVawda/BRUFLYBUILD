export type PropertyType = "hotel" | "guesthouse" | "apartment" | "villa" | "lodge" | "cottage";
export type BookingMode = "instant" | "request" | "enquiry";
export type CancellationPolicy = "flexible" | "moderate" | "strict";
export type Scene = "coast" | "mountain" | "bush" | "city" | "winelands" | "garden";

export type Amenity =
  | "wifi"
  | "pool"
  | "parking"
  | "breakfast"
  | "kitchen"
  | "aircon"
  | "sea_view"
  | "braai"
  | "pet_friendly"
  | "backup_power"
  | "family"
  | "gym"
  | "spa"
  | "workspace";

export interface Destination {
  slug: string;
  name: string;
  province: string;
  /** Short editorial intro, written for the destination page. */
  intro: string;
  /** Longer body copy for the destination page. */
  body: string[];
  scene: Scene;
  lat: number;
  lng: number;
  /** IATA code of the nearest airport served by BruFly, if any. */
  airport?: string;
  /** Aliases used for destination suggestions. */
  aliases: string[];
}

export interface Property {
  slug: string;
  name: string;
  type: PropertyType;
  destination: string; // destination slug
  area: string; // neighbourhood / suburb shown publicly (street address is private)
  lat: number;
  lng: number;
  scene: Scene;
  /** Short one-line summary for cards. */
  summary: string;
  description: string[];
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  /** Whether rooms can be selected (hotels). */
  roomBased: boolean;
  /** Children under this age are free; ages required for pricing if set. */
  childPricing?: { freeUnderAge: number; childRateFactor: number };
  amenities: Amenity[];
  /** Nightly base rate in rand for the whole unit (or per room when roomBased). */
  nightlyRateZar: number;
  /** Optional per-night surcharge per guest above `includedGuests`. */
  includedGuests: number;
  extraGuestPerNightZar: number;
  /** Mandatory once-off fees. */
  cleaningFeeZar: number;
  /** Weekend uplift factor for Fri/Sat nights. */
  weekendFactor: number;
  minNights: number;
  bookingMode: BookingMode;
  cancellation: CancellationPolicy;
  checkIn: string;
  checkOut: string;
  houseRules: string[];
  /** Dates (ISO) that are blocked. Real inventory would come from the PMS/channel manager. */
  blockedDates: string[];
  /** Verified reviews. Empty array means "no reviews yet" — never invent. */
  reviews: { author: string; rating: number; date: string; text: string }[];
  /** Photo file names under /images/stays/<slug>/. Empty means illustration placeholder. */
  photos: string[];
  hostName: string;
}

export interface Airport {
  code: string;
  city: string;
  name: string;
  destination?: string; // destination slug
  lat: number;
  lng: number;
}

export interface FlightRoute {
  from: string;
  to: string;
  /** Sample fares in rand. Real fares come from the airline/GDS integration. */
  sampleFareFromZar: number;
  durationMin: number;
  airlines: string[];
}
