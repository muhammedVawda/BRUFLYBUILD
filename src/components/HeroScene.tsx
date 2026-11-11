"use client";

import { useEffect, useRef } from "react";
import { sceneLayers } from "@/components/Illustration";

/**
 * The signature BruFly visual: a layered Cape Town poster scene at dusk.
 * Layers move at different speeds as the page scrolls (restrained parallax,
 * transform-only, disabled under prefers-reduced-motion), and a small
 * aircraft draws its route across the sky once on load.
 */
export function HeroScene() {
  const ref = useRef<SVGSVGElement>(null);
  const L = sceneLayers("mountain", "brufly-hero", "dusk");

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers = Array.from(svg.querySelectorAll<SVGGElement>("[data-depth]"));
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 600);
        for (const l of layers) {
          const d = Number(l.dataset.depth);
          l.style.transform = `translate3d(0, ${y * d * 0.06}px, 0)`;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const route = "M-20,58 Q120,14 260,34 T440,18";
  return (
    <svg ref={ref} viewBox="0 0 400 240" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <g data-depth="0.2" style={{ willChange: "transform" }}>{L.sky}</g>
      <g data-depth="0.6" style={{ willChange: "transform" }}>{L.far}</g>
      <g data-depth="1" style={{ willChange: "transform" }}>{L.mid}</g>
      <g data-depth="1.4" style={{ willChange: "transform" }}>{L.near}</g>
      <g data-depth="1.9" style={{ willChange: "transform" }}>{L.fore}</g>
      <g data-depth="0.3">
        {/* Faint dashed trail, revealed by a mask that draws along the route */}
        <mask id="hero-route-mask">
          <path d={route} fill="none" stroke="#fff" strokeWidth="6" pathLength={100} className="motion-only" style={{ strokeDasharray: "100", strokeDashoffset: 100, animation: "dash 3.2s var(--ease-out) 0.4s forwards" }} />
        </mask>
        <path d={route} fill="none" stroke="#fff" strokeWidth="0.9" strokeDasharray="2 3" opacity="0.5" mask="url(#hero-route-mask)" />
        <g className="motion-only" style={{ offsetPath: `path("${route}")`, offsetRotate: "auto", animation: "fly 3.2s var(--ease-out) 0.4s forwards" }}>
          <path d="M-6,0 L4,-2.6 L6,0 L4,2.6 Z" fill="#fff" />
          <path d="M-2,-0.6 L-2,-5 L0,-5 L1.4,-0.6 Z M-2,0.6 L-2,5 L0,5 L1.4,0.6 Z" fill="#fff" />
        </g>
      </g>
      {L.overlay}
    </svg>
  );
}
