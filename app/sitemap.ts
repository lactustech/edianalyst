import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "../lib/blog";
import { codeSlug, DENIAL_CODES } from "../lib/denial-codes";
import { REFERENCE } from "../lib/reference";
import { FOOTER_PAGES, SITE_URL } from "../lib/site";
import { ACK_CODES, codeSlug as ackSlug } from "../lib/codes-999";
import { codeSlug as enrollSlug, ENROLL_CODES } from "../lib/enrollment-codes";
import { codeSlug as serviceSlug, SERVICE_TYPES } from "../lib/service-type-codes";
import { codeSlug as statusSlug, STATUS_CODES } from "../lib/status-codes";

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
    { url: `${SITE_URL}/edi/277/status-codes`, changeFrequency: "monthly" as const, priority: 0.7 },
    ...STATUS_CODES.map((c) => ({
      url: `${SITE_URL}/edi/277/status-codes/${statusSlug(c)}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    { url: `${SITE_URL}/edi/270/service-type-codes`, changeFrequency: "monthly" as const, priority: 0.7 },
    ...SERVICE_TYPES.map((c) => ({
      url: `${SITE_URL}/edi/270/service-type-codes/${serviceSlug(c)}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    { url: `${SITE_URL}/edi/834/enrollment-codes`, changeFrequency: "monthly" as const, priority: 0.7 },
    ...ENROLL_CODES.map((c) => ({
      url: `${SITE_URL}/edi/834/enrollment-codes/${enrollSlug(c)}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    { url: `${SITE_URL}/edi/999/error-codes`, changeFrequency: "monthly" as const, priority: 0.7 },
    ...ACK_CODES.map((c) => ({
      url: `${SITE_URL}/edi/999/error-codes/${ackSlug(c)}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...FOOTER_PAGES.map((p) => ({
      url: `${SITE_URL}/${p.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
