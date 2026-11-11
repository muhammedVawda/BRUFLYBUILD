import type { Metadata } from "next";
import { TeamConsole } from "@/components/TeamConsole";

export const metadata: Metadata = { title: "Team console", robots: { index: false, follow: false } };

export default function TeamPage() {
  return (
    <div className="container-x py-8 md:py-12">
      <p className="eyebrow">Internal</p>
      <h1 className="mt-2 text-3xl md:text-4xl text-ocean">Team console</h1>
      <p className="mt-2 max-w-2xl text-ink-2">Move a request through its states once you've checked with the airline or host. Customers see the change on their booking page immediately. Requires the team token.</p>
      <div className="mt-8 max-w-2xl"><TeamConsole /></div>
    </div>
  );
}
