import type { MetadataRoute } from "next";
import { company } from "@/config/business";

/**
 * Indexing strategy: clean /stays, /flights, destination and property pages
 * are indexable. Search result URLs with dates, guests or filters, checkout
 * and booking pages are not (they also carry noindex meta).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/bookings/", "/account", "/*/book", "/stays?*", "/flights?*"] },
    ],
    sitemap: `${company.domain}/sitemap.xml`,
  };
}
