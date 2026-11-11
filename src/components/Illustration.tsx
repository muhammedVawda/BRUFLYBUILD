import type { Scene } from "@/lib/types";

/**
 * BruFly "travel poster" illustration system.
 *
 * Used for destinations and, until real photographs are supplied, for
 * listings. It is deliberately an art style rather than a stand-in for a
 * photo: layered ridges with atmospheric perspective, a time-of-day sky,
 * soft clouds, film grain and a gentle vignette, plus a landmark that
 * identifies each scene (Table Mountain, the Umhlanga coast, the Joburg
 * skyline, acacia bushveld, winelands gables, the Knysna lagoon).
 *
 * `layers()` returns the same scene split by depth for the parallax hero.
 */
type Time = "dawn" | "day" | "dusk";

const skyStops: Record<Time, [string, string, string]> = {
  dawn: ["#d9c3dc", "#f4c8b4", "#fbe6cf"],
  day: ["#7fb6e3", "#bddcf3", "#eaf3fa"],
  dusk: ["#5a4b86", "#e8865e", "#f8c79a"],
};
const sunColour: Record<Time, string> = { dawn: "#ffc08a", day: "#fff1c0", dusk: "#ff9a4d" };

interface Palette { far: string; mid: string; near: string; ground: string; water?: string }
const palettes: Record<Scene, Palette> = {
  coast: { far: "#8ea8c4", mid: "#5f7f9f", near: "#3f5f7f", ground: "#e9d7b1", water: "#2b7fc0" },
  mountain: { far: "#9db0c8", mid: "#5d7595", near: "#324b6c", ground: "#5f8a5f" },
  city: { far: "#aeb9cc", mid: "#5d6f8d", near: "#2b3c57", ground: "#6a8b5e" },
  bush: { far: "#d2a77a", mid: "#a9744a", near: "#6b4428", ground: "#d8b06e" },
  winelands: { far: "#a3b3c2", mid: "#6f8aa0", near: "#3f6b4e", ground: "#7fa65b" },
  garden: { far: "#8fb0bd", mid: "#5a8a8a", near: "#2f6b57", ground: "#4f8a4a", water: "#5fb0c9" },
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h) >>> 0;
}
const rnd = (h: number, k: number, span: number) => ((h >> (k % 28)) % span);

