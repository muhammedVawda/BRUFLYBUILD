import type { Airport, FlightRoute } from "@/lib/types";

export const airports: Airport[] = [
  { code: "JNB", city: "Johannesburg", name: "O. R. Tambo International", destination: "johannesburg", lat: -26.1392, lng: 28.246 },
  { code: "HLA", city: "Johannesburg", name: "Lanseria International", destination: "johannesburg", lat: -25.9385, lng: 27.9261 },
  { code: "CPT", city: "Cape Town", name: "Cape Town International", destination: "cape-town", lat: -33.9715, lng: 18.6021 },
  { code: "DUR", city: "Durban", name: "King Shaka International", destination: "durban", lat: -29.6144, lng: 31.1197 },
  { code: "GRJ", city: "George", name: "George Airport", destination: "garden-route", lat: -34.0056, lng: 22.3789 },
  { code: "PLZ", city: "Gqeberha", name: "Chief Dawid Stuurman International", lat: -33.9849, lng: 25.6173 },
  { code: "ELS", city: "East London", name: "King Phalo Airport", lat: -33.0356, lng: 27.8259 },
  { code: "BFN", city: "Bloemfontein", name: "Bram Fischer International", lat: -29.0927, lng: 26.3024 },
  { code: "MQP", city: "Nelspruit", name: "Kruger Mpumalanga International", destination: "kruger", lat: -25.3832, lng: 31.1056 },
];

export function getAirport(code: string | null | undefined): Airport | undefined {
  if (!code) return undefined;
  return airports.find((a) => a.code === code.toUpperCase());
}

/**
 * Routes BruFly can request. `sampleFareFromZar` is a SAMPLE used for the
 * illustrative results page only; a live airline/GDS integration must
 * replace it before fares are shown as bookable.
 */
export const routes: FlightRoute[] = [
  { from: "JNB", to: "CPT", sampleFareFromZar: 1099, durationMin: 130, airlines: ["FlySafair", "LIFT"] },
  { from: "CPT", to: "JNB", sampleFareFromZar: 1149, durationMin: 125, airlines: ["FlySafair", "LIFT"] },
  { from: "JNB", to: "DUR", sampleFareFromZar: 799, durationMin: 70, airlines: ["FlySafair", "LIFT"] },
  { from: "DUR", to: "JNB", sampleFareFromZar: 849, durationMin: 70, airlines: ["FlySafair", "LIFT"] },
  { from: "JNB", to: "GRJ", sampleFareFromZar: 1299, durationMin: 115, airlines: ["FlySafair"] },
  { from: "GRJ", to: "JNB", sampleFareFromZar: 1349, durationMin: 115, airlines: ["FlySafair"] },
  { from: "CPT", to: "DUR", sampleFareFromZar: 1199, durationMin: 130, airlines: ["FlySafair", "LIFT"] },
  { from: "DUR", to: "CPT", sampleFareFromZar: 1249, durationMin: 135, airlines: ["FlySafair", "LIFT"] },
  { from: "JNB", to: "PLZ", sampleFareFromZar: 1049, durationMin: 100, airlines: ["FlySafair"] },
  { from: "PLZ", to: "JNB", sampleFareFromZar: 1099, durationMin: 100, airlines: ["FlySafair"] },
  { from: "JNB", to: "ELS", sampleFareFromZar: 1199, durationMin: 90, airlines: ["FlySafair"] },
  { from: "ELS", to: "JNB", sampleFareFromZar: 1249, durationMin: 90, airlines: ["FlySafair"] },
  { from: "HLA", to: "CPT", sampleFareFromZar: 1159, durationMin: 130, airlines: ["FlySafair"] },
  { from: "CPT", to: "HLA", sampleFareFromZar: 1199, durationMin: 125, airlines: ["FlySafair"] },
  { from: "HLA", to: "DUR", sampleFareFromZar: 849, durationMin: 70, airlines: ["FlySafair"] },
  { from: "DUR", to: "HLA", sampleFareFromZar: 899, durationMin: 70, airlines: ["FlySafair"] },
  { from: "JNB", to: "MQP", sampleFareFromZar: 1399, durationMin: 55, airlines: ["LIFT"] },
  { from: "MQP", to: "JNB", sampleFareFromZar: 1449, durationMin: 55, airlines: ["LIFT"] },
  { from: "CPT", to: "BFN", sampleFareFromZar: 1299, durationMin: 95, airlines: ["FlySafair"] },
  { from: "BFN", to: "CPT", sampleFareFromZar: 1349, durationMin: 95, airlines: ["FlySafair"] },
];

export function findRoute(from: string, to: string): FlightRoute | undefined {
  return routes.find((r) => r.from === from.toUpperCase() && r.to === to.toUpperCase());
}

export const popularRoutes: [string, string][] = [
  ["JNB", "CPT"],
  ["JNB", "DUR"],
  ["CPT", "DUR"],
  ["JNB", "GRJ"],
];
