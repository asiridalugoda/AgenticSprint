import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Agentic Sprint",
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: "#faf9f6",
    theme_color: "#faf9f6",
    icons: [
      { src: "/icon1", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/icon0.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
