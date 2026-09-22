// Captures desktop and mobile screenshots of the key pages for the report.
import { chromium, devices } from "@playwright/test";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const pages = [
  ["home", "/"],
  ["stays-guests2", "/stays?guests=2"],
  ["stays-durban-dates", "/stays?destination=Durban&checkin=2026-10-12&checkout=2026-10-14&adults=2"],
  ["stays-map", "/stays?destination=Cape%20Town&adults=2&view=map"],
  ["property", "/stays/seapoint-promenade-apartment?checkin=2026-10-08&checkout=2026-10-11&adults=2"],
  ["checkout", "/stays/seapoint-promenade-apartment/book?checkin=2026-10-08&checkout=2026-10-11&adults=2"],
  ["flights-results", "/flights?from=JNB&to=CPT&depart=2026-10-08&return=2026-10-11&passengers=2"],
  ["brupass", "/brupass"],
  ["host", "/host"],
  ["help", "/help"],
];
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM });
for (const [name, path] of pages) {
  for (const [tag, ctxOpts] of [["desktop", { viewport: { width: 1360, height: 900 } }], ["mobile", { ...devices["Pixel 7"] }]]) {
    const ctx = await browser.newContext(ctxOpts);
    await ctx.addInitScript(() => { try { localStorage.setItem("brufly-consent", "denied"); } catch {} });
    const page = await ctx.newPage();
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `docs/screenshots/${name}-${tag}.png`, fullPage: name !== "stays-map" });
    await ctx.close();
  }
}
await browser.close();
console.log("done");
