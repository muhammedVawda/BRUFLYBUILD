import { describe, it, expect } from "vitest";
import { calculateBruPass, membershipCostForPeriod } from "@/lib/brupass-calc";
import { brupass } from "@/config/business";

describe("BruPass calculator", () => {
  const monthly = brupass.plans[0];
  it("computes net saving and break-even honestly", () => {
    const r = calculateBruPass({ planId: "monthly", bookings: 2, assumedSavingPerBookingZar: 150, period: "monthly" });
    expect(r.valid).toBe(true);
    expect(r.membershipCostZar).toBe(monthly.priceZar);
    expect(r.estimatedSavingZar).toBe(300);
    expect(r.netZar).toBe(300 - monthly.priceZar);
    expect(r.breakEvenBookings).toBe(Math.ceil(monthly.priceZar / 150));
  });
  it("shows a negative result when bookings are too few", () => {
    const r = calculateBruPass({ planId: "monthly", bookings: 0, assumedSavingPerBookingZar: 150, period: "monthly" });
    expect(r.netZar).toBe(-monthly.priceZar);
  });
  it("uses consistent periods", () => {
    expect(membershipCostForPeriod("monthly", "annual")).toBe(monthly.priceZar * 12);
    expect(membershipCostForPeriod("annual", "annual")).toBe(brupass.plans[1].priceZar);
    expect(membershipCostForPeriod("annual", "monthly")).toBe(Math.round(brupass.plans[1].priceZar / 12));
  });
  it("validates inputs", () => {
    expect(calculateBruPass({ planId: "monthly", bookings: -1, assumedSavingPerBookingZar: 150, period: "monthly" }).valid).toBe(false);
    expect(calculateBruPass({ planId: "monthly", bookings: 1.5, assumedSavingPerBookingZar: 150, period: "monthly" }).valid).toBe(false);
    expect(calculateBruPass({ planId: "monthly", bookings: 2, assumedSavingPerBookingZar: -5, period: "monthly" }).valid).toBe(false);
  });
});
