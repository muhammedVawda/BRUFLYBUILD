import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-3xl md:text-5xl text-ocean">That page has flown</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-2">The link may be old or the listing may have been removed. Try a search instead.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/flights" className="btn btn-secondary">Search flights</Link>
        <Link href="/stays" className="btn btn-outline">Search stays</Link>
      </div>
    </div>
  );
}
