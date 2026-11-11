import { chromium, devices } from "@playwright/test";
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM });
for (const [tag, opts] of [["desktop", { viewport: { width: 1440, height: 900 } }], ["mobile", { ...devices["Pixel 7"] }]]) {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(() => { try { localStorage.setItem("brufly-consent", "denied"); } catch {} });
  const page = await ctx.newPage();
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
  await page.waitForTimeout(3800);
  await page.screenshot({ path: `docs/screenshots/home-fold-${tag}.png` });
  await page.goto("http://127.0.0.1:3100/destinations/cape-town", { waitUntil: "networkidle" });
  await page.screenshot({ path: `docs/screenshots/destination-${tag}.png`, fullPage: tag === "mobile" ? false : true });
  await ctx.close();
}
await browser.close();
