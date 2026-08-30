import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pika Repo",
    short_name: "Pika Repo",
    description: "Favourite apps, GitHub repositories and Cloudflare links.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f7fc",
    theme_color: "#7950c6",
    icons: [
      {
        src: "/app-icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
