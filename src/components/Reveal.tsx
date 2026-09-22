"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle fade-up on first scroll into view. Content is fully visible by
 * default (server render, no JS, print, reduced motion); the hidden state is
 * only applied by JS to elements that are below the fold at mount time.
 */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add("is-visible");
      return; // already on screen: never hide it
    }
    el.classList.add("reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    const fallback = setTimeout(() => el.classList.add("is-visible"), 4000);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const El = Tag as any;
  return (
    <El ref={ref} data-reveal className={`is-visible ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </El>
  );
}
