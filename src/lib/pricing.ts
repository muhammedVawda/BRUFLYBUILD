import type { Property } from "@/lib/types";
import { stayBooking } from "@/config/business";
import { addDays, parseISODate, toISODate, validateDateRange } from "@/lib/dates";

export interface GuestCounts {
  adults: number;
  children: number;
  childAges?: number[];
  rooms?: number;
}

export interface QuoteLine {
  label: string;
  amountZar: number;
  /** Extra explanation shown under the line. */
  note?: string;
}

export interface Quote {
  propertySlug: string;
  checkin: string;
  checkout: string;
  nights: number;
  guests: GuestCounts;
  lines: QuoteLine[];
  subtotalZar: number;
  feesZar: number;
  totalZar: number;
  /** Pricing basis shown to the customer. */
  basis: "per_night_unit" | "per_night_room";
  /** Average per-night cost including fees, for comparison only. */
  avgPerNightZar: number;
  /** Signature used to detect a price change between quote and checkout. */
  signature: string;
}

export type QuoteError =
  | { code: "dates"; message: string }
  | { code: "min_nights"; message: string }
  | { code: "capacity"; message: string }
  | { code: "unavailable"; message: string; dates: string[] }
  | { code: "child_ages"; message: string };

function isWeekendNight(iso: string): boolean {
  const d = parseISODate(iso);
  if (!d) return false;
  const day = d.getDay();
  return day === 5 || day === 6;
}

/** Lists the nights (ISO dates) in a stay: check-in inclusive, check-out exclusive. */
export function nightsIn(checkin: string, checkout: string): string[] {
  const a = parseISODate(checkin);
  const b = parseISODate(checkout);
  if (!a || !b) return [];
  const out: string[] = [];
  let cur = a;
  while (cur.getTime() < b.getTime()) {
    out.push(toISODate(cur));
    cur = addDays(cur, 1);
  }
  return out;
}

export function unavailableNights(p: Property, checkin: string, checkout: string): string[] {
  const blocked = new Set(p.blockedDates);
  return nightsIn(checkin, checkout).filter((n) => blocked.has(n));
}

export function totalGuests(g: GuestCounts): number {
  return g.adults + g.children;
}

/**
 * Builds a full, itemised quote. Deterministic: the same inputs always produce
 * the same signature, which the checkout uses to detect changes.
 */
