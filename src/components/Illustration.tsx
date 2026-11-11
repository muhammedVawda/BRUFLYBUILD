import type { Scene } from "@/lib/types";

/**
 * Honest illustration placeholders, used only until real photography is
 * supplied. Each scene has its own composition and the seed picks a time of
 * day and small variations, so a grid of cards reads as a set of distinct
 * places rather than one repeated graphic. Palette stays within the brand:
 * Atlantic blues, Highveld ochres, winelands greens.
 */
type Time = "dawn" | "day" | "dusk";
const skies: Record<Time, [string, string]> = {
  dawn: ["#f6d7c3", "#fbe9d4"],
  day: ["#bfe0f4", "#eef6fb"],
  dusk: ["#f3b98a", "#f9dcc0"],
};
const sun: Record<Time, string> = { dawn: "#ffb77a", day: "#ffd98a", dusk: "#ff9a4d" };

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h) >>> 0;
}

export function Illustration({ scene, seed = "", className = "", label }: { scene: Scene; seed?: string; className?: string; label?: string }) {
  const h = hash(seed || scene);
  const time: Time = (["dawn", "day", "dusk"] as Time[])[h % 3];
  const [skyTop, skyBottom] = skies[time];
  const sunX = 30 + (h % 140);
  const sunY = 22 + ((h >> 3) % 22);
  const id = `g${h % 1000000}`;
  const v = (bits: number, span: number) => ((h >> bits) % span);

  return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" className={className} role={label ? "img" : "presentation"} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4aa3dc" />
          <stop offset="1" stopColor="#1f6fb0" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor={sun[time]} stopOpacity="0.55" />
          <stop offset="1" stopColor={sun[time]} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="120" fill={`url(#${id}-sky)`} />
      <circle cx={sunX} cy={sunY} r="30" fill={`url(#${id}-glow)`} />
      <circle cx={sunX} cy={sunY} r="9" fill={sun[time]} />
      {/* soft clouds */}
      {[0, 1, 2].map((i) => {
        const cx = (v(4 + i, 180) + i * 40) % 200;
        const cy = 18 + v(7 + i, 24);
        return <ellipse key={i} cx={cx} cy={cy} rx={14 + v(9 + i, 10)} ry="4" fill="#fff" opacity="0.55" />;
      })}
      {scene === "coast" && <Coast h={h} id={id} />}
      {scene === "mountain" && <Mountain h={h} />}
      {scene === "city" && <City h={h} time={time} />}
      {scene === "bush" && <Bush h={h} />}
      {scene === "winelands" && <Winelands h={h} />}
      {scene === "garden" && <Garden h={h} />}
    </svg>
  );
}

