/** Customer-facing booking states. Pure module: safe to import in client components. */
export type BookingStatus =
  | "request_received"
  | "awaiting_confirmation"
  | "confirmed"
  | "declined"
  | "cancelled";


export const statusCopy: Record<BookingStatus, { label: string; tone: "pending" | "good" | "bad" | "neutral"; explain: string }> = {
  request_received: {
    label: "Request received",
    tone: "pending",
    explain: "We have your request. Nothing has been charged. A BruFly team member will check availability and price with the supplier.",
  },
  awaiting_confirmation: {
    label: "Awaiting confirmation",
    tone: "pending",
    explain: "The supplier is confirming your booking. We will email you as soon as it is confirmed or if anything changes.",
  },
  confirmed: {
    label: "Confirmed",
    tone: "good",
    explain: "Your booking is confirmed. Your confirmation email contains everything you need for check-in.",
  },
  declined: {
    label: "Unavailable",
    tone: "bad",
    explain: "The supplier could not confirm this booking. Nothing has been charged. We will suggest alternatives by email.",
  },
  cancelled: {
    label: "Cancelled",
    tone: "neutral",
    explain: "This booking has been cancelled. Any refund due is processed according to the cancellation terms you accepted.",
  },
};
