import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "../lib/blog";
import { codeSlug, DENIAL_CODES } from "../lib/denial-codes";
import { REFERENCE } from "../lib/reference";
import { FOOTER_PAGES, SITE_URL } from "../lib/site";

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
    ...BLOG_POSTS.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/edi/835/denial-codes`, changeFrequency: "monthly" as const, priority: 0.7 },
    ...DENIAL_CODES.map((c) => ({
      url: `${SITE_URL}/edi/835/denial-codes/${codeSlug(c)}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    // Top-level info/legal pages only; deeper footer slugs (e.g. the denial-code
    // reference) are already emitted by their own section above.
    ...FOOTER_PAGES.filter((p) => !p.slug.includes("/")).map((p) => ({
      url: `${SITE_URL}/${p.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
