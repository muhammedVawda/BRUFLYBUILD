import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/** Shared Open Graph card: brand mark, eyebrow, title, supporting line. No external fonts or network. */
export function ogCard({ eyebrow, title, subtitle, meta }: { eyebrow: string; title: string; subtitle?: string; meta?: string[] }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "linear-gradient(135deg, #0b2a4a 0%, #143a63 60%, #1d4f84 100%)", color: "#fff", fontFamily: "Georgia, serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: "#f2701d", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 22, height: 22, background: "#fff", borderRadius: "40% 60% 60% 40%", transform: "rotate(-30deg)" }} />
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            Bru<span style={{ color: "#ffb47a" }}>Fly</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: "#ffb47a", fontFamily: "sans-serif", fontWeight: 700 }}>{eyebrow}</div>
          <div style={{ fontSize: title.length > 40 ? 60 : 76, lineHeight: 1.05, fontWeight: 700, letterSpacing: -2, maxWidth: 1000 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 30, color: "rgba(255,255,255,0.82)", fontFamily: "sans-serif", maxWidth: 1000 }}>{subtitle}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "sans-serif", fontSize: 24, color: "rgba(255,255,255,0.75)" }}>
          <div style={{ display: "flex", gap: 28 }}>{(meta ?? []).map((m) => <span key={m}>{m}</span>)}</div>
          <span>brufly.co.za</span>
        </div>
      </div>
    ),
    ogSize,
  );
}
