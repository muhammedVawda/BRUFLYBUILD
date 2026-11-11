"use client";

import { useEffect, useState } from "react";

const KEY = "brufly-saved-stays";
const EVT = "brufly-saved-change";

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 100) : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  window.dispatchEvent(new Event(EVT));
}

/** Saved stays live in this browser only; there is no account to sync to yet. */
export function useFavourites() {
  const [list, setList] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setList(read());
    sync();
    setReady(true);
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return {
    list,
    ready,
    has: (slug: string) => list.includes(slug),
    toggle: (slug: string) => {
      const cur = read();
      write(cur.includes(slug) ? cur.filter((s) => s !== slug) : [slug, ...cur]);
    },
  };
}
