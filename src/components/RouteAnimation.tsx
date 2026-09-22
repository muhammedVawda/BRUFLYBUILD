/**
 * The signature BruFly visual: a stylised map of South Africa drawn as a
 * dot field, with a flight route that draws itself from Johannesburg to
 * Cape Town and a small aircraft that follows the path. Pure SVG + CSS,
 * respects prefers-reduced-motion (falls back to a static route).
 */
import { saOutline, project } from "@/lib/geo";

const cities: { name: string; lat: number; lng: number }[] = [
  { name: "Johannesburg", lat: -26.2041, lng: 28.0473 },
  { name: "Cape Town", lat: -33.9249, lng: 18.4241 },
  { name: "Durban", lat: -29.8587, lng: 31.0218 },
  { name: "George", lat: -33.9648, lng: 22.4587 },
  { name: "Nelspruit", lat: -25.4753, lng: 30.9694 },
];

export function RouteAnimation({ className = "" }: { className?: string }) {
  const W = 520;
  const H = 440;
  const pts = saOutline.map(([lat, lng]) => project(lat, lng, W, H));
  const jnb = project(cities[0].lat, cities[0].lng, W, H);
  const cpt = project(cities[1].lat, cities[1].lng, W, H);
  const dur = project(cities[2].lat, cities[2].lng, W, H);
  // Curved route JNB → CPT
  const ctrl = { x: (jnb.x + cpt.x) / 2 - 40, y: (jnb.y + cpt.y) / 2 - 90 };
  const path = `M${jnb.x},${jnb.y} Q${ctrl.x},${ctrl.y} ${cpt.x},${cpt.y}`;
  const ctrl2 = { x: (jnb.x + dur.x) / 2 + 40, y: (jnb.y + dur.y) / 2 - 20 };
  const path2 = `M${jnb.x},${jnb.y} Q${ctrl2.x},${ctrl2.y} ${dur.x},${dur.y}`;

  // Dot field inside the outline (point-in-polygon on a grid)
  const dots: { x: number; y: number }[] = [];
  const inside = (x: number, y: number) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i].x, yi = pts[i].y, xj = pts[j].x, yj = pts[j].y;
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  for (let y = 10; y < H; y += 12) for (let x = 10; x < W; x += 12) if (inside(x, y)) dots.push({ x, y });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label="Map of South Africa showing a flight route from Johannesburg to Cape Town">
      <g fill="var(--brand-ocean)" opacity="0.14">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="1.9" />
        ))}
      </g>
      <path d={path2} fill="none" stroke="var(--brand-sky)" strokeWidth="2" strokeDasharray="4 6" opacity="0.45" />
      <path
        d={path}
        fill="none"
        stroke="var(--brand-sun)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="600"
        strokeDashoffset="600"
        className="motion-only"
        style={{ animation: "dash 2.4s var(--ease-out) 0.3s forwards" }}
      />
      {[
        { p: jnb, n: "Johannesburg", dx: 10, dy: -8 },
        { p: cpt, n: "Cape Town", dx: -10, dy: 22, anchor: "end" },
        { p: dur, n: "Durban", dx: 10, dy: 5 },
      ].map(({ p, n, dx, dy, anchor }) => (
        <g key={n}>
          <circle cx={p.x} cy={p.y} r="9" fill="var(--brand-sun)" opacity="0.18" />
          <circle cx={p.x} cy={p.y} r="4" fill="var(--brand-ocean)" />
          <text x={p.x + dx} y={p.y + dy} fontSize="13" fontWeight="700" fill="var(--brand-ocean)" textAnchor={anchor as "end" | undefined} fontFamily="var(--font-body)">
            {n}
          </text>
        </g>
      ))}
      <g
        className="motion-only"
        style={{ offsetPath: `path("${path}")`, offsetRotate: "auto", animation: "fly 2.4s var(--ease-out) 0.3s forwards" }}
      >
        <path d="M-9,0 L6,-4 L9,0 L6,4 Z" fill="var(--brand-ocean)" />
        <path d="M-3,-1 L-3,-8 L0,-8 L2,-1 Z M-3,1 L-3,8 L0,8 L2,1 Z" fill="var(--brand-ocean)" />
      </g>
    </svg>
  );
}
