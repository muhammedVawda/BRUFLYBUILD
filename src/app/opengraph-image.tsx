import { ogCard, ogSize, ogContentType } from "@/lib/og";
export const runtime = "nodejs";
export const alt = "BruFly: flights and stays across South Africa";
export const size = ogSize;
export const contentType = ogContentType;
export default function Image() {
  return ogCard({ eyebrow: "Flights · Stays · BruPass", title: "Fly cheaper. Stay better. Sorted by a person.", subtitle: "FlySafair and LIFT flights, and stays across South Africa, checked by real people.", meta: ["No call centre", "Nothing charged until you approve"] });
}
