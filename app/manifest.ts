import type { MetadataRoute } from "next";

import { CODELOG_DEFAULT_DESCRIPTION } from "@/shared/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CodeLog",
    short_name: "CodeLog",
    description: CODELOG_DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
