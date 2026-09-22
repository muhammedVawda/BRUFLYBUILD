/** Rand formatting. Amounts are integers in rand (no cents) unless stated. */
export function formatZar(amount: number, opts: { cents?: boolean } = {}): string {
  const rounded = opts.cents ? amount : Math.round(amount);
  const parts = rounded.toFixed(opts.cents ? 2 : 0).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const sign = rounded < 0 ? "−" : "";
  return `${sign}R${parts.join(",").replace("-", "")}`;
}
