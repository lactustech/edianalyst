import type { MetadataRoute } from "next";
import { REFERENCE } from "../lib/reference";
import { SITE_URL } from "../lib/site";

// Generated at build into out/sitemap.xml (works with output: 'export').
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    ...REFERENCE.map((r) => ({
      url: `${SITE_URL}/edi/${r.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
