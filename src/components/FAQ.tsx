export interface FAQItem {
  q: string;
  a: string;
}

/** Native <details> accordion: accessible, no JS, crawlable. */
export function FAQ({ items, title = "Frequently asked questions", id }: { items: FAQItem[]; title?: string; id?: string }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-h` : undefined}>
      <h2 id={id ? `${id}-h` : undefined} className="text-2xl md:text-3xl text-ocean">
        {title}
      </h2>
      <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
        {items.map((it) => (
          <details key={it.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {it.q}
              <span className="shrink-0 rounded-full bg-sand-100 p-1.5 transition-transform group-open:rotate-45" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" fill="none"><path d="M7 1v12M1 7h12" /></svg>
              </span>
            </summary>
            <p className="mt-2 leading-relaxed text-ink-2">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function faqJsonLd(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}
