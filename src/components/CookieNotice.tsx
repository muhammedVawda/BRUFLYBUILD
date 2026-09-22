"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/analytics";

export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(getConsent() === null);
  }, []);
  if (!show) return null;
  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-line bg-white p-4 shadow-lg sm:inset-x-auto sm:left-4 sm:bottom-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <p className="text-sm text-ink-2">
        We use essential cookies to run bookings, and optional analytics cookies to understand which pages help people
        book. <Link href="/privacy" className="link">Privacy policy</Link>.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setConsent("granted");
            setShow(false);
          }}
        >
          Accept analytics
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => {
            setConsent("denied");
            setShow(false);
          }}
        >
          Essential only
        </button>
      </div>
    </div>
  );
}
