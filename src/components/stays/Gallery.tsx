"use client";

import { useEffect, useRef, useState } from "react";
import { Illustration } from "@/components/Illustration";
import type { Scene } from "@/lib/types";

interface Props {
  name: string;
  slug: string;
  photos: string[];
  scene: Scene;
}

/**
 * Property gallery. With real photos: a 1+4 grid on desktop, a swipeable
 * strip on mobile, and a full-screen lightbox with keyboard support.
 * Without photos: an honest illustration placeholder, clearly labelled.
 */
export function Gallery({ name, slug, photos, scene }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open === null) return;
    document.body.dataset.scrollLock = "true";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    document.addEventListener("keydown", onKey);
    return () => {
      delete document.body.dataset.scrollLock;
      document.removeEventListener("keydown", onKey);
      openerRef.current?.focus();
    };
  }, [open, photos.length]);

  if (photos.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl">
        <div className="aspect-[16/9] w-full md:aspect-[21/9]">
          <Illustration scene={scene} seed={slug} className="h-full w-full" label={`Illustration placeholder for ${name}`} />
        </div>
        <p className="absolute bottom-3 left-3 rounded-lg bg-ocean/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
          Illustration of the area. Photos of this property are being added.
        </p>
      </div>
    );
  }

  const src = (f: string) => `/images/stays/${slug}/${f}`;
  return (
    <>
      <div className="grid gap-2 overflow-hidden rounded-3xl md:grid-cols-4 md:grid-rows-2">
        {photos.slice(0, 5).map((f, i) => (
          <button
            key={f}
            type="button"
            className={`relative overflow-hidden bg-sand-100 ${i === 0 ? "md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto" : "hidden md:block aspect-[4/3]"}`}
            onClick={(e) => {
              openerRef.current = e.currentTarget;
              setOpen(i);
            }}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src(f)} alt={`${name} photo ${i + 1}`} width={1200} height={900} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : undefined} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-outline btn-sm mt-3" onClick={(e) => { openerRef.current = e.currentTarget; setOpen(0); }}>
        Show all {photos.length} photos
      </button>
      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label={`${name} photos`} className="fixed inset-0 z-[80] flex flex-col bg-ocean/95 fade-in" onClick={() => setOpen(null)}>
          <div className="flex items-center justify-between p-4 text-white">
            <p>{open + 1} / {photos.length}</p>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(null)}>Close</button>
          </div>
          <div className="flex flex-1 items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src(photos[open])} alt={`${name} photo ${open + 1}`} className="max-h-full max-w-full rounded-xl object-contain" />
          </div>
          <div className="flex justify-center gap-3 p-4" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen((open - 1 + photos.length) % photos.length)}>Previous</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen((open + 1) % photos.length)}>Next</button>
          </div>
        </div>
      )}
    </>
  );
}
