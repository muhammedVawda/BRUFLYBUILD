"use client";

import { useMemo } from "react";

/** One key per checkout mount: retries and double-clicks reuse it, so the server can dedupe. */
export function useIdempotencyKey(scope: string): string {
  return useMemo(() => {
    const rnd = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    return `${scope}-${rnd}`.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80);
  }, [scope]);
}
