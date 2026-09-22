import type { Metadata } from "next";
import { BookingStatus } from "@/components/BookingStatus";

export const metadata: Metadata = { title: "Your booking", robots: { index: false, follow: false } };

export default async function BookingPage({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { ref } = await params;
  const sp = await searchParams;
  return (
    <div className="container-x py-8 md:py-12">
      <BookingStatus refCode={ref.toUpperCase()} isNew={sp.new === "1"} />
    </div>
  );
}
