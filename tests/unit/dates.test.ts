import { describe, it, expect } from "vitest";
import { nightsBetween, validateDateRange, parseISODate, formatRange } from "@/lib/dates";

const now = new Date(2026, 8, 22); // 22 Sep 2026

describe("dates", () => {
  it("counts nights correctly", () => {
    expect(nightsBetween("2026-10-02", "2026-10-05")).toBe(3);
    expect(nightsBetween("2026-10-05", "2026-10-02")).toBe(0);
    expect(nightsBetween("2026-12-30", "2027-01-02")).toBe(3);
  });
  it("rejects invalid dates", () => {
    expect(parseISODate("2026-02-30")).toBeNull();
    expect(parseISODate("nonsense")).toBeNull();
    expect(validateDateRange("2026-02-30", "2026-03-02", now)).toEqual({ ok: false, error: "checkin_invalid" });
  });
  it("rejects past check-in and inverted ranges", () => {
    expect(validateDateRange("2026-09-21", "2026-09-25", now)).toEqual({ ok: false, error: "checkin_past" });
    expect(validateDateRange("2026-10-05", "2026-10-05", now)).toEqual({ ok: false, error: "checkout_not_after_checkin" });
    expect(validateDateRange("2026-10-05", "2026-10-01", now)).toEqual({ ok: false, error: "checkout_not_after_checkin" });
  });
  it("accepts today as check-in and caps at 30 nights", () => {
    expect(validateDateRange("2026-09-22", "2026-09-23", now)).toEqual({ ok: true, nights: 1 });
    expect(validateDateRange("2026-10-01", "2026-11-05", now)).toEqual({ ok: false, error: "too_long" });
  });
  it("formats ranges", () => {
    expect(formatRange("2026-10-02", "2026-10-05")).toBe("2–5 Oct 2026");
    expect(formatRange("2026-10-30", "2026-11-02")).toBe("30 Oct – 2 Nov 2026");
  });
});
