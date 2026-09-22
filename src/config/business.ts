/**
 * BruFly business configuration.
 *
 * EVERY value in this file is a PLACEHOLDER that must be verified against the
 * real business terms, supplier contracts and payment-provider behaviour
 * before going live. The UI reads from here so that a single edit updates
 * every page (plans, checkout, account, FAQs, structured data).
 */

export const company = {
  name: "BruFly",
  legalName: "BruFly (Pty) Ltd", // VERIFY
  tagline: "Flights and stays across South Africa, checked by real people.",
  domain: "https://brufly.co.za",
  email: "hello@brufly.co.za", // VERIFY
  whatsapp: "+27000000000", // VERIFY — E.164, digits only after +
  whatsappDisplay: "+27 00 000 0000", // VERIFY
  supportHours: "Mon–Sat, 08:00–18:00 SAST", // VERIFY
  city: "Johannesburg", // VERIFY
  country: "ZA",
  social: {
    instagram: "https://instagram.com/brufly", // VERIFY
    facebook: "https://facebook.com/brufly", // VERIFY
  },
} as const;

/** Flight booking model: a BruFly team member checks each request before it is ticketed. */
export const flightBooking = {
  /** Time within which the team confirms or declines a request. VERIFY. */
  confirmationWindowHours: 24,
  /** No payment is captured at request time in this build. */
  paymentAtRequest: "none" as const,
  airlines: ["FlySafair", "LIFT"] as const,
  serviceFeeZar: 0, // VERIFY — shown as a separate line when > 0
} as const;

/** Stay booking model. */
export const stayBooking = {
  confirmationWindowHours: 24, // VERIFY — for request-to-book listings
  /** Service fee applied on the accommodation subtotal. VERIFY. */
  serviceFeeRate: 0.0,
  /** VAT is assumed to be included in supplier nightly rates. VERIFY. */
  vatIncludedInRates: true,
  /** Instant booking needs a payment provider. Until one is connected the server refuses instant captures. */
  paymentProviderConnected: false,
} as const;

/**
 * BruPass membership. All numbers are PLACEHOLDERS to be confirmed.
 * The benefit currently applies to FLIGHTS ONLY — the calculator and copy
 * must not imply accommodation discounts unless `appliesTo` includes "stays".
 */
export const brupass = {
  appliesTo: ["flights"] as const,
  currency: "ZAR",
  plans: [
    {
      id: "monthly",
      name: "BruPass Monthly",
      priceZar: 99,
      billing: "monthly" as const,
      commitmentMonths: 1,
      description: "Billed monthly. Cancel any time before your next billing date.",
    },
    {
      id: "annual",
      name: "BruPass Annual",
      priceZar: 899,
      billing: "annual" as const,
      commitmentMonths: 12,
      description: "One payment for 12 months. Not refundable once the first member fare is booked.",
    },
  ],
  /** Passengers on one booking who can receive the member fare. VERIFY. */
  passengersPerBooking: 4,
  /** Trial: none by default. If a trial is introduced, set days > 0 and describe cancellation rules. */
  trial: { days: 0, cancellationDuringTrial: "" },
  /** Assumed saving used ONLY as a default in the calculator, clearly labelled as an assumption. */
  defaultAssumedSavingPerBookingZar: 150,
  exclusions: [
    "Member fares apply to flights booked through BruFly only.",
    "BruPass does not currently discount BruFly Stays accommodation.",
    "Savings depend on the fare available on the day; a saving is not guaranteed on every route.",
  ],
} as const;

export const analytics = {
  /** Set to your GA4 / GTM id. Events are only sent after consent. */
  gtmId: "", // e.g. "GTM-XXXXXXX"
} as const;
