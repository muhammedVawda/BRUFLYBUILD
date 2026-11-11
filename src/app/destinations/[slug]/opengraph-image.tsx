import { ogCard, ogSize, ogContentType } from "@/lib/og";
import { destinations, getDestination } from "@/lib/data/destinations";
import { propertiesForDestination } from "@/lib/data/properties";
export const runtime = "nodejs";
export const alt = "Destination on BruFly";
export const size = ogSize;
export const contentType = ogContentType;
export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d) return ogCard({ eyebrow: "BruFly", title: "Destination" });
  const n = propertiesForDestination(d.slug).length;
  return ogCard({ eyebrow: d.province, title: `Stays in ${d.name}`, subtitle: d.intro, meta: [`${n} places to stay`, d.airport ? `Fly into ${d.airport}` : ""].filter(Boolean) });
}
