import type { Metadata } from "next";
import Link from "next/link";
import { brupass, flightBooking } from "@/config/business";
import { formatZar } from "@/lib/money";
import { BruPassCalculator } from "@/components/brupass/Calculator";
import { PlanPicker } from "@/components/brupass/PlanPicker";
import { FAQ, faqJsonLd } from "@/components/FAQ";

export const metadata: Metadata = {
  title: "BruPass membership: member fares on domestic flights",
  description: `BruPass gives members access to member fares on ${flightBooking.airlines.join(" and ")} flights requested through BruFly. See prices, conditions and a calculator to check whether it's worth it for you.`,
  alternates: { canonical: "/brupass" },
};

const faqs = [
  { q: "Does BruPass discount accommodation?", a: "No. BruPass member fares apply to flights requested through BruFly only. BruFly Stays prices are the same for members and non-members." },
  { q: "Is a saving guaranteed on every flight?", a: "No. Member fares depend on what the airline has available on the day. On some routes and dates the public fare may be the same or lower, and we'll always tell you which is cheaper." },
  { q: "How many passengers are covered?", a: `Up to ${brupass.passengersPerBooking} passengers on a single booking made by the member.` },
  { q: "Can I cancel?", a: `${brupass.plans[0].name} can be cancelled any time before the next billing date and access continues to the end of the paid month. ${brupass.plans[1].name} is a 12-month commitment and is not refundable once a member fare has been booked.` },
  { q: "Is there a free trial?", a: brupass.trial.days > 0 ? `Yes, ${brupass.trial.days} days. ${brupass.trial.cancellationDuringTrial}` : "Not at the moment. If we introduce one, its cancellation rules will be shown here and at checkout before you join." },
];

export default function BruPassPage() {
  return (
    <div className="container-x py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      <header className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <p className="eyebrow">BruPass</p>
          <h1 className="mt-2 text-3xl md:text-5xl text-ocean">Member fares for people who fly often</h1>
          <p className="mt-3 text-lg text-ink-2">BruPass unlocks member fares on {flightBooking.airlines.join(" and ")} flights requested through BruFly. It's a paid membership, so check the numbers below before you join. It does not apply to stays.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#calculator" className="btn btn-secondary">Check if it's worth it</a>
            <a href="#join" className="btn btn-outline">See plans</a>
          </div>
        </div>
        <ul className="grid gap-3">
          {brupass.plans.map((p) => (
            <li key={p.id} className="card p-5">
              <p className="font-sans text-lg font-bold">{p.name}</p>
              <p className="text-2xl font-extrabold">{formatZar(p.priceZar)} <span className="text-sm font-medium text-ink-2">{p.billing === "monthly" ? "per month" : "per year"}</span></p>
              <p className="mt-1 text-sm text-ink-2">{p.commitmentMonths === 1 ? "No commitment beyond the current month." : `${p.commitmentMonths}-month commitment (equivalent to ${formatZar(Math.round(p.priceZar / 12))} per month).`}</p>
            </li>
          ))}
        </ul>
      </header>

      <section className="mt-16 grid gap-6 md:grid-cols-3" aria-label="What you get">
        {[
          { t: "Member fares on flights", d: `Access to member fares on ${flightBooking.airlines.join(" and ")} routes when they are available for your dates.` },
          { t: `Up to ${brupass.passengersPerBooking} passengers per booking`, d: "Bring the family or the team on one booking. The saving is counted once per booking, not per passenger." },
          { t: "Same real-person check", d: "Every request is still checked by the BruFly team before it's ticketed. If the public fare is cheaper on the day, we tell you." },
        ].map((x) => (
          <div key={x.t} className="card p-6"><h2 className="font-sans text-lg font-bold">{x.t}</h2><p className="mt-1 text-ink-2">{x.d}</p></div>
        ))}
      </section>

      <div className="mt-16"><BruPassCalculator /></div>
      <div className="mt-16"><PlanPicker /></div>
      <div className="mt-16"><FAQ items={faqs} id="brupass-faq" title="BruPass questions" /></div>
      <p className="mt-8 text-sm text-ink-3">Looking for flights? <Link href="/flights" className="link">Search flights</Link>.</p>
    </div>
  );
}
