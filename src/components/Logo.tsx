/**
 * PLACEHOLDER wordmark. Replace with the authentic BruFly logo asset
 * (keep its proportions) once supplied — drop the SVG/PNG in /public and
 * swap the markup below. Everything else in the design system is independent.
 */
export function Logo({ className = "", light = false }: { className?: string; light?: boolean }) {
  const ink = light ? "#ffffff" : "var(--brand-ocean)";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="BruFly">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <circle cx="17" cy="17" r="16" fill="var(--brand-sun)" />
        <path d="M8 20c5-1 9-4 12-8l4-4-2 6c-1 3-4 6-8 8l-6-2z" fill="#fff" />
        <path d="M13 22l-3 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="display text-[1.45rem] font-bold tracking-tight" style={{ color: ink }}>
        Bru<span style={{ color: light ? "#ffd2b3" : "var(--brand-sun)" }}>Fly</span>
      </span>
    </span>
  );
}
