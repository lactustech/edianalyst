/**
 * Blog index metadata. One entry per post; the actual prose lives in each
 * post's page under app/blog/<slug>/page.tsx. This file drives the /blog index
 * listing and the sitemap, so adding a post means adding it here too.
 *
 * The programmatic CARC/RARC denial-code reference lives under the 835 page
 * (/edi/835/denial-codes, see lib/denial-codes.ts), not here — but the blog
 * index links to it prominently.
 */
export interface BlogPost {
  slug: string;
  /** Card + H1 title. */
  title: string;
  /** <title> tag (<= ~60 chars where possible). */
  metaTitle: string;
  metaDescription: string;
  /** One-line blurb for the index card. */
  blurb: string;
  /** Short kicker shown above the card title. */
  kicker: string;
  /** ISO publish date — static export can't read request time. */
  published: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-read-an-835-remittance",
    title: "How to Read an 835 Remittance and Find Out Why a Claim Was Denied",
    metaTitle: "How to Read an 835 Remittance — Find Why a Claim Denied",
    metaDescription:
      "A field-by-field walkthrough of an 835 ERA: BPR, TRN, CLP, CAS, and the CARC/RARC codes that explain every adjustment — so you can trace exactly why a claim was denied.",
    blurb:
      "Walk the BPR, TRN, CLP and CAS segments and learn to trace a single claim from charge to denial reason.",
    kicker: "Guide · 835",
    published: "2026-06-16",
  },
  {
    slug: "convert-837-claim-to-excel",
    title: "How to Convert an 837 Claim File to Excel",
    metaTitle: "Convert an 837 Claim File to Excel — Free, In-Browser",
    metaDescription:
      "Turn an 837P or 837I claim file into a clean Excel spreadsheet — one row per claim, diagnoses and service lines decoded. No upload, no install; the file never leaves your browser.",
    blurb:
      "Flatten an 837P or 837I into one row per claim and export it to .xlsx — entirely in your browser, nothing uploaded.",
    kicker: "Guide · 837",
    published: "2026-06-16",
  },
  {
    slug: "834-maintenance-type-codes-ins03",
    title: "834 Maintenance Type Codes (INS03): 001, 021, 024, 025 Explained",
    metaTitle: "834 Maintenance Type Codes (INS03) — 021, 024, 025, 001",
    metaDescription:
      "What the INS03 maintenance type code in an 834 means: 021 add, 024 termination, 025 reinstatement, 001 change, 030 audit — decoded in plain English.",
    blurb:
      "The single INS03 field decides whether a member is added, termed, reinstated or changed. Here's every value, decoded.",
    kicker: "Reference · 834",
    published: "2026-06-16",
  },
  {
    slug: "how-to-read-an-834-enrollment-file",
    title: "How to Read an 834 Enrollment File, Field by Field",
    metaTitle: "How to Read an 834 Enrollment File, Field by Field",
    metaDescription:
      "A field-by-field guide to the 834 benefit enrollment file: INS, REF, NM1, DMG, HD, DTP and COB loops — how to find a member, their coverage, and their effective dates.",
    blurb:
      "From INS to HD and DTP — how to find a member, read their coverage, and pin down effective dates in an 834.",
    kicker: "Guide · 834",
    published: "2026-06-16",
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