/** Smooth ridge from x=0..W at baseline y with amplitude a. */
function ridge(h: number, k: number, y: number, a: number, W = 400, H = 240, segs = 7): string {
  const pts: [number, number][] = [];
  for (let i = 0; i <= segs; i++) {
    const x = (W / segs) * i;
    const yy = y - rnd(h, k + i * 3, 1000) / 1000 * a;
    pts.push([x, yy]);
  }
  let d = `M-10 ${H + 10} L-10 ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` Q${x0 + (x1 - x0) * 0.25} ${y0} ${cx} ${(y0 + y1) / 2} T${x1} ${y1}`;
  }
  d += ` L${W + 10} ${H + 10} Z`;
  return d;
}

interface Ctx { h: number; id: string; time: Time; p: Palette }

export function sceneLayers(scene: Scene, seed = "", fixedTime?: Time): { ctx: Ctx; sky: React.ReactNode; far: React.ReactNode; mid: React.ReactNode; near: React.ReactNode; fore: React.ReactNode; overlay: React.ReactNode } {
  const h = hash(seed || scene);
  const time: Time = fixedTime ?? (["dawn", "day", "dusk"] as Time[])[h % 3];
  const id = `il${h % 1000000}`;
  const p = palettes[scene];
  const ctx: Ctx = { h, id, time, p };
  const [s0, s1, s2] = skyStops[time];
  const sunX = 60 + rnd(h, 1, 280);
  const sunY = 40 + rnd(h, 4, 50);

  const sky = (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s0} />
          <stop offset="0.55" stopColor={s1} />
          <stop offset="1" stopColor={s2} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor={sunColour[time]} stopOpacity="0.9" />
          <stop offset="0.35" stopColor={sunColour[time]} stopOpacity="0.35" />
          <stop offset="1" stopColor={sunColour[time]} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-vig`} cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#0b2a4a" stopOpacity="0.28" />
        </radialGradient>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="linear" slope="0.09" /></feComponentTransfer>
        </filter>
        <filter id={`${id}-soft`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
        {p.water && (
          <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.water} stopOpacity="0.85" />
            <stop offset="1" stopColor="#1d5f93" />
          </linearGradient>
        )}
      </defs>
      <rect width="400" height="240" fill={`url(#${id}-sky)`} />
      {time !== "day" &&
        Array.from({ length: 18 }).map((_, i) => <circle key={i} cx={rnd(h, i + 7, 400)} cy={rnd(h, i + 11, 90)} r={0.6 + rnd(h, i, 3) * 0.3} fill="#fff" opacity={0.35 + rnd(h, i + 2, 5) * 0.1} />)}
      <circle cx={sunX} cy={sunY} r="70" fill={`url(#${id}-glow)`} />
      <circle cx={sunX} cy={sunY} r="16" fill={sunColour[time]} />
      {[0, 1, 2, 3].map((i) => {
        const cx = (rnd(h, 5 + i, 360) + i * 70) % 420;
        const cy = 30 + rnd(h, 9 + i, 60);
        const w = 26 + rnd(h, 13 + i, 30);
        return (
          <g key={i} filter={`url(#${id}-soft)`} opacity={time === "day" ? 0.9 : 0.7}>
            <ellipse cx={cx} cy={cy} rx={w} ry={7} fill="#fff" />
            <ellipse cx={cx - w * 0.35} cy={cy + 2} rx={w * 0.5} ry={6} fill="#fff" />
            <ellipse cx={cx + w * 0.3} cy={cy + 3} rx={w * 0.55} ry={5} fill="#fff" />
          </g>
        );
      })}
      {/* birds */}
      {[0, 1, 2].map((i) => {
        const bx = 40 + rnd(h, 17 + i, 320);
        const by = 50 + rnd(h, 21 + i, 60);
        return <path key={i} d={`M${bx} ${by} q3 -3 6 0 q3 -3 6 0`} fill="none" stroke="#0b2a4a" strokeWidth="0.9" opacity="0.55" />;
      })}
    </g>
  );

  const far = <path d={ridge(h, 20, 150, 46)} fill={p.far} opacity="0.75" />;
  const mid = <path d={ridge(h, 40, 170, 38)} fill={p.mid} opacity="0.9" />;

  let near: React.ReactNode = <path d={ridge(h, 60, 190, 30)} fill={p.near} />;
  let fore: React.ReactNode = null;

  switch (scene) {
    case "coast": {
      const headland = `M-10 250 L-10 182 L40 166 L80 176 L130 170 L170 184 L200 192 L-10 250Z`;
      near = (
        <g>
          <path d={headland} fill={p.near} />
          <rect x="-10" y="188" width="420" height="60" fill={`url(#${id}-water)`} />
          <ellipse cx={sunX} cy="206" rx="22" ry="34" fill={sunColour[time]} opacity="0.18" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M-10 ${196 + i * 9} q25 -3 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0`} fill="none" stroke="#fff" strokeWidth="1.1" opacity={0.45 - i * 0.1} />
          ))}
        </g>
      );
      fore = (
        <g>
          <path d="M-10 226 Q80 214 170 222 T410 218 V250 H-10Z" fill={p.ground} />
          <path d="M-10 228 Q80 217 170 225 T410 221 V226 Q300 224 170 228 T-10 232Z" fill="#fff" opacity="0.5" />
          <g transform={`translate(${300 + rnd(h, 3, 60)},224)`}>
            <path d="M0 0 q-2 -26 6 -44" stroke="#4a3220" strokeWidth="3" fill="none" strokeLinecap="round" />
            {[-160, -130, -95, -60, -30, 0].map((a) => <path key={a} d="M0 0 q16 -6 30 2 q-14 4 -30 -2z" fill="#245a37" transform={`translate(6,-44) rotate(${a})`} />)}
          </g>
          <g transform={`translate(${50 + rnd(h, 8, 80)},230)`}>
            <path d="M0 0 v-16" stroke="#4a3220" strokeWidth="1.5" />
            <path d="M-14 -16 q14 -10 28 0 z" fill="var(--brand-sun)" />
            <path d="M-14 -16 q14 -10 28 0" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.6" />
          </g>
        </g>
      );
      break;
    }
    case "mountain": {
      const l = 120 + rnd(h, 2, 30);
      const r = l + 120;
      near = (
        <g>
          <path d={`M-10 250 L-10 200 L40 176 L90 184 L${l} 126 L${r} 126 L${r + 50} 170 L${r + 90} 158 L410 190 L410 250Z`} fill={p.near} />
          <path d={`M${l} 126 L${r} 126 L${r + 50} 170 L${l - 40} 182Z`} fill="#243a55" opacity="0.55" />
          <path d={`M${l - 10} 132 q60 -18 ${r - l + 20} 0 q-20 10 -50 8 q-30 -4 -70 2 q-14 2 -20 -10z`} fill="#fff" opacity="0.85" filter={`url(#${id}-soft)`} />
        </g>
      );
      fore = (
        <g>
          <path d="M-10 212 Q80 200 170 208 T410 204 V250 H-10Z" fill={p.ground} />
          {Array.from({ length: 26 }).map((_, i) => (
            <rect key={i} x={6 + i * 15 + rnd(h, i, 6)} y={210 + rnd(h, i + 3, 10)} width={5 + rnd(h, i + 1, 4)} height={10 + rnd(h, i + 2, 14)} fill={time === "day" ? "#efe7d8" : "#ffe3b0"} opacity="0.95" />
          ))}
        </g>
      );
      break;
    }
    case "city": {
      near = (
        <g>
          {Array.from({ length: 16 }).map((_, i) => {
            const x = i * 26 + rnd(h, i, 8);
            const w = 14 + (i % 3) * 7;
            const y = 120 + rnd(h, i + 5, 70);
            return (
              <g key={i}>
                <rect x={x} y={y} width={w} height={250 - y} fill={i % 2 ? "#2b3c57" : "#3a5076"} />
                {Array.from({ length: Math.floor((240 - y) / 9) }).map((_, row) =>
                  Array.from({ length: Math.floor(w / 6) }).map((_, col) => (
                    <rect key={`${row}-${col}`} x={x + 2 + col * 6} y={y + 4 + row * 9} width="2.5" height="4" fill={time !== "day" && rnd(h, row + col + i, 3) === 0 ? "#ffd98a" : "#dbe6f2"} opacity={time !== "day" ? 0.95 : 0.45} />
                  )),
                )}
              </g>
            );
          })}
        </g>
      );
      fore = (
        <g>
          <path d="M-10 222 H410 V250 H-10Z" fill={p.ground} />
          {[30, 110, 200, 290, 370].map((x, i) => (
            <g key={x}>
              <rect x={x + 9} y="206" width="3" height="20" fill="#4a3220" />
              <ellipse cx={x + 10} cy="204" rx={20 + (i % 2) * 6} ry="11" fill="#9b8ccf" />
              <ellipse cx={x + 2} cy="208" rx={12} ry="7" fill="#8a7bc0" />
            </g>
          ))}
        </g>
      );
      break;
    }
    case "bush": {
      near = <path d={ridge(h, 60, 196, 18)} fill={p.near} opacity="0.85" />;
      fore = (
        <g>
          <path d="M-10 214 Q100 204 200 212 T410 208 V250 H-10Z" fill={p.ground} />
          {[50 + rnd(h, 2, 40), 250 + rnd(h, 6, 60)].map((x, i) => (
            <g key={i}>
              <path d={`M${x} 226 q2 -20 -4 -36`} stroke="#4a3220" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d={`M${x - 6} 190 q${20 + i * 6} -14 ${44 + i * 8} 0 q-22 6 -44 0z`} fill="#55683a" />
            </g>
          ))}
          <g fill="#3b2816" transform={`translate(${140 + rnd(h, 9, 80)},226)`}>
            <rect x="-8" y="-20" width="16" height="20" rx="2" />
            <path d="M6 -20 l6 -28 l4 0 l-4 28z" />
            <path d="M12 -48 l8 -4 l-2 6z" />
            <rect x="-7" y="-4" width="3" height="8" /><rect x="4" y="-4" width="3" height="8" />
          </g>
          <g fill="#3b2816" transform={`translate(${320 + rnd(h, 4, 50)},228)`}>
            <ellipse cx="0" cy="-12" rx="16" ry="10" />
            <path d="M12 -16 q12 -4 12 12 q-4 4 -6 -8z" />
            <rect x="-12" y="-4" width="4" height="8" /><rect x="6" y="-4" width="4" height="8" />
          </g>
          {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M${i * 14 + rnd(h, i, 8)} 240 q1 -8 2 -12`} stroke="#b8924e" strokeWidth="1" fill="none" />)}
        </g>
      );
      break;
    }
    case "winelands": {
      fore = (
        <g>
          <path d="M-10 208 Q100 198 200 206 T410 202 V250 H-10Z" fill={p.ground} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d={`M${-60 + i * 70} 250 L${150 + i * 18} 206`} stroke="#3f6a3a" strokeWidth={5 - i * 0.4} opacity="0.85" />)}
          <g transform={`translate(${250 + rnd(h, 2, 60)},206)`}>
            <rect x="-34" y="-18" width="68" height="22" fill="#fff" />
            <path d="M-34 -18 L-18 -34 Q0 -46 18 -34 L34 -18Z" fill="#fff" />
            <path d="M-34 -18 L-18 -34 Q0 -46 18 -34 L34 -18" fill="none" stroke="#2f4a3a" strokeWidth="1.5" />
            <rect x="-22" y="-12" width="8" height="12" fill="#2f4a3a" /><rect x="14" y="-12" width="8" height="12" fill="#2f4a3a" /><rect x="-5" y="-8" width="10" height="14" fill="#5a4028" />
            <path d="M-40 4 H40" stroke="#2f4a3a" strokeWidth="1" />
          </g>
          {[40, 90].map((x, i) => (
            <g key={x}><rect x={x} y="190" width="4" height="20" fill="#4a3220" /><circle cx={x + 2} cy="186" r={14 + i * 3} fill="#466f3f" /><circle cx={x - 6} cy="192" r="9" fill="#3d6338" /></g>
          ))}
        </g>
      );
      break;
    }
    case "garden": {
      near = (
        <g>
          <path d={ridge(h, 60, 186, 26)} fill={p.near} />
          <rect x="-10" y="200" width="420" height="26" fill={p.water} opacity="0.9" />
          <path d="M-10 208 q40 -3 80 0 t80 0 t80 0 t80 0 t80 0" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
        </g>
      );
      fore = (
        <g>
          <path d="M-10 226 Q120 216 240 224 T410 220 V250 H-10Z" fill={p.ground} />
          {Array.from({ length: 22 }).map((_, i) => {
            const x = i * 19 + rnd(h, i, 8);
            const hh = 22 + rnd(h, i + 3, 18);
            return <path key={i} d={`M${x} 228 l9 -${hh} l9 ${hh}z`} fill={i % 2 ? "#2f6b43" : "#3f8552"} />;
          })}
          <g transform={`translate(${120 + rnd(h, 5, 160)},212)`}>
            <path d="M-16 0 q16 -6 32 0 q-16 6 -32 0z" fill="var(--brand-sun)" />
            <path d="M-12 -6 l24 4" stroke="#4a3220" strokeWidth="1.4" />
            <circle cx="0" cy="-5" r="2.5" fill="#4a3220" />
          </g>
        </g>
      );
      break;
    }
  }

  const overlay = (
    <g>
      <rect width="400" height="240" fill={`url(#${id}-vig)`} />
      <rect width="400" height="240" filter={`url(#${id}-grain)`} opacity="0.6" style={{ mixBlendMode: "multiply" }} />
    </g>
  );

  return { ctx, sky, far, mid, near, fore, overlay };
}

export function Illustration({ scene, seed = "", className = "", label, time }: { scene: Scene; seed?: string; className?: string; label?: string; time?: Time }) {
  const L = sceneLayers(scene, seed, time);
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={className} role={label ? "img" : "presentation"} aria-label={label} aria-hidden={label ? undefined : true}>
      {L.sky}
      {L.far}
      {L.mid}
      {L.near}
      {L.fore}
      {L.overlay}
    </svg>
  );
}
