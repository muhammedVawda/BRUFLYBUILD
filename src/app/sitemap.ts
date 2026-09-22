import type { MetadataRoute } from "next";
import { company } from "@/config/business";
import { properties } from "@/lib/data/properties";
import { destinations } from "@/lib/data/destinations";
import { propertiesForDestination } from "@/lib/data/properties";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = company.domain;
  const now = new Date();
  const statics = ["", "/flights", "/stays", "/brupass", "/host", "/help", "/terms", "/privacy", "/cancellation"].map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 }));
  const dests = destinations.filter((d) => propertiesForDestination(d.slug).length > 0).map((d) => ({ url: `${base}/destinations/${d.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 }));
  const stays = properties.map((p) => ({ url: `${base}/stays/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 }));
  return [...statics, ...dests, ...stays];
}
