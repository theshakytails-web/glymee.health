import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Glymee | Diabetes Health Management Platform",
    short_name: "Glymee",
    description:
      "Glymee helps you understand the root cause of your diabetes with personalized consultations, continuous glucose monitoring insights, and data-driven health plans.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#00647c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
