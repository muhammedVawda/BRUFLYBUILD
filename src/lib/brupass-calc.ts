import { brupass } from "@/config/business";

export type Period = "monthly" | "annual";

export interface CalcInput {
  planId: (typeof brupass.plans)[number]["id"];
  /** Expected eligible bookings in the chosen period. */
  bookings: number;
  /** Assumed saving per eligible booking, in rand (explicitly an assumption). */
  assumedSavingPerBookingZar: number;
  period: Period;
}

export interface CalcResult {
  period: Period;
  bookings: number;
  assumedSavingPerBookingZar: number;
  membershipCostZar: number;
  estimatedSavingZar: number;
  netZar: number;
  /** Bookings needed to recover the membership cost in this period. */
  breakEvenBookings: number;
  valid: boolean;
  errors: string[];
}

export function getPlan(planId: string) {
  return brupass.plans.find((p) => p.id === planId) ?? brupass.plans[0];
}

/** Membership cost for a plan over a period, using consistent periods. */
export function membershipCostForPeriod(planId: string, period: Period): number {
  const plan = getPlan(planId);
  if (plan.billing === "monthly") return period === "monthly" ? plan.priceZar : plan.priceZar * 12;
  // annual plan: an annual amount, or a twelfth for a monthly view
  return period === "annual" ? plan.priceZar : Math.round(plan.priceZar / 12);
}

export function calculateBruPass(input: CalcInput): CalcResult {
  const errors: string[] = [];
  const bookings = Number(input.bookings);
  const saving = Number(input.assumedSavingPerBookingZar);
  if (!Number.isFinite(bookings) || bookings < 0 || !Number.isInteger(bookings)) {
    errors.push("Bookings must be a whole number of 0 or more.");
  }
  if (bookings > 100) errors.push("Bookings must be 100 or fewer.");
  if (!Number.isFinite(saving) || saving < 0) errors.push("Assumed saving must be R0 or more.");
  if (saving > 5000) errors.push("Assumed saving must be R5 000 or less.");
  const membershipCostZar = membershipCostForPeriod(input.planId, input.period);
  if (errors.length) {
    return {
      period: input.period,
      bookings: 0,
      assumedSavingPerBookingZar: 0,
      membershipCostZar,
      estimatedSavingZar: 0,
      netZar: 0,
      breakEvenBookings: 0,
      valid: false,
      errors,
    };
  }
  const estimatedSavingZar = bookings * saving;
  const netZar = estimatedSavingZar - membershipCostZar;
  const breakEvenBookings = saving > 0 ? Math.ceil(membershipCostZar / saving) : Infinity;
  return {
    period: input.period,
    bookings,
    assumedSavingPerBookingZar: saving,
    membershipCostZar,
    estimatedSavingZar,
    netZar,
    breakEvenBookings,
    valid: true,
    errors: [],
  };
}
