import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProperty } from "@/lib/data/properties";
import { getDestination } from "@/lib/data/destinations";
import { quoteStay } from "@/lib/pricing";
import { StayCheckout } from "@/components/checkout/StayCheckout";

type SP = Record<string, string | string[] | undefined>;

export const metadata: Metadata = { title: "Request your stay", robots: { index: false, follow: false } };

export default async function BookPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SP> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const p = getProperty(slug);
  if (!p) notFound();
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const guests = {
    adults: Math.max(1, Number(str("adults") || 2) || 2),
    children: Math.max(0, Number(str("children") || 0) || 0),
    childAges: str("ages").split(",").filter(Boolean).map(Number),
    rooms: Math.max(1, Number(str("rooms") || 1) || 1),
  };
  const q = quoteStay(p, str("checkin"), str("checkout"), guests);
  const backQs = new URLSearchParams(Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][]).toString();
  if (!q.ok) {
    return (
      <div className="container-x py-12">
        <h1 className="text-3xl text-ocean">We need to check your dates first</h1>
        <p className="mt-3 text-ink-2">{q.error.message}</p>
        <Link href={`/stays/${p.slug}${backQs ? `?${backQs}` : ""}`} className="btn btn-secondary mt-6">Back to {p.name}</Link>
      </div>
    );
  }
  const d = getDestination(p.destination);
  return (
    <div className="container-x py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-3">
        <Link href={`/stays/${p.slug}?${backQs}`} className="hover:text-ink">‹ Back to {p.name}</Link>
      </nav>
      <h1 className="text-3xl md:text-4xl text-ocean">{p.bookingMode === "enquiry" ? "Send an enquiry" : "Request your stay"}</h1>
      <p className="mt-2 max-w-2xl text-ink-2">Check the details below, add how we can reach you, and send your {p.bookingMode === "enquiry" ? "enquiry" : "request"}. Nothing is charged at this step.</p>
      <div className="mt-8">
        <StayCheckout property={{ slug: p.slug, name: p.name, area: p.area, bookingMode: p.bookingMode, cancellation: p.cancellation, checkIn: p.checkIn, checkOut: p.checkOut, hostName: p.hostName }} quote={q.quote} destinationName={d?.name ?? ""} />
      </div>
    </div>
  );
}
