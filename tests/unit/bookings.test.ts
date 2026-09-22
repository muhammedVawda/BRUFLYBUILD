import { describe, it, expect } from "vitest";
import { createBooking, getBooking, transition } from "@/lib/bookings-store";

describe("bookings store", () => {
  it("rejects duplicate submissions via idempotency key", () => {
    const input = {
      kind: "stay" as const,
      idempotencyKey: "abc-123",
      summary: { slug: "x" },
      totalZar: 1000,
      contact: { name: "A", email: "a@example.com", phone: "0" },
      initialNote: "test",
    };
    const first = createBooking(input);
    const second = createBooking(input);
    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(second.record.ref).toBe(first.record.ref);
    expect(first.record.status).toBe("request_received");
    expect(getBooking(first.record.ref)?.ref).toBe(first.record.ref);
  });
  it("records status transitions", () => {
    const { record } = createBooking({
      kind: "flight",
      idempotencyKey: "k2",
      summary: {},
      totalZar: 1,
      contact: { name: "B", email: "b@example.com", phone: "0" },
      initialNote: "n",
    });
    transition(record.ref, "confirmed", "Ticketed");
    expect(getBooking(record.ref)?.status).toBe("confirmed");
    expect(getBooking(record.ref)?.timeline.length).toBe(2);
  });
});
