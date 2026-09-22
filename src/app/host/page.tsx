import type { Metadata } from "next";
import { HostForm } from "@/components/HostForm";
import { FAQ } from "@/components/FAQ";
import { stayBooking } from "@/config/business";

export const metadata: Metadata = {
  title: "List your property on BruFly Stays",
  description: "Hosts, guesthouses and small hotels: list with BruFly Stays and reach travellers already booking flights across South Africa. No listing fee; you approve every booking.",
  alternates: { canonical: "/host" },
};

const faqs = [
  { q: "What does it cost to list?", a: `There is no fee to list. ${stayBooking.serviceFeeRate > 0 ? `BruFly charges a service fee of ${Math.round(stayBooking.serviceFeeRate * 100)}% on confirmed bookings.` : "Commission terms are agreed with you before your listing goes live."}` },
  { q: "Do I have to accept every booking?", a: "No. Listings are request-to-book by default. You confirm or decline each request within 24 hours. Instant booking can be enabled later if you prefer." },
  { q: "Is my address shown publicly?", a: "No. We show your suburb or area on the listing and share the exact address only in the guest's confirmation." },
  { q: "What do I need to provide?", a: "Accurate photos of the actual property, a description, capacity, amenities, rates, cancellation terms and check-in details. We review every listing before it goes live." },
];

export default function HostPage() {
  return (
    <div className="container-x py-8 md:py-12">
      <header className="max-w-3xl">
        <p className="eyebrow">Hosts</p>
        <h1 className="mt-2 text-3xl md:text-5xl text-ocean">List your place on BruFly Stays</h1>
        <p className="mt-3 text-lg text-ink-2">Guesthouses, cottages, apartments, lodges and small hotels. Travellers searching flights on BruFly see stays at their destination, and every booking request is checked by our team before it reaches you.</p>
      </header>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <ul className="grid gap-4 sm:grid-cols-3">
            {[["You stay in control", "Approve or decline each request. Set your own rates, minimum nights and cancellation terms."], ["Honest listings", "Real photos, accurate capacity and clear fees. Guests arrive knowing exactly what they booked."], ["Real support", "A BruFly person handles guest questions before and during the stay, and you have a direct line to us."]].map(([t, d]) => (
              <li key={t} className="card p-5"><h2 className="font-sans text-base font-bold">{t}</h2><p className="mt-1 text-sm text-ink-2">{d}</p></li>
            ))}
          </ul>
          <FAQ items={faqs} id="host-faq" title="Hosting questions" />
        </div>
        <aside>
          <HostForm />
        </aside>
      </div>
    </div>
  );
}
