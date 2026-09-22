"use client";

import { useRef, useState } from "react";
import { PROPERTY_TYPES } from "@/lib/search-params";
import { useIdempotencyKey } from "@/components/checkout/useIdempotencyKey";
import { track } from "@/lib/analytics";

export function HostForm() {
  const idem = useIdempotencyKey("host");
  const [v, setV] = useState({ name: "", email: "", phone: "", town: "", type: "", rooms: "", message: "" });
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setState("submitting");
    try {
      const res = await fetch("/api/host-enquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...v, idempotencyKey: idem }) });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error);
        setState("error");
        submitting.current = false;
        return;
      }
      track("host_enquiry", { type: v.type });
      setState("done");
    } catch {
      setError("We couldn't send your enquiry. Please try again.");
      setState("error");
      submitting.current = false;
    }
  }

  if (state === "done") return <div className="card p-6" role="status"><p className="display text-xl font-semibold text-ocean">Thanks, we'll be in touch</p><p className="mt-2 text-ink-2">A member of the BruFly Stays team will contact you within two working days to talk through your property and next steps.</p></div>;

  const f = (k: keyof typeof v, label: string, props: Record<string, unknown> = {}) => (
    <div>
      <label htmlFor={`h-${k}`} className="label">{label}</label>
      <input id={`h-${k}`} className="field" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} {...props} />
    </div>
  );
  return (
    <form onSubmit={submit} className="card space-y-4 p-5 md:p-6" noValidate>
      <h2 className="font-sans text-lg font-bold">Tell us about your property</h2>
      {state === "error" && <p className="error-text" role="alert">{error}</p>}
      {f("name", "Your name", { autoComplete: "name", required: true })}
      {f("email", "Email", { type: "email", autoComplete: "email", required: true })}
      {f("phone", "Phone", { type: "tel", autoComplete: "tel", required: true })}
      {f("town", "Town or suburb", { required: true })}
      <div>
        <label htmlFor="h-type" className="label">Property type</label>
        <select id="h-type" className="field" value={v.type} onChange={(e) => setV({ ...v, type: e.target.value })} required>
          <option value="">Choose…</option>
          {PROPERTY_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>
      {f("rooms", "Rooms or units", { type: "number", min: 1, inputMode: "numeric" })}
      <div>
        <label htmlFor="h-msg" className="label">Anything else (optional)</label>
        <textarea id="h-msg" className="field min-h-[90px] py-3" value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} maxLength={1000} />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={state === "submitting"}>{state === "submitting" ? "Sending…" : "Send host enquiry"}</button>
      <p className="text-xs text-ink-3">We'll only use these details to talk to you about listing. No spam, no lists.</p>
    </form>
  );
}
