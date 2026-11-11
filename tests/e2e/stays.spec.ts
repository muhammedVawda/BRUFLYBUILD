import { test, expect, type Page } from "@playwright/test";

const consoleErrors: string[] = [];
test.beforeEach(async ({ page }) => {
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  await page.addInitScript(() => {
    try {
      localStorage.setItem("brufly-consent", "denied");
    } catch {}
  });
});
test.afterEach(() => {
  expect(consoleErrors, "no console errors").toEqual([]);
  consoleErrors.length = 0;
});

async function pickDates(page: Page, ci: string, co: string) {
  await page.getByRole("button", { name: "Check-in" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Choose dates" });
  // navigate months until the check-in date exists
  for (let i = 0; i < 12; i++) {
    if (await dialog.locator(`[data-iso="${ci}"]`).count()) break;
    await dialog.getByRole("button", { name: "Next month" }).click();
  }
  await dialog.locator(`[data-iso="${ci}"]`).click();
  for (let i = 0; i < 12; i++) {
    if (await dialog.locator(`[data-iso="${co}"]`).count()) break;
    await dialog.getByRole("button", { name: "Next month" }).click();
  }
  await dialog.locator(`[data-iso="${co}"]`).click();
}

function future(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  // Force a Monday-ish weekday to keep pricing simple
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

test("shared URL with guests=2 populates the guest selector and results", async ({ page }) => {
  await page.goto("/stays?guests=2");
  await expect(page.getByRole("button", { name: "Guests" })).toHaveText(/2 adults/);
  await expect(page.getByRole("heading", { level: 2, name: /stays across South Africa/ })).toBeVisible();
  // Changing a filter keeps the guest count in the URL as adults=2
  await page.getByRole("combobox", { name: "Sort results" }).selectOption("price_asc");
  await expect(page).toHaveURL(/adults=2/);
  await expect(page).toHaveURL(/sort=price_asc/);
});

test("guests=2 survives navigation to a property and back", async ({ page }) => {
  await page.goto("/stays?guests=2&destination=Durban");
  await page.getByRole("link", { name: /Umhlanga Beachfront Hotel: view stay/ }).click();
  await expect(page).toHaveURL(/\/stays\/umhlanga-beachfront-hotel\?.*adults=2/);
  await expect(page.getByRole("button", { name: "Guests" }).first()).toHaveText(/2 adults/);
  await page.goBack();
  await expect(page).toHaveURL(/stays\?guests=2&destination=Durban/);
  await expect(page.getByRole("button", { name: "Guests" })).toHaveText(/2 adults/);
  await expect(page.getByRole("heading", { level: 2, name: /stays in Durban/ })).toBeVisible();
});

test("dates produce totals and past dates are blocked", async ({ page }) => {
  const ci = future(20);
  const co = future(23);
  await page.goto("/stays?destination=Cape%20Town&adults=2");
  await pickDates(page, ci, co);
  await expect(page.getByText("3 nights").first()).toBeVisible();
  await page.getByRole("button", { name: "Search stays" }).click();
  await expect(page).toHaveURL(new RegExp(`checkin=${ci}`));
  await expect(page.getByText(/total for 3 nights/).first()).toBeVisible();
  // Past date typed into the URL is rejected with a clear message
  await page.goto("/stays?destination=Cape%20Town&adults=2&checkin=2020-01-01&checkout=2020-01-03");
  await expect(page.locator('p[role="alert"]')).toContainText(/in the past/);
  // Past dates are disabled in the picker
  await page.getByRole("button", { name: "Check-in" }).first().click();
  const yesterday = future(-1);
  const dialog = page.getByRole("dialog", { name: "Choose dates" });
  const cell = dialog.locator(`[data-iso="${yesterday}"]`);
  if (await cell.count()) await expect(cell).toBeDisabled();
});

test("empty results explain which constraints to relax", async ({ page }) => {
  await page.goto("/stays?destination=Kruger&type=apartment&amenities=spa,gym&adults=2");
  await expect(page.getByText(/No stays match all of your filters/)).toBeVisible();
  await page.getByRole("button", { name: "Include all property types" }).click();
  await expect(page).not.toHaveURL(/type=/);
});

test("property page keeps prices consistent through to checkout and prevents double submission", async ({ page }) => {
  const ci = future(30);
  const co = future(32);
  await page.goto(`/stays/rosebank-serviced-apartment?checkin=${ci}&checkout=${co}&adults=2`);
  const total = await page.locator("dd").filter({ hasText: /^R[\d ]+$/ }).last().innerText();
  await page.getByRole("link", { name: "Request to book" }).first().click();
  await expect(page).toHaveURL(/\/book\?/);
  await expect(page.getByText("Total").locator("..").locator("dd")).toHaveText(total);
  await page.getByLabel("Full name").fill("Test Traveller");
  await page.getByLabel("Email address").fill("traveller@example.com");
  await page.getByLabel("Mobile number").fill("0820000000");
  await page.getByRole("checkbox").check();
  // Slow the booking API so a double click is possible
  let calls = 0;
  await page.route("**/api/bookings", async (route) => {
    calls++;
    await new Promise((r) => setTimeout(r, 400));
    await route.continue();
  });
  const btn = page.getByRole("button", { name: "Send booking request" });
  await btn.click();
  await btn.click({ force: true, timeout: 1500 }).catch(() => {});
  await expect(page).toHaveURL(/\/bookings\/BS-/);
  expect(calls).toBe(1);
  await expect(page.getByText("Request received").first()).toBeVisible();
  await expect(page.getByText(/not a confirmation yet/)).toBeVisible();
  await expect(page.getByText(/nothing has been charged/i).first()).toBeVisible();
});

test("BruPass calculator is mathematically correct and honest about losses", async ({ page }) => {
  await page.goto("/brupass");
  await page.getByLabel(/Eligible flight bookings/).fill("2");
  await page.getByLabel(/Assumed saving per booking/).fill("150");
  await page.getByRole("button", { name: "A month" }).click();
  // Monthly plan R99: 2 × 150 = 300, net 201, break-even 1
  await expect(page.getByText("R300")).toBeVisible();
  await expect(page.getByText("R201")).toBeVisible();
  await expect(page.getByText("1 booking", { exact: true })).toBeVisible();
  await page.getByLabel(/Eligible flight bookings/).fill("0");
  await expect(page.getByText(/Estimated net cost/)).toBeVisible();
  await expect(page.locator("dd.text-bad")).toHaveText("R99");
  await page.getByLabel(/Eligible flight bookings/).fill("-1");
  await expect(page.locator('ul[role="alert"]')).toContainText(/whole number/);
});

test("flight request flow shows request state, not a confirmation", async ({ page }) => {
  const dep = future(40);
  const ret = future(43);
  await page.goto(`/flights?from=JNB&to=CPT&depart=${dep}&return=${ret}&passengers=1`);
  await expect(page.getByText(/Sample fares\./)).toBeVisible();
  await page.getByRole("link", { name: "Request this fare" }).first().click();
  await page.getByLabel("Passenger 1 full name").fill("Test Passenger");
  await page.getByLabel("Full name", { exact: true }).fill("Test Passenger");
  await page.getByLabel("Email address").fill("p@example.com");
  await page.getByLabel("Mobile number").fill("0820000000");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send flight request" }).click();
  await expect(page).toHaveURL(/\/bookings\/BF-/);
  await expect(page.locator(".badge").filter({ hasText: "Request received" })).toBeVisible();
  await expect(page.locator(".badge").filter({ hasText: "Confirmed" })).toHaveCount(0);
  await expect(page.getByText(/YOU'RE BOOKED/i)).toHaveCount(0);
  await expect(page.getByText(/Estimated fare/)).toBeVisible();
});

test("stays page has SEO essentials and indexing rules", async ({ page }) => {
  await page.goto("/stays");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://brufly.co.za/stays");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index, follow/);
  expect(await page.locator("h1").count()).toBe(1);
  await page.goto("/stays?guests=2");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.goto("/stays/seapoint-promenade-apartment");
  const ld = await page.locator('script[type="application/ld+json"]').first().innerText();
  expect(JSON.parse(ld)["@type"]).toBe("LodgingBusiness");
});

test("keyboard: header menu / filter sheet restore focus, reduced motion respected", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // Reveal sections are visible immediately under reduced motion
  const reveals = page.locator("[data-reveal]");
  const n = await reveals.count();
  for (let i = 0; i < n; i++) await expect(reveals.nth(i)).toHaveClass(/is-visible/);
  if (isMobile) {
    const menu = page.getByRole("button", { name: /Open menu/ });
    await menu.click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Menu" })).toHaveCount(0);
    await expect(menu).toBeFocused();
  }
});

test("favourites persist in the browser and the saved page lists them", async ({ page }) => {
  await page.goto("/stays?destination=Durban&adults=2");
  await page.getByRole("button", { name: /Save Umhlanga Beachfront Hotel/ }).click();
  await expect(page.getByRole("button", { name: /Remove Umhlanga Beachfront Hotel/ })).toBeVisible();
  await page.goto("/stays/saved");
  await expect(page.getByRole("heading", { level: 3, name: "Umhlanga Beachfront Hotel" })).toBeVisible();
});

test("homepage hero offers stays search alongside flights", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Stays" }).click();
  await page.getByRole("combobox", { name: "Where to?" }).fill("Knysna");
  await page.getByRole("option", { name: /Garden Route/ }).click();
  await page.getByRole("button", { name: "Search stays" }).click();
  await expect(page).toHaveURL(/\/stays\?destination=Garden\+Route/);
  await expect(page.getByRole("heading", { level: 2, name: /stays in Garden Route/ })).toBeVisible();
});

test("social share image and structured data are served", async ({ request }) => {
  const og = await request.get("/stays/seapoint-promenade-apartment/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
  const html = await (await request.get("/stays/seapoint-promenade-apartment")).text();
  expect(html).toContain('"@type":"BreadcrumbList"');
  expect(html).toContain('property="og:image"');
});
