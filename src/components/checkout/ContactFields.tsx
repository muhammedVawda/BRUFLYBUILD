"use client";

export interface Contact {
  name: string;
  email: string;
  phone: string;
}

export function validateContact(c: Contact): Partial<Record<keyof Contact, string>> {
  const e: Partial<Record<keyof Contact, string>> = {};
  if (c.name.trim().length < 2) e.name = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) e.email = "Enter a valid email address. Your confirmation is sent here.";
  if (c.phone.replace(/\D/g, "").length < 9) e.phone = "Enter a phone number we can reach you on, e.g. 082 000 0000.";
  return e;
}

export function ContactFields({ value, onChange, errors, disabled }: { value: Contact; onChange: (c: Contact) => void; errors: Partial<Record<keyof Contact, string>>; disabled?: boolean }) {
  return (
    <fieldset className="grid gap-4 sm:grid-cols-2" disabled={disabled}>
      <legend className="mb-2 font-sans text-lg font-bold">Your details</legend>
      <div className="sm:col-span-2">
        <label htmlFor="c-name" className="label">Full name</label>
        <input id="c-name" className="field" autoComplete="name" value={value.name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "c-name-err" : undefined} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        {errors.name && <p id="c-name-err" className="error-text">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="c-email" className="label">Email address</label>
        <input id="c-email" type="email" inputMode="email" className="field" autoComplete="email" value={value.email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "c-email-err" : undefined} onChange={(e) => onChange({ ...value, email: e.target.value })} />
        {errors.email && <p id="c-email-err" className="error-text">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="c-phone" className="label">Mobile number</label>
        <input id="c-phone" type="tel" inputMode="tel" className="field" autoComplete="tel" value={value.phone} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "c-phone-err" : undefined} onChange={(e) => onChange({ ...value, phone: e.target.value })} />
        {errors.phone && <p id="c-phone-err" className="error-text">{errors.phone}</p>}
      </div>
    </fieldset>
  );
}
