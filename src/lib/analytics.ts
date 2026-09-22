"use client";

/**
 * Minimal analytics layer. Events go to `window.dataLayer` (GTM / GA4) only
 * after the visitor accepts analytics cookies. Never pass personal traveller
 * information (names, emails, phone numbers) in event properties.
 */
export type AnalyticsEvent =
  | "search_submitted"
  | "results_viewed"
  | "property_viewed"
  | "booking_started"
  | "request_submitted"
  | "booking_confirmed"
  | "brupass_signup"
  | "support_contact"
  | "host_enquiry";

type Props = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const CONSENT_KEY = "brufly-consent";
const queue: { event: AnalyticsEvent; props: Props }[] = [];

export function getConsent(): "granted" | "denied" | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: "granted" | "denied") {
  try {
    localStorage.setItem(CONSENT_KEY, v);
  } catch {
    /* storage unavailable */
  }
  if (v === "granted") flush();
  else queue.length = 0;
}

function flush() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  while (queue.length) {
    const e = queue.shift()!;
    window.dataLayer.push({ event: e.event, ...e.props });
  }
}

export function track(event: AnalyticsEvent, props: Props = {}) {
  if (typeof window === "undefined") return;
  const consent = getConsent();
  if (consent === "denied") return;
  queue.push({ event, props });
  if (consent === "granted") flush();
}
