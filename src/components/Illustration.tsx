import type { Scene } from "@/lib/types";

/**
 * Honest illustration placeholders. These are clearly stylised scenes, not
 * photographs, and are used only until real property/destination
 * photography is supplied. The palette per scene keeps cards visually
 * consistent and recognisably South African (Atlantic blues, Highveld
 * ochres, winelands greens).
 */
const palettes: Record<Scene, { sky: [string, string]; far: string; near: string; ground: string; accent: string }> = {
  coast: { sky: ["#bfe3f6", "#f7e1c4"], far: "#5aa9d6", near: "#2f8fd6", ground: "#f1dfb9", accent: "#ffd27a" },
  mountain: { sky: ["#c9def0", "#f9e7d2"], far: "#7d94b3", near: "#3f5d84", ground: "#7fa36b", accent: "#ffcf87" },
  bush: { sky: ["#f8d9b0", "#f6b27a"], far: "#c88f5a", near: "#8a5a34", ground: "#d9b06d", accent: "#ff9c4a" },
  city: { sky: ["#d6e4f2", "#f6dfe0"], far: "#8fa2bf", near: "#4a5b7d", ground: "#6d8f5e", accent: "#ffd27a" },
  winelands: { sky: ["#dbe8f2", "#f7e6cf"], far: "#8ea3b5", near: "#5d7a5a", ground: "#8fae63", accent: "#f9c46b" },
  garden: { sky: ["#cfe6ee", "#f3e9d6"], far: "#6f9fb4", near: "#3e7d6b", ground: "#6c9d5a", accent: "#ffd27a" },
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

export function Illustration({ scene, seed = "", className = "", label }: { scene: Scene; seed?: string; className?: string; label?: string }) {
  const p = palettes[scene];
  const h = hash(seed || scene);
  const sunX = 40 + (h % 120);
  const sunY = 28 + ((h >> 3) % 20);
  const id = `g${h % 100000}`;
  const farPeaks = `M0 92 L30 ${70 + (h % 9)} L60 ${80 - ((h >> 2) % 8)} L95 ${62 + ((h >> 4) % 10)} L130 ${78} L165 ${66 + ((h >> 6) % 9)} L200 84 L200 120 L0 120 Z`;
  const nearPeaks = `M0 104 L40 ${88 + ((h >> 1) % 8)} L80 ${96} L120 ${84 + ((h >> 5) % 8)} L160 ${98} L200 ${90} L200 120 L0 120 Z`;
  return (
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill={`url(#${id}-sky)`} />
      <circle cx={sunX} cy={sunY} r="11" fill={p.accent} opacity="0.95" />
      {scene === "coast" ? (
        <>
          <path d={farPeaks} fill={p.far} opacity="0.55" />
          <rect x="0" y="86" width="200" height="34" fill={p.near} />
          <path d="M0 92 Q25 88 50 92 T100 92 T150 92 T200 92 V120 H0 Z" fill="#fff" opacity="0.18" />
          <path d="M0 108 Q30 100 70 106 T140 104 T200 108 V120 H0 Z" fill={p.ground} />
        </>
      ) : scene === "city" ? (
        <>
          <path d={farPeaks} fill={p.far} opacity="0.45" />
          {[10, 34, 52, 78, 98, 120, 146, 168].map((x, i) => (
            <rect key={x} x={x} y={62 + ((h >> i) % 26)} width={14 + (i % 3) * 4} height="60" fill={i % 2 ? p.near : p.far} rx="1" />
          ))}
          <path d="M0 106 Q50 98 100 104 T200 102 V120 H0 Z" fill={p.ground} />
        </>
      ) : (
        <>
          <path d={farPeaks} fill={p.far} opacity="0.7" />
          <path d={nearPeaks} fill={p.near} />
          <path d="M0 110 Q50 100 100 108 T200 106 V120 H0 Z" fill={p.ground} />
          {scene === "bush" && (
            <g fill={p.near}>
              <rect x="140" y="88" width="3" height="18" />
              <ellipse cx="141" cy="86" rx="14" ry="5" />
            </g>
          )}
          {scene === "winelands" &&
            [20, 45, 70, 95, 120, 145, 170].map((x) => <path key={x} d={`M${x} 118 L${x + 4} 108 L${x + 8} 118`} fill="#476b3f" />)}
        </>
      )}
    </svg>
  );
}
