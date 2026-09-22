import type { Metadata } from "next";
import { AccountLookup } from "@/components/AccountLookup";

export const metadata: Metadata = { title: "My bookings", robots: { index: false, follow: true } };

export default function AccountPage() {
  return (
    <div className="container-x py-8 md:py-12">
      <header className="max-w-2xl">
        <p className="eyebrow">My bookings</p>
        <h1 className="mt-2 text-3xl md:text-5xl text-ocean">Find your requests and bookings</h1>
        <p className="mt-3 text-ink-2">Enter a booking reference, or the email address you booked with. Full accounts with sign-in are on the roadmap; for now this lookup is enough to check status and cancel unconfirmed requests.</p>
      </header>
      <div className="mt-8 max-w-2xl"><AccountLookup /></div>
    </div>
  );
}
