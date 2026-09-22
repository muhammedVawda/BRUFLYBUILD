import type { Metadata } from "next";
import { company } from "@/config/business";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <div className="container-x py-8 md:py-12">
      <article className="prose-bru max-w-3xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-2 mb-6 text-3xl md:text-5xl text-ocean">Privacy policy</h1>
        <p className="rounded-xl bg-warn-100 p-3 text-sm text-warn">Draft for review under the Protection of Personal Information Act (POPIA) before publication.</p>
        <h2 className="mt-8 text-2xl text-ocean">What we collect</h2>
        <p>Names, contact details and travel details you enter to request a booking; passenger names for ticketing; and technical data needed to run the site. We do not collect payment card details on this site.</p>
        <h2 className="mt-8 text-2xl text-ocean">Why</h2>
        <p>To arrange and support your booking with the airline or host, to contact you about it, and to meet legal obligations. We share booking details only with the supplier providing your travel.</p>
        <h2 className="mt-8 text-2xl text-ocean">Cookies and analytics</h2>
        <p>Essential cookies run the booking flow. Optional analytics cookies are set only if you accept them in the cookie notice, and analytics events never include your name, email or phone number. You can change your choice by clearing site data in your browser.</p>
        <h2 className="mt-8 text-2xl text-ocean">Your rights</h2>
        <p>You may ask what personal information we hold, correct it, or ask us to delete it where we have no legal duty to keep it. Contact {company.email}.</p>
      </article>
    </div>
  );
}
