import type { Metadata } from "next";
import { cancellationCopy } from "@/lib/pricing";
import { flightBooking } from "@/config/business";

export const metadata: Metadata = { title: "Cancellation and refunds", alternates: { canonical: "/cancellation" } };

export default function CancellationPage() {
  return (
    <div className="container-x py-8 md:py-12">
      <article className="prose-bru max-w-3xl">
        <p className="eyebrow">Policies</p>
        <h1 className="mt-2 mb-6 text-3xl md:text-5xl text-ocean">Cancellation and refunds</h1>
        <h2 className="text-2xl text-ocean">Requests that aren't confirmed yet</h2>
        <p>Cancel free at any time from your booking page. Nothing has been charged, so there is nothing to refund.</p>
        <h2 className="mt-8 text-2xl text-ocean">Confirmed flights</h2>
        <p>Once ticketed, the fare rules of {flightBooking.airlines.join(" or ")} apply. Most low-cost fares are non-refundable but can be changed for a fee plus any fare difference. We show you the rules with your confirmed fare, and our team will process changes with the airline on your behalf.</p>
        <h2 className="mt-8 text-2xl text-ocean">Confirmed stays</h2>
        <p>Each listing has one of three cancellation terms, shown on the card, the listing page and the checkout before you send a request:</p>
        <ul className="mb-4 list-disc space-y-2 pl-5 text-ink-2">
          {Object.values(cancellationCopy).map((c) => <li key={c.title}><strong className="text-ink">{c.title}.</strong> {c.detail}</li>)}
        </ul>
        <p>Refunds due are returned to the payment method used, normally within 7 to 10 working days of the refund being approved. Bank processing times vary.</p>
        <h2 className="mt-8 text-2xl text-ocean">If the supplier cancels</h2>
        <p>If an airline or host cancels a confirmed booking, you receive a full refund of what you paid BruFly, and we will help you find an alternative. BruFly is not liable for costs beyond the amount paid for the cancelled service.</p>
      </article>
    </div>
  );
}
