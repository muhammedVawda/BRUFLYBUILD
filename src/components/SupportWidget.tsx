"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { company } from "@/config/business";
import { track } from "@/lib/analytics";

/**
 * Simple support launcher: three starting points and direct human contact.
 * Deliberately not a chatbot: it never states availability, prices or
 * booking outcomes. Hidden on checkout pages so it cannot overlap the
 * sticky booking bar.
 */
export function SupportWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      btnRef.current?.focus();
    };
  }, [open]);

  if (pathname.includes("/book") || pathname.startsWith("/help")) return null;
  const wa = `https://wa.me/${company.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hi BruFly, I need help with ")}`;

  return (
    <div className="fixed right-3 z-[55] sm:right-4" style={{ bottom: "max(5.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))" }}>
      {open && (
        <div ref={panelRef} role="dialog" aria-label="Get help" className="mb-3 w-[min(92vw,340px)] rounded-2xl border border-line bg-white p-4 shadow-lg fade-in">
          <p className="display text-lg font-semibold text-ocean">Howzit, how can we help?</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/help#find" className="block rounded-xl border border-line px-3 py-2.5 text-sm font-semibold hover:bg-sand-100" onClick={() => track("support_contact", { topic: "find" })}>
                Help finding a flight or stay
              </Link>
            </li>
            <li>
              <Link href="/account" className="block rounded-xl border border-line px-3 py-2.5 text-sm font-semibold hover:bg-sand-100" onClick={() => track("support_contact", { topic: "booking" })}>
                Help with an existing booking
              </Link>
            </li>
            <li>
              <Link href="/help#brupass" className="block rounded-xl border border-line px-3 py-2.5 text-sm font-semibold hover:bg-sand-100" onClick={() => track("support_contact", { topic: "brupass" })}>
                BruPass questions
              </Link>
            </li>
          </ul>
          <div className="mt-4 border-t border-line pt-3 text-sm text-ink-2">
            <p>Talk to a person ({company.supportHours}):</p>
            <a href={wa} rel="noopener noreferrer" className="btn btn-primary btn-sm mt-2 w-full" onClick={() => track("support_contact", { channel: "whatsapp" })}>
              WhatsApp {company.whatsappDisplay}
            </a>
            <a href={`mailto:${company.email}`} className="mt-2 block text-center link" onClick={() => track("support_contact", { channel: "email" })}>
              {company.email}
            </a>
          </div>
        </div>
      )}
      <button
        ref={btnRef}
        type="button"
        className="btn btn-secondary shadow-lg"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
        </svg>
        {open ? "Close" : "Help"}
      </button>
    </div>
  );
}
