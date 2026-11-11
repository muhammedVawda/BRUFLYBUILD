import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BruFly",
    short_name: "BruFly",
    description: "Flights and stays across South Africa, checked by real people.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#0b2a4a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
