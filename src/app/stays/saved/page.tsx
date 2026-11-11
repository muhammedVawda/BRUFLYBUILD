import type { Metadata } from "next";
import { SavedStays } from "@/components/stays/SavedStays";

export const metadata: Metadata = { title: "Saved stays", robots: { index: false, follow: true } };

export default function SavedPage() {
  return (
    <div className="container-x py-8 md:py-12">
      <p className="eyebrow">Saved</p>
      <h1 className="mt-2 text-3xl md:text-5xl text-ocean">Your saved stays</h1>
      <p className="mt-2 max-w-xl text-ink-2">Saved in this browser so you can compare and come back. Add dates to see totals.</p>
      <div className="mt-8"><SavedStays /></div>
    </div>
  );
}
