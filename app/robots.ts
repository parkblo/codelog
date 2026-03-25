import type { MetadataRoute } from "next";

import { PROTECTED_ROUTE_PREFIXES } from "@/shared/lib/auth";
import { CODELOG_BASE_URL } from "@/shared/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/post/"],
      disallow: ["/api/", "/auth/callback", ...PROTECTED_ROUTE_PREFIXES],
    },
    sitemap: `${CODELOG_BASE_URL}/sitemap.xml`,
  };
}
