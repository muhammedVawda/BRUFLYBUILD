import type { Metadata } from "next";
import { company, flightBooking, stayBooking, brupass } from "@/config/business";

export const metadata: Metadata = { title: "Terms of service", alternates: { canonical: "/terms" } };

/** DRAFT terms for review by the business and its legal adviser before publication. */
export default function TermsPage() {
  return (
    <div className="container-x py-8 md:py-12">
      <article className="prose-bru max-w-3xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-2 mb-6 text-3xl md:text-5xl text-ocean">Terms of service</h1>
        <p className="rounded-xl bg-warn-100 p-3 text-sm text-warn">Draft for review. These terms must be checked by {company.legalName} and its legal adviser before they are relied on.</p>
        <h2 className="mt-8 text-2xl text-ocean">1. Who we are</h2>
        <p>{company.legalName} ("BruFly", "we") operates {company.domain}. BruFly arranges flight bookings with airlines and accommodation bookings with hosts and properties ("suppliers"). The supplier named on your confirmation provides the travel service; BruFly provides the booking, checking and support service.</p>
        <h2 className="mt-8 text-2xl text-ocean">2. Requests and confirmations</h2>
        <p>Sending a request through the site is not a booking. BruFly checks price and availability with the supplier and confirms or declines within {flightBooking.confirmationWindowHours} hours for flights and {stayBooking.confirmationWindowHours} hours for stays. A booking exists only when BruFly sends a written confirmation and the booking status reads "Confirmed".</p>
        <h2 className="mt-8 text-2xl text-ocean">3. Prices and payment</h2>
        <p>Flight fares shown before confirmation are sample fares for planning. The fare you pay is the fare BruFly confirms with you in writing. Stay totals include VAT and mandatory fees and are re-validated before you send a request; if the total changes, you will be asked to accept the new total. No payment is taken when you send a request. Payment instructions are sent with the confirmation, and tickets are issued or dates secured only after payment is received.</p>
        <h2 className="mt-8 text-2xl text-ocean">4. Cancellations and refunds</h2>
        <p>Unconfirmed requests may be cancelled at no cost. Confirmed flights are subject to the airline's fare rules. Confirmed stays are subject to the cancellation terms shown on the listing and repeated in your confirmation. See our <a className="link" href="/cancellation">cancellation and refunds page</a>.</p>
        <h2 id="brupass" className="mt-8 text-2xl text-ocean">5. BruPass membership</h2>
        <p>BruPass is a paid membership giving access to member fares on flights requested through BruFly for up to {brupass.passengersPerBooking} passengers per booking. It does not apply to accommodation. Plan prices, billing periods, commitment and cancellation conditions are shown on the BruPass page and again before you join. A saving is not guaranteed on every route or date.</p>
        <h2 className="mt-8 text-2xl text-ocean">6. Your responsibilities</h2>
        <p>You must provide accurate passenger and guest details, hold valid identification for travel, and comply with the supplier's rules. Name changes after ticketing are subject to airline fees.</p>
        <h2 className="mt-8 text-2xl text-ocean">7. Contact</h2>
        <p>{company.email} · WhatsApp {company.whatsappDisplay} · {company.supportHours}.</p>
      </article>
    </div>
  );
}
