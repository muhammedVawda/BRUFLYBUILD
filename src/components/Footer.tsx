import Link from "next/link";
import { Logo } from "@/components/Logo";
import { company } from "@/config/business";
import { destinations } from "@/lib/data/destinations";

export function Footer() {
  const wa = `https://wa.me/${company.whatsapp.replace(/\D/g, "")}`;
  return (
    <footer className="mt-20 bg-ocean text-white/85">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            BruFly finds flights on FlySafair and LIFT and stays across South Africa. A real person checks every booking
            request before it is confirmed.
          </p>
        </div>
        <div>
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-white/60">Book</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/flights">Flights</Link></li>
            <li><Link className="hover:text-white" href="/stays">Stays</Link></li>
            <li><Link className="hover:text-white" href="/brupass">BruPass membership</Link></li>
            <li><Link className="hover:text-white" href="/host">List your property</Link></li>
            <li><Link className="hover:text-white" href="/account">Manage a booking</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-white/60">Destinations</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {destinations.map((d) => (
              <li key={d.slug}>
                <Link className="hover:text-white" href={`/destinations/${d.slug}`}>
                  Stays in {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-white/60">Help</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/help">Help centre</Link></li>
            <li><a className="hover:text-white" href={wa} rel="noopener noreferrer">WhatsApp {company.whatsappDisplay}</a></li>
            <li><a className="hover:text-white" href={`mailto:${company.email}`}>{company.email}</a></li>
            <li className="text-white/60">{company.supportHours}</li>
          </ul>
          <ul className="mt-6 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/terms">Terms of service</Link></li>
            <li><Link className="hover:text-white" href="/cancellation">Cancellation and refunds</Link></li>
            <li><Link className="hover:text-white" href="/privacy">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company.legalName}. Flights are operated by the airline named on your ticket; stays are provided by the host or property named on your confirmation.</p>
          <p>Prices in South African rand (ZAR).</p>
        </div>
      </div>
    </footer>
  );
}
