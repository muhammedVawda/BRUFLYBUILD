import { ogCard, ogSize, ogContentType } from "@/lib/og";
import { brupass } from "@/config/business";
export const runtime = "nodejs";
export const alt = "BruPass membership";
export const size = ogSize;
export const contentType = ogContentType;
export default function Image() {
  return ogCard({ eyebrow: "BruPass", title: "Member fares for people who fly often", subtitle: `From R${brupass.plans[0].priceZar} a month. Flights only. Check the calculator before you join.`, meta: ["Monthly or annual", "No preselected add-ons"] });
}
