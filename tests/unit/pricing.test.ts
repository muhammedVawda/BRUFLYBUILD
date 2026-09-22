import { describe, it, expect } from "vitest";
import { quoteStay } from "@/lib/pricing";
import { getProperty } from "@/lib/data/properties";

const now = new Date(2026, 8, 22);

describe("quoteStay", () => {
  it("prices a whole-unit stay with weekend uplift and cleaning fee", () => {
    const p = getProperty("seapoint-promenade-apartment")!; // 1850/night, weekend 1.15, cleaning 450, min 2
    // Thu 8 Oct → Sun 11 Oct 2026: nights Thu(8), Fri(9), Sat(10) → 1 weekday + 2 weekend
    const r = quoteStay(p, "2026-10-08", "2026-10-11", { adults: 2, children: 0 }, now);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const weekend = Math.round(1850 * 1.15); // 2128
    expect(r.quote.nights).toBe(3);
    expect(r.quote.subtotalZar).toBe(1850 + 2 * weekend);
    expect(r.quote.feesZar).toBe(450);
    expect(r.quote.totalZar).toBe(1850 + 2 * weekend + 450);
    expect(r.quote.avgPerNightZar).toBe(Math.round(r.quote.totalZar / 3));
  });
  it("charges extra guests above the included count", () => {
    const p = getProperty("seapoint-promenade-apartment")!; // includes 2, +250/guest/night
    const r2 = quoteStay(p, "2026-10-12", "2026-10-14", { adults: 2, children: 0 }, now);
    const r4 = quoteStay(p, "2026-10-12", "2026-10-14", { adults: 3, children: 1 }, now);
    expect(r2.ok && r4.ok).toBe(true);
    if (!r2.ok || !r4.ok) return;
    expect(r4.quote.totalZar - r2.quote.totalZar).toBe(2 * 250 * 2);
  });
  it("enforces capacity and minimum nights", () => {
    const p = getProperty("seapoint-promenade-apartment")!;
    expect(quoteStay(p, "2026-10-12", "2026-10-14", { adults: 5, children: 0 }, now)).toMatchObject({ ok: false, error: { code: "capacity" } });
    expect(quoteStay(p, "2026-10-12", "2026-10-13", { adults: 2, children: 0 }, now)).toMatchObject({ ok: false, error: { code: "min_nights" } });
  });
  it("prices room-based hotels per room and requires child ages where child pricing applies", () => {
    const p = getProperty("umhlanga-beachfront-hotel")!; // 2150/room, includes 2, child free under 6, factor 0.5, +450
    const missing = quoteStay(p, "2026-10-12", "2026-10-14", { adults: 2, children: 1 }, now);
    expect(missing).toMatchObject({ ok: false, error: { code: "child_ages" } });
    const freeChild = quoteStay(p, "2026-10-12", "2026-10-14", { adults: 2, children: 1, childAges: [4] }, now);
    const payingChild = quoteStay(p, "2026-10-12", "2026-10-14", { adults: 2, children: 1, childAges: [10] }, now);
    expect(freeChild.ok && payingChild.ok).toBe(true);
    if (!freeChild.ok || !payingChild.ok) return;
    expect(freeChild.quote.totalZar).toBe(2 * 2150);
    expect(payingChild.quote.totalZar).toBe(2 * 2150 + 2 * Math.round(450 * 0.5));
    const twoRooms = quoteStay(p, "2026-10-12", "2026-10-14", { adults: 4, children: 0, rooms: 2 }, now);
    expect(twoRooms.ok).toBe(true);
    if (twoRooms.ok) expect(twoRooms.quote.totalZar).toBe(2 * 2150 * 2);
  });
  it("flags blocked nights as unavailable", () => {
    const p = { ...getProperty("morningside-guesthouse")!, blockedDates: ["2026-10-13"] };
    expect(quoteStay(p, "2026-10-12", "2026-10-14", { adults: 2, children: 0 }, now)).toMatchObject({
      ok: false,
      error: { code: "unavailable", dates: ["2026-10-13"] },
    });
  });
  it("produces a stable signature for identical inputs", () => {
    const p = getProperty("rosebank-serviced-apartment")!;
    const a = quoteStay(p, "2026-10-12", "2026-10-14", { adults: 2, children: 0 }, now);
    const b = quoteStay(p, "2026-10-12", "2026-10-14", { adults: 2, children: 0 }, now);
    expect(a.ok && b.ok && a.quote.signature === b.quote.signature).toBe(true);
  });
});
