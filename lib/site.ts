/**
 * Canonical site metadata, used by the layout, robots, and sitemap.
 *
 * SITE_URL drives Open Graph / canonical / sitemap URLs. Override it at build
 * time with NEXT_PUBLIC_SITE_URL once a custom domain is attached (set it in the
 * Cloudflare build environment).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://edianalyst.com"
).replace(/\/$/, "");

export const SITE_NAME = "EDIAnalyst";

export const SITE_TAGLINE = "Healthcare EDI, made readable";

export const SITE_COMPANY = "Lactus Tech";

export const CONTACT_EMAIL = "support@edianalyst.com";

/** Year the project went live — used for the © range in the footer. */
export const SITE_LAUNCH_YEAR = 2026;

/**
 * Pages linked from the site footer. Order is the order they render. Each slug
 * maps to a static route under app/<slug>/page.tsx.
 */
export const FOOTER_PAGES: { slug: string; label: string }[] = [
  { slug: "blog", label: "Blog" },
  { slug: "reference", label: "Reference" },
  { slug: "about", label: "About Us" },
  { slug: "contact", label: "Contact Us" },
  { slug: "privacy", label: "Privacy" },
  { slug: "terms", label: "Terms of Use" },
  { slug: "disclaimer", label: "Disclaimer" },
];

export const SITE_DESCRIPTION =
  "Free in-browser viewer for healthcare X12 EDI — 835, 837, 834, 270/271, 276/277, 999, 820. " +
  "Denials decoded into plain English. No file ever leaves your device.";

export const SITE_KEYWORDS = [
  "EDI viewer",
  "X12 EDI",
  "healthcare EDI",
  "835 remittance viewer",
  "ERA viewer",
  "837 claim viewer",
  "834 enrollment",
  "270 271 eligibility",
  "276 277 claim status",
  "999 acknowledgment",
  "EDI to Excel",
  "denial decoder",
  "HIPAA EDI",
  "CARC RARC",
];
