import type { Metadata } from "next";
import Link from "next/link";
import { company, flightBooking, stayBooking } from "@/config/business";
import { FAQ } from "@/components/FAQ";

export const metadata: Metadata = { title: "Help and contact", description: "Get help finding a flight or stay, with an existing booking, or with BruPass. Reach a real person on WhatsApp or email.", alternates: { canonical: "/help" } };

export default function HelpPage() {
  const wa = `https://wa.me/${company.whatsapp.replace(/\D/g, "")}`;
  return (
    <div className="container-x py-8 md:py-12">
      <header className="max-w-3xl">
        <p className="eyebrow">Help</p>
        <h1 className="mt-2 text-3xl md:text-5xl text-ocean">How can we help?</h1>
        <p className="mt-3 text-lg text-ink-2">Pick a starting point, or talk to a person: WhatsApp <a className="link" href={wa}>{company.whatsappDisplay}</a> or <a className="link" href={`mailto:${company.email}`}>{company.email}</a>, {company.supportHours}.</p>
      </header>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <section id="find" className="card p-6"><h2 className="font-sans text-lg font-bold">Finding a flight or stay</h2><p className="mt-2 text-sm text-ink-2">Search by destination and dates. Fares are sample fares until we confirm them; stay prices are totals for your dates.</p><div className="mt-4 flex flex-col gap-2"><Link href="/flights" className="btn btn-outline btn-sm">Search flights</Link><Link href="/stays" className="btn btn-outline btn-sm">Search stays</Link></div></section>
        <section id="booking" className="card p-6"><h2 className="font-sans text-lg font-bold">An existing booking</h2><p className="mt-2 text-sm text-ink-2">Look up your request with its reference or your email to see its status, cancel an unconfirmed request, or contact us about a confirmed booking.</p><Link href="/account" className="btn btn-outline btn-sm mt-4">Find my booking</Link></section>
        <section id="brupass" className="card p-6"><h2 className="font-sans text-lg font-bold">BruPass questions</h2><p className="mt-2 text-sm text-ink-2">Prices, what's covered (flights only), commitment and cancellation, and a calculator to check whether it pays off for you.</p><Link href="/brupass" className="btn btn-outline btn-sm mt-4">About BruPass</Link></section>
      </div>
      <div className="mt-16 max-w-3xl">
        <FAQ
          id="help-faq"
          title="Common questions"
          items={[
            { q: "Who am I booking with?", a: "You book through BruFly. Flights are operated by the airline named on your ticket (FlySafair or LIFT). Stays are provided by the host or property named on your confirmation. BruFly handles the request, confirmation and support." },
            { q: "When am I charged?", a: `Never at request time. For flights, we confirm the live fare within ${flightBooking.confirmationWindowHours} hours and send payment instructions; the ticket is issued after payment. For stays, the host confirms within ${stayBooking.confirmationWindowHours} hours and we send payment instructions after that.` },
            { q: "What does 'Request received' mean?", a: "We have your request and nothing is charged. It is not a booking yet. Your booking page changes to 'Confirmed' only when the airline or host has confirmed and we've emailed you." },
            { q: "How do I cancel?", a: "Unconfirmed requests can be cancelled free from your booking page. Confirmed flights follow the airline's rules; confirmed stays follow the cancellation terms shown on the listing and in your confirmation." },
            { q: "Can support see my booking details?", a: "Yes, once you've confirmed the booking reference and the email address you booked with. We won't share booking details with anyone else." },
          ]}
        />
      </div>
    </div>
  );
}