function Coast({ h, id }: { h: number; id: string }) {
  const headland = `M0 ${78 + (h % 8)} L28 ${66 + ((h >> 2) % 8)} L60 ${74} L90 ${70 + ((h >> 5) % 6)} L120 82 L200 ${84 + ((h >> 7) % 6)} L200 90 L0 90 Z`;
  return (
    <>
      <path d={headland} fill="#7f98b4" opacity="0.7" />
      <rect x="0" y="86" width="200" height="34" fill={`url(#${id}-sea)`} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M-10 ${92 + i * 6} Q15 ${89 + i * 6} 40 ${92 + i * 6} T90 ${92 + i * 6} T140 ${92 + i * 6} T190 ${92 + i * 6} T240 ${92 + i * 6}`} fill="none" stroke="#fff" strokeWidth="1.2" opacity={0.35 - i * 0.08} />
      ))}
      <path d="M0 112 Q40 104 90 110 T200 108 V120 H0 Z" fill="#f1dfb9" />
      <path d="M0 113 Q40 106 90 112 T200 110 V114 Q150 112 90 114 T0 116 Z" fill="#fff" opacity="0.45" />
      {/* palm */}
      <g transform={`translate(${150 + (h % 30)},108)`} fill="#2f5d3a">
        <path d="M0 0 q-1 -14 2 -24" stroke="#5a4028" strokeWidth="2" fill="none" />
        {[-150, -120, -80, -40, -10].map((a) => (
          <path key={a} d="M0 0 q10 -4 18 2 q-8 2 -18 -2z" transform={`translate(2,-24) rotate(${a})`} />
        ))}
      </g>
      {/* umbrella */}
      <g transform={`translate(${30 + (h % 40)},112)`}>
        <path d="M0 0 v-8" stroke="#5a4028" strokeWidth="1.2" />
        <path d="M-7 -8 q7 -6 14 0 z" fill="var(--brand-sun)" />
      </g>
    </>
  );
}

function Mountain({ h }: { h: number }) {
  // Table Mountain silhouette with flat top, Lion's Head to the side.
  const flatL = 70 + (h % 10);
  const flatR = flatL + 50;
  return (
    <>
      <path d={`M0 96 L30 80 L50 86 L${flatL} 56 L${flatR} 56 L${flatR + 24} 78 L${flatR + 44} 70 L200 92 L200 120 L0 120 Z`} fill="#4b6a8f" />
      <path d={`M${flatL} 56 L${flatR} 56 L${flatR + 24} 78 L${flatL - 20} 86 Z`} fill="#3a5676" opacity="0.6" />
      <path d="M0 102 Q40 92 80 100 T160 98 T200 104 V120 H0 Z" fill="#6f9a6b" />
      {/* tablecloth cloud */}
      <path d={`M${flatL - 6} 60 q25 -10 ${flatR - flatL + 12} 0 q-8 6 -20 4 q-14 -2 -30 2 q-8 2 -12 -6z`} fill="#fff" opacity="0.8" />
      {/* city dots */}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={10 + i * 13 + ((h >> i) % 5)} y={104 + ((h >> (i + 2)) % 6)} width="4" height={6 + ((h >> (i + 1)) % 6)} fill="#e9e2d4" />
      ))}
    </>
  );
}

function City({ h, time }: { h: number; time: Time }) {
  const lit = time !== "day";
  return (
    <>
      <path d="M0 96 L40 84 L80 92 L120 82 L160 90 L200 86 L200 120 L0 120 Z" fill="#9aa9bf" opacity="0.5" />
      {[6, 26, 44, 66, 84, 104, 126, 146, 166, 184].map((x, i) => {
        const w = 12 + (i % 3) * 5;
        const y = 58 + ((h >> i) % 34);
        return (
          <g key={x}>
            <rect x={x} y={y} width={w} height={120 - y} fill={i % 2 ? "#2d4566" : "#3e5a80"} />
            {Array.from({ length: Math.floor((120 - y) / 8) }).map((_, r) =>
              Array.from({ length: Math.floor(w / 5) }).map((_, c) => (
                <rect key={`${r}-${c}`} x={x + 2 + c * 5} y={y + 3 + r * 8} width="2" height="3" fill={lit && (h >> (r + c + i)) % 3 === 0 ? "#ffd98a" : "#dbe6f2"} opacity={lit ? 0.9 : 0.5} />
              )),
            )}
          </g>
        );
      })}
      {/* jacaranda canopy */}
      {[20, 70, 130, 175].map((x, i) => (
        <g key={x}>
          <rect x={x + 5} y="104" width="2" height="12" fill="#5a4028" />
          <ellipse cx={x + 6} cy="103" rx={10 + (i % 2) * 3} ry="6" fill="#9b8ccf" />
        </g>
      ))}
      <path d="M0 114 H200 V120 H0 Z" fill="#6d8f5e" />
    </>
  );
}

function Bush({ h }: { h: number }) {
  return (
    <>
      <path d="M0 90 L40 78 L80 86 L130 74 L170 84 L200 80 L200 120 L0 120 Z" fill="#c88f5a" opacity="0.55" />
      <path d="M0 104 Q50 96 100 102 T200 100 V120 H0 Z" fill="#d9b06d" />
      {/* acacias */}
      {[30 + (h % 20), 120 + ((h >> 3) % 30)].map((x, i) => (
        <g key={i}>
          <path d={`M${x} 112 q1 -10 -2 -18`} stroke="#4a3220" strokeWidth="2" fill="none" />
          <ellipse cx={x - 2} cy="92" rx={18 + i * 4} ry="5" fill="#5e6b3a" />
        </g>
      ))}
      {/* giraffe & elephant silhouettes */}
      <g fill="#4a3220" transform={`translate(${70 + ((h >> 5) % 50)},112)`}>
        <rect x="-4" y="-10" width="8" height="10" rx="1" />
        <path d="M3 -10 l3 -14 l2 0 l-2 14z" />
        <path d="M6 -24 l4 -2 l-1 3z" />
        <rect x="-3.5" y="-2" width="1.5" height="4" />
        <rect x="2" y="-2" width="1.5" height="4" />
      </g>
      <g fill="#4a3220" transform={`translate(${150 + ((h >> 2) % 30)},113)`}>
        <ellipse cx="0" cy="-6" rx="8" ry="5" />
        <path d="M6 -8 q6 -2 6 6 q-2 2 -3 -4z" />
        <rect x="-6" y="-2" width="2" height="4" /><rect x="3" y="-2" width="2" height="4" />
      </g>
    </>
  );
}

function Winelands({ h }: { h: number }) {
  return (
    <>
      <path d="M0 88 L40 70 L70 80 L110 62 L140 76 L170 68 L200 84 L200 120 L0 120 Z" fill="#8ea3b5" />
      <path d="M0 98 Q60 88 120 96 T200 92 V120 H0 Z" fill="#7da35f" />
      {/* vine rows converging */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${-20 + i * 48} 120 L${80 + i * 12} 98`} stroke="#3f6a3a" strokeWidth={3 - i * 0.3} opacity="0.8" />
      ))}
      {/* Cape Dutch gable */}
      <g transform={`translate(${120 + (h % 30)},96)`}>
        <rect x="-16" y="-8" width="32" height="12" fill="#fff" />
        <path d="M-16 -8 L-8 -16 Q0 -22 8 -16 L16 -8 Z" fill="#fff" />
        <path d="M-16 -8 L-8 -16 Q0 -22 8 -16 L16 -8" fill="none" stroke="#2f4a3a" strokeWidth="1" />
        <rect x="-10" y="-5" width="4" height="6" fill="#2f4a3a" /><rect x="6" y="-5" width="4" height="6" fill="#2f4a3a" /><rect x="-2" y="-3" width="4" height="7" fill="#5a4028" />
      </g>
      {/* oaks */}
      {[20, 50].map((x) => (
        <g key={x}><rect x={x} y="100" width="2" height="8" fill="#5a4028" /><circle cx={x + 1} cy="98" r="6" fill="#4f7a43" /></g>
      ))}
    </>
  );
}

function Garden({ h }: { h: number }) {
  return (
    <>
      <path d="M0 84 L40 66 L80 78 L120 60 L160 74 L200 68 L200 120 L0 120 Z" fill="#6f9fb4" opacity="0.8" />
      {/* lagoon */}
      <path d="M0 100 Q50 94 100 100 T200 98 V112 H0 Z" fill="#5fb0c9" />
      <path d="M0 106 Q50 102 100 106 T200 104" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
      <path d="M0 112 Q60 106 120 112 T200 110 V120 H0 Z" fill="#4e8a4a" />
      {/* forest */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = 4 + i * 17 + ((h >> i) % 6);
        const hh = 12 + ((h >> (i + 3)) % 10);
        return <path key={i} d={`M${x} 100 l6 -${hh} l6 ${hh}z`} fill={i % 2 ? "#2f6b43" : "#3f8552"} />;
      })}
      {/* kayak */}
      <g transform={`translate(${60 + (h % 80)},105)`}>
        <path d="M-8 0 q8 -3 16 0 q-8 3 -16 0z" fill="var(--brand-sun)" />
        <path d="M-6 -3 l12 2" stroke="#5a4028" strokeWidth="1" />
      </g>
    </>
  );
}
