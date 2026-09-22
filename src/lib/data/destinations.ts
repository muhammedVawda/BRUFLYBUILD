import type { Destination } from "@/lib/types";

export const destinations: Destination[] = [
  {
    slug: "cape-town",
    name: "Cape Town",
    province: "Western Cape",
    intro: "Table Mountain, two oceans and neighbourhoods that each feel like a different holiday.",
    body: [
      "Cape Town rewards a slow pace. Stay in the City Bowl for restaurants and museums within walking distance, Sea Point or Camps Bay for the promenade and sunsets, or the southern suburbs for a quieter base near Kirstenbosch and the winelands.",
      "Summer (December to March) is warm and windy, with long light evenings. Autumn is the locals' favourite: still, clear days and lower rates. Winter brings rain, green mountains and the best value on stays.",
      "Most stays are under 30 minutes from Cape Town International Airport. FlySafair and LIFT both fly Johannesburg–Cape Town many times a day, so a Friday-to-Sunday break is realistic.",
    ],
    scene: "mountain",
    lat: -33.9249,
    lng: 18.4241,
    airport: "CPT",
    aliases: ["cape town", "kaapstad", "cpt", "camps bay", "sea point", "city bowl"],
  },
  {
    slug: "durban",
    name: "Durban",
    province: "KwaZulu-Natal",
    intro: "Warm Indian Ocean water all year, the Golden Mile and the best bunny chow in the country.",
    body: [
      "Durban is the easy beach break. Umhlanga has the polished hotels and the promenade; the Berea and Morningside are leafier and closer to the city's food scene; the South Coast is where families go for quiet sand and rock pools.",
      "The sea is swimmable in every month. Winter is dry and mild, which is why Gauteng empties into Durban over school holidays. Book early for July and December.",
      "King Shaka International is 35 minutes north of the city and 15 minutes from Umhlanga.",
    ],
    scene: "coast",
    lat: -29.8587,
    lng: 31.0218,
    airport: "DUR",
    aliases: ["durban", "umhlanga", "dur", "ballito", "kzn", "kwazulu-natal"],
  },
  {
    slug: "johannesburg",
    name: "Johannesburg",
    province: "Gauteng",
    intro: "Big-city energy, world-class restaurants and the greenest urban forest you'll ever fly into.",
    body: [
      "Joburg is a city of suburbs. Rosebank and Sandton are the practical choices for business and for the Gautrain; Melville, Parkhurst and Maboneng have the independent restaurants and galleries.",
      "Highveld weather is kind to travellers: dry, sunny winters and warm summers with late-afternoon storms that clear by dinner.",
      "O. R. Tambo International is the country's main hub, with the most flights and the lowest fares to Cape Town, Durban and George.",
    ],
    scene: "city",
    lat: -26.2041,
    lng: 28.0473,
    airport: "JNB",
    aliases: ["johannesburg", "joburg", "jozi", "jhb", "sandton", "rosebank", "gauteng"],
  },
  {
    slug: "garden-route",
    name: "Garden Route",
    province: "Western Cape",
    intro: "Forest, lagoon and coastline from George to Plettenberg Bay, best taken over four or five nights.",
    body: [
      "The Garden Route works as a fly-drive. Fly into George, collect a car and take the N2 east through Wilderness, Sedgefield, Knysna and Plettenberg Bay.",
      "Knysna is the natural base: the lagoon, the Heads and a big choice of guesthouses. Plett has the beaches. Wilderness is for hikers and people who want to hear the sea from bed.",
      "The route is busiest between mid-December and mid-January. Spring and autumn are calm, clear and noticeably cheaper.",
    ],
    scene: "garden",
    lat: -34.0363,
    lng: 23.0471,
    airport: "GRJ",
    aliases: ["garden route", "knysna", "plettenberg bay", "plett", "george", "wilderness", "grj"],
  },
  {
    slug: "kruger",
    name: "Kruger & Lowveld",
    province: "Mpumalanga",
    intro: "Safari lodges, bush camps and the small towns on the edge of the park.",
    body: [
      "Hazyview and White River are the sensible bases for self-drive safaris in the southern Kruger, with lodges and cottages 15 to 40 minutes from the gates.",
      "Winter (May to September) is the best game-viewing season: dry, cool mornings and thin bush. Summer is green, hot and quieter, with lower rates and dramatic skies.",
      "Fly into Kruger Mpumalanga International (Nelspruit) or drive four hours from Johannesburg.",
    ],
    scene: "bush",
    lat: -25.0333,
    lng: 31.1333,
    airport: "MQP",
    aliases: ["kruger", "hazyview", "nelspruit", "mbombela", "white river", "lowveld", "mpumalanga", "mqp"],
  },
  {
    slug: "stellenbosch",
    name: "Stellenbosch & Winelands",
    province: "Western Cape",
    intro: "Oak-lined streets, historic farms and the country's most relaxed weekend.",
    body: [
      "Stellenbosch and Franschhoek are 45 minutes from Cape Town International, close enough to combine with a city stay but with a completely different pace.",
      "Guesthouses and cottages on working farms are the thing to book here. Most include breakfast; many sit within walking distance of a tasting room.",
      "Harvest season (February to April) is the most atmospheric. Winter is fireside weather with the best rates of the year.",
    ],
    scene: "winelands",
    lat: -33.9321,
    lng: 18.8602,
    airport: "CPT",
    aliases: ["stellenbosch", "winelands", "franschhoek", "paarl", "wine"],
  },
];

export function getDestination(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}

/** Suggests destinations for a free-text query. Backed by seed data, not invented. */
export function suggestDestinations(query: string, limit = 6): Destination[] {
  const q = query.trim().toLowerCase();
  if (!q) return destinations.slice(0, limit);
  const scored = destinations
    .map((d) => {
      const hay = [d.name, d.province, ...d.aliases].map((s) => s.toLowerCase());
      let score = 0;
      for (const h of hay) {
        if (h === q) score = Math.max(score, 3);
        else if (h.startsWith(q)) score = Math.max(score, 2);
        else if (h.includes(q)) score = Math.max(score, 1);
      }
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.d);
}

/** Resolves free text to a destination, or null. */
export function resolveDestination(input: string | null | undefined): Destination | null {
  if (!input) return null;
  const q = input.trim().toLowerCase();
  const exact = destinations.find((d) => d.slug === q || d.name.toLowerCase() === q);
  if (exact) return exact;
  const alias = destinations.find((d) => d.aliases.includes(q));
  if (alias) return alias;
  const partial = suggestDestinations(q, 1);
  return partial[0] ?? null;
}
