import { ogCard, ogSize, ogContentType } from "@/lib/og";
import { properties } from "@/lib/data/properties";
import { destinations } from "@/lib/data/destinations";
export const runtime = "nodejs";
export const alt = "BruFly Stays";
export const size = ogSize;
export const contentType = ogContentType;
export default function Image() {
  return ogCard({ eyebrow: "BruFly Stays", title: "Find a place to stay, anywhere in South Africa", subtitle: `${properties.length} stays across ${destinations.length} destinations. Clear total prices. No flight needed.`, meta: ["Request to book", "Real person confirms"] });
}
