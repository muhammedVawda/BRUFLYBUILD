import { describe, it, expect } from "vitest";
import { parseStaySearch, serializeStaySearch, activeFilterCount } from "@/lib/search-params";
import { searchStays } from "@/lib/search";
import { suggestDestinations, resolveDestination } from "@/lib/data/destinations";

const now = new Date(2026, 8, 22);
const params = (q: string) => new URLSearchParams(q);

describe("search params", () => {
  it("honours legacy guests=2 as adults", () => {
    const s = parseStaySearch(params("guests=2"));
    expect(s.adults).toBe(2);
    expect(s.children).toBe(0);
  });
  it("prefers explicit adults over guests", () => {
    expect(parseStaySearch(params("guests=2&adults=3")).adults).toBe(3);
  });
  it("clamps and sanitises values", () => {
    const s = parseStaySearch(params("adults=99&children=-2&type=hotel,castle&amenities=wifi,jacuzzi&sort=bogus"));
    expect(s.adults).toBe(16);
    expect(s.children).toBe(0);
    expect(s.types).toEqual(["hotel"]);
    expect(s.amenities).toEqual(["wifi"]);
    expect(s.sort).toBe("recommended");
  });
  it("round-trips through serialisation", () => {
    const s = parseStaySearch(params("destination=cape-town&checkin=2026-10-10&checkout=2026-10-12&adults=2&children=1&ages=5&type=hotel&amenities=pool"));
    const again = parseStaySearch(serializeStaySearch(s));
    expect(again).toEqual(s);
    expect(activeFilterCount(s)).toBe(2);
  });
});

describe("destinations", () => {
  it("suggests from aliases", () => {
    expect(suggestDestinations("jozi")[0].slug).toBe("johannesburg");
    expect(suggestDestinations("plett")[0].slug).toBe("garden-route");
    expect(resolveDestination("Cape Town")?.slug).toBe("cape-town");
    expect(resolveDestination("atlantis")).toBeNull();
  });
});

describe("searchStays", () => {
  it("filters by destination and capacity", () => {
    const r = searchStays(parseStaySearch(params("destination=cape-town&adults=8")), now);
    expect(r.destination?.slug).toBe("cape-town");
    expect(r.results.every((x) => x.property.maxGuests >= 8 || x.property.roomBased)).toBe(true);
  });
  it("returns quotes when dates are valid and reports invalid dates", () => {
    const ok = searchStays(parseStaySearch(params("destination=durban&checkin=2026-10-12&checkout=2026-10-14&adults=2")), now);
    expect(ok.nights).toBe(2);
    expect(ok.results.some((x) => x.quote)).toBe(true);
    const bad = searchStays(parseStaySearch(params("destination=durban&checkin=2026-09-01&checkout=2026-09-03&adults=2")), now);
    expect(bad.dateError).toMatch(/past/);
    expect(bad.nights).toBe(0);
  });
  it("explains relaxations when nothing matches", () => {
    const r = searchStays(parseStaySearch(params("destination=kruger&type=apartment&amenities=spa,gym")), now);
    expect(r.total).toBe(0);
    expect(r.relaxations.map((x) => x.param)).toEqual(expect.arrayContaining(["amenities", "type"]));
  });
  it("sorts by price ascending", () => {
    const r = searchStays(parseStaySearch(params("sort=price_asc")), now);
    const prices = r.results.map((x) => x.property.nightlyRateZar);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
