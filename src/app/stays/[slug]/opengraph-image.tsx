import { ogCard, ogSize, ogContentType } from "@/lib/og";
import { getProperty, properties } from "@/lib/data/properties";
import { getDestination } from "@/lib/data/destinations";
import { PROPERTY_TYPES } from "@/lib/search-params";
export const runtime = "nodejs";
export const alt = "Stay on BruFly";
export const size = ogSize;
export const contentType = ogContentType;
export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) return ogCard({ eyebrow: "BruFly Stays", title: "Stay not found" });
  const d = getDestination(p.destination);
  const type = PROPERTY_TYPES.find((t) => t.id === p.type)?.label ?? p.type;
  return ogCard({ eyebrow: `${type} · ${p.area}, ${d?.name ?? ""}`, title: p.name, subtitle: p.summary, meta: [`Sleeps ${p.maxGuests}${p.roomBased ? " per room" : ""}`, `From R${p.nightlyRateZar} per night`] });
}
