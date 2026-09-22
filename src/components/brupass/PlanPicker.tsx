"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { brupass } from "@/config/business";
import { formatZar } from "@/lib/money";
import { ContactFields, validateContact, type Contact } from "@/components/checkout/ContactFields";
import { useIdempotencyKey } from "@/components/checkout/useIdempotencyKey";
import { track } from "@/lib/analytics";

/** Plan selection: nothing preselected, conditions beside the action, no payment captured in this build. */
export function PlanPicker() {
  const [planId, setPlanId] = useState<string | null>(null);
  const [contact, setContact] = useState<Contact>({ name: "", email: "", phone: "" });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>> & { plan?: string; agree?: string }>({});
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [result, setResult] = useState<{ ref: string; message: string } | null>(null);
  const idem = useIdempotencyKey("brupass");
  const submitting = useRef(false);
  const plan = brupass.plans.find((p) => p.id === planId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    const errs: typeof errors = validateContact(contact);
    if (!plan) errs.plan = "Choose a plan.";
    if (!agree) errs.agree = "Please confirm the membership terms.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    submitting.current = true;
    setState("submitting");
    try {
      const res = await fetch("/api/brupass", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ planId, contact, idempotencyKey: idem, acceptedTerms: agree }) });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error);
      track("brupass_signup", { plan: planId });
      setResult(json);
      setState("done");
    } catch {
      setState("error");
      submitting.current = false;
    }
  }

  if (state === "done" && result) {
    return (
      <div className="card p-6" role="status">
        <p className="display text-2xl font-semibold text-ocean">Thanks, we've got your BruPass request</p>
        <p className="mt-2 text-ink-2">{result.message}</p>
        <p className="mt-2 text-sm text-ink-3">Reference {result.ref}. Nothing has been charged.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate id="join" className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <fieldset>
          <legend className="text-2xl text-ocean display font-semibold">Choose a plan</legend>
          {errors.plan && <p className="error-text" role="alert">{errors.plan}</p>}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {brupass.plans.map((p) => {
              const on = planId === p.id;
              return (
                <label key={p.id} className={`card cursor-pointer p-5 transition-colors ${on ? "border-ocean ring-2 ring-ocean-100" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-sans text-lg font-bold">{p.name}</p>
                      <p className="mt-1 text-2xl font-extrabold">{formatZar(p.priceZar)} <span className="text-sm font-medium text-ink-2">{p.billing === "monthly" ? "per month" : "per year"}</span></p>
                    </div>
                    <input type="radio" name="plan" value={p.id} checked={on} onChange={() => setPlanId(p.id)} className="mt-1 h-5 w-5 accent-[var(--brand-ocean)]" aria-label={p.name} />
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-ink-2">
                    <li><strong className="text-ink">Commitment:</strong> {p.commitmentMonths === 1 ? "none beyond the current month" : `${p.commitmentMonths} months`}</li>
                    <li><strong className="text-ink">Billing:</strong> {p.description}</li>
                    <li><strong className="text-ink">Applies to:</strong> flights booked through BruFly, up to {brupass.passengersPerBooking} passengers per booking</li>
                    <li><strong className="text-ink">Trial:</strong> {brupass.trial.days > 0 ? `${brupass.trial.days} days` : "none"}</li>
                  </ul>
                </label>
              );
            })}
          </div>
        </fieldset>
        <section className="card p-5 md:p-6"><ContactFields value={contact} onChange={setContact} errors={errors} disabled={state === "submitting"} /></section>
      </div>
      <aside className="card h-fit p-5 lg:sticky" style={{ top: "calc(var(--header-h) + 16px)" }}>
        <h3 className="font-sans text-lg font-bold">Before you join</h3>
        <ul className="mt-3 space-y-2 text-sm text-ink-2">
          <li>Selected plan: <strong className="text-ink">{plan ? `${plan.name}, ${formatZar(plan.priceZar)} ${plan.billing === "monthly" ? "per month" : "per year"}` : "none yet"}</strong></li>
          <li>Member fares apply to <strong className="text-ink">flights only</strong>. BruPass does not discount BruFly Stays.</li>
          <li>Cancellation: {plan?.billing === "annual" ? "annual plans are not refundable once a member fare has been booked." : "cancel any time before your next billing date; access continues to the end of the paid month."}</li>
          <li>In this preview no payment is taken. You'll receive payment instructions and can only be billed after you approve them.</li>
        </ul>
        <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-ink-2">
          <input type="checkbox" className="mt-0.5 h-5 w-5 accent-[var(--brand-ocean)]" checked={agree} onChange={(e) => setAgree(e.target.checked)} aria-invalid={Boolean(errors.agree)} />
          <span>I've read the plan's price, commitment and cancellation conditions and the <Link href="/terms#brupass" className="link" target="_blank">BruPass terms</Link>.</span>
        </label>
        {errors.agree && <p className="error-text">{errors.agree}</p>}
        {state === "error" && <p className="error-text" role="alert">We couldn't send your request. Please try again.</p>}
        <button type="submit" className="btn btn-primary btn-lg mt-4 w-full" disabled={state === "submitting"}>
          {state === "submitting" ? "Sending…" : "Request BruPass membership"}
        </button>
      </aside>
    </form>
  );
}
