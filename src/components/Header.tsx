"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";

const nav = [
  { href: "/flights", label: "Flights" },
  { href: "/stays", label: "Stays" },
  { href: "/brupass", label: "BruPass" },
  { href: "/host", label: "List your place" },
  { href: "/help", label: "Help" },
];

/**
 * Fixed header with a constant height (no size change on scroll, so no
 * jitter). Only the shadow changes, and it changes with hysteresis so slow
 * scrolling around the threshold cannot flicker.
 */
export function Header() {
  const pathname = usePathname();
  const [elevated, setElevated] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setElevated((prev) => (prev ? y > 8 : y > 24));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Close the drawer on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Scroll lock + focus management + Escape.
  useEffect(() => {
    if (!open) return;
    document.body.dataset.scrollLock = "true";
    const first = drawerRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && drawerRef.current) {
        const items = drawerRef.current.querySelectorAll<HTMLElement>("a, button");
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      delete document.body.dataset.scrollLock;
      document.removeEventListener("keydown", onKey);
      toggleRef.current?.focus();
    };
  }, [open]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b transition-shadow duration-300"
      style={{
        height: "var(--header-h)",
        background: "rgba(250, 247, 242, 0.92)",
        backdropFilter: "saturate(160%) blur(10px)",
        WebkitBackdropFilter: "saturate(160%) blur(10px)",
        borderColor: elevated ? "var(--line)" : "transparent",
        boxShadow: elevated ? "var(--shadow-sm)" : "none",
      }}
    >
      <div className="container-x flex h-full items-center justify-between gap-4">
        <Link href="/" className="shrink-0 rounded-lg" aria-label="BruFly home">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-4 py-2 text-[0.95rem] font-semibold transition-colors ${
                      active ? "bg-ocean-100 text-ocean" : "text-ink-2 hover:bg-sand-100 hover:text-ink"
                    }`}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/account" className="btn btn-outline btn-sm hidden sm:inline-flex">
            My bookings
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="btn btn-outline btn-sm md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 5h14M3 10h14M3 15h14" />}
            </svg>
            Menu
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 top-[var(--header-h)] z-40 md:hidden" role="presentation" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-ocean/40 fade-in" />
          <div
            id="mobile-menu"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-x-0 top-0 rounded-b-3xl bg-white p-4 shadow-lg fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="flex flex-col">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block rounded-xl px-4 py-3.5 text-lg font-semibold text-ink hover:bg-sand-100">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-line pt-3">
                <Link href="/account" className="btn btn-secondary w-full">
                  My bookings
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