export function quoteStay(
  p: Property,
  checkin: string,
  checkout: string,
  guests: GuestCounts,
  now?: Date,
): { ok: true; quote: Quote } | { ok: false; error: QuoteError } {
  const range = validateDateRange(checkin, checkout, now);
  if (!range.ok) {
    const messages: Record<string, string> = {
      checkin_invalid: "Choose a check-in date.",
      checkout_invalid: "Choose a check-out date.",
      checkin_past: "Check-in can't be in the past.",
      checkout_not_after_checkin: "Check-out must be after check-in.",
      too_long: "Stays are limited to 30 nights.",
    };
    return { ok: false, error: { code: "dates", message: messages[range.error] } };
  }
  const nights = range.nights;
  if (nights < p.minNights) {
    return {
      ok: false,
      error: { code: "min_nights", message: `This stay has a minimum of ${p.minNights} nights.` },
    };
  }
  const adults = Math.max(1, Math.floor(guests.adults || 0));
  const children = Math.max(0, Math.floor(guests.children || 0));
  const rooms = p.roomBased ? Math.max(1, Math.floor(guests.rooms || 1)) : 1;
  const capacity = p.maxGuests * rooms;
  if (adults + children > capacity) {
    return {
      ok: false,
      error: {
        code: "capacity",
        message: p.roomBased
          ? `Each room sleeps ${p.maxGuests}. Add a room or reduce guests.`
          : `This stay sleeps a maximum of ${p.maxGuests} guests.`,
      },
    };
  }
  if (p.childPricing && children > 0) {
    const ages = guests.childAges ?? [];
    if (ages.length !== children || ages.some((a) => !Number.isInteger(a) || a < 0 || a > 17)) {
      return {
        ok: false,
        error: { code: "child_ages", message: "Enter the age of each child so we can price the stay correctly." },
      };
    }
  }
  const blocked = unavailableNights(p, checkin, checkout);
  if (blocked.length) {
    return {
      ok: false,
      error: { code: "unavailable", message: "Some of these nights are already booked.", dates: blocked },
    };
  }

  const lines: QuoteLine[] = [];
  const nightList = nightsIn(checkin, checkout);
  const weekendNights = nightList.filter(isWeekendNight).length;
  const weekNights = nights - weekendNights;
  const base = p.nightlyRateZar * rooms;
  const weekendRate = Math.round(p.nightlyRateZar * p.weekendFactor) * rooms;
  const accommodation = weekNights * base + weekendNights * weekendRate;
  const unitWord = p.roomBased ? (rooms > 1 ? `${rooms} rooms` : "1 room") : "whole place";
  lines.push({
    label: `${nights} ${nights === 1 ? "night" : "nights"} · ${unitWord}`,
    amountZar: accommodation,
    note:
      weekendNights > 0 && p.weekendFactor !== 1
        ? `${weekNights} × R${base.toLocaleString("en-ZA").replace(/,/g, " ")} weekday, ${weekendNights} × R${weekendRate
            .toLocaleString("en-ZA")
            .replace(/,/g, " ")} Fri/Sat`
        : undefined,
  });

  // Extra guests above what is included in the rate.
  let extra = 0;
  const included = p.includedGuests * rooms;
  let payingGuests = adults;
  if (p.childPricing) {
    const ages = guests.childAges ?? [];
    const payingChildren = ages.filter((a) => a >= p.childPricing!.freeUnderAge).length;
    // children counted at the child factor
    const extraAdults = Math.max(0, adults - included);
    const remainingIncluded = Math.max(0, included - adults);
    const chargeableChildren = Math.max(0, payingChildren - remainingIncluded);
    extra =
      extraAdults * p.extraGuestPerNightZar * nights +
      Math.round(chargeableChildren * p.extraGuestPerNightZar * p.childPricing.childRateFactor) * nights;
    payingGuests = adults + payingChildren;
  } else {
    payingGuests = adults + children;
    const extraGuests = Math.max(0, payingGuests - included);
    extra = extraGuests * p.extraGuestPerNightZar * nights;
  }
  if (extra > 0) {
    lines.push({
      label: "Additional guests",
      amountZar: extra,
      note: `Rate includes ${included} guests; R${p.extraGuestPerNightZar} per extra guest per night`,
    });
  }

  const subtotal = accommodation + extra;
  let fees = 0;
  if (p.cleaningFeeZar > 0) {
    lines.push({ label: "Cleaning fee", amountZar: p.cleaningFeeZar, note: "Once-off, set by the host" });
    fees += p.cleaningFeeZar;
  }
  if (stayBooking.serviceFeeRate > 0) {
    const fee = Math.round(subtotal * stayBooking.serviceFeeRate);
    lines.push({ label: "BruFly service fee", amountZar: fee });
    fees += fee;
  }
  const total = subtotal + fees;
  const signature = [p.slug, checkin, checkout, adults, children, (guests.childAges ?? []).join("."), rooms, total].join("|");
  return {
    ok: true,
    quote: {
      propertySlug: p.slug,
      checkin,
      checkout,
      nights,
      guests: { adults, children, childAges: guests.childAges, rooms: p.roomBased ? rooms : undefined },
      lines,
      subtotalZar: subtotal,
      feesZar: fees,
      totalZar: total,
      basis: p.roomBased ? "per_night_room" : "per_night_unit",
      avgPerNightZar: Math.round(total / nights),
      signature,
    },
  };
}

export const cancellationCopy: Record<Property["cancellation"], { title: string; detail: string }> = {
  flexible: {
    title: "Free cancellation until 24 hours before check-in",
    detail: "Cancel up to 24 hours before check-in for a full refund. Later cancellations are charged the first night.",
  },
  moderate: {
    title: "Free cancellation until 7 days before check-in",
    detail: "Cancel up to 7 days before check-in for a full refund. Cancel within 7 days and 50% of the accommodation cost is charged.",
  },
  strict: {
    title: "Free cancellation until 30 days before check-in",
    detail: "Cancel up to 30 days before check-in for a full refund. Cancel within 30 days and the full accommodation cost is charged.",
  },
};
