/**
 * SEO helpers shared by the blog and reference pages.
 *
 * Two things Next.js won't do for us with this site's setup:
 *   1. When a page exports its own `openGraph`, the file-based OG image and the
 *      siteName/locale are NOT inherited — they have to be set explicitly. `og()`
 *      builds a complete, consistent Open Graph block so every page keeps its
 *      social card.
 *   2. Structured data (JSON-LD) is page-specific. `breadcrumbLd()` and
 *      `articleLd()` produce schema.org objects rendered via <JsonLd>.
 */
import type { Metadata } from "next";
import { AUTHOR_NAME, AUTHOR_TITLE, SITE_COMPANY, SITE_NAME, SITE_URL } from "./site";

/** The site's default social card (app/opengraph-image.png). */
const OG_IMAGE = "/opengraph-image.png";

/** Build a complete Open Graph block, keeping the image + siteName Next drops. */
export function og(opts: {
  title: string;
  description: string;
  path: string;
  type?: "article" | "website";
}): Metadata["openGraph"] {
  return {
    title: `${opts.title} · ${SITE_NAME}`,
    description: opts.description,
    url: opts.path,
    siteName: SITE_NAME,
    locale: "en_US",
    type: opts.type ?? "article",
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  };
}

/** Twitter card block — title/description only (image inherits from layout default). */
export function twitter(opts: { title: string; description: string }): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title: `${opts.title} · ${SITE_NAME}`,
    description: opts.description,
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

export function articleLd(opts: { title: string; description: string; path: string; published: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    datePublished: opts.published,
    dateModified: opts.published,
    inLanguage: "en-US",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${opts.path}` },
    author: { "@type": "Person", name: AUTHOR_NAME, jobTitle: AUTHOR_TITLE },
    publisher: { "@type": "Organization", name: SITE_COMPANY, url: SITE_URL },
  };
}

/** Truncate at a word boundary without an ellipsis — for tidy <title>/description. */
export function clamp(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  let cut = t.slice(0, max);
  // Only back up if we landed mid-word; break on a space or a slash (for
  // slash-lists like "Precertification/authorization/notification").
  if (/[\w/]/.test(t[max] ?? "")) {
    const i = Math.max(cut.lastIndexOf(" "), cut.lastIndexOf("/"));
    if (i > max * 0.5) cut = cut.slice(0, i);
  }
  return cut.replace(/[\s,;:.–—/-]+$/, "");
}
