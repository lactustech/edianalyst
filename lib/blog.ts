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
  {
    slug: "convert-834-to-member-roster-excel",
    title: "Convert an 834 to a Clean Member Roster in Excel",
    metaTitle: "Convert an 834 to a Member Roster in Excel — Free",
    metaDescription:
      "Turn an 834 enrollment file into a clean Excel member roster — one row per member with ID, demographics, coverage, and dates. Parsed in your browser, no upload.",
    blurb:
      "Flatten an 834's INS loops into one row per member and export the roster to Excel — entirely in your browser.",
    kicker: "Guide · 834",
    published: "2026-06-16",
  },
  {
    slug: "diff-two-834-files",
    title: "How to Diff Two 834 Files and Catch Every Add, Term, and Change",
    metaTitle: "Diff Two 834 Files — Catch Every Add, Term & Change",
    metaDescription:
      "Compare this week's 834 against last week's and see exactly who was added, terminated, or changed — with field-level before and after. No upload.",
    blurb:
      "Compare two enrollment files and see precisely who joined, left, or changed — field by field.",
    kicker: "Guide · 834",
    published: "2026-06-16",
  },
  {
    slug: "read-a-999-why-837-rejected",
    title: "How to Read a 999 and Decode Exactly Why Your 837 Rejected",
    metaTitle: "Read a 999 — Decode Exactly Why Your 837 Rejected",
    metaDescription:
      "Walk a 999 acknowledgment from AK9 down to IK3 and IK4 — and decode the IK304/IK403 codes that pinpoint which segment and field made your 837 reject.",
    blurb:
      "Trace a 999 from the group result down to the exact segment and element that failed your 837.",
    kicker: "Guide · 999",
    published: "2026-06-16",
  },
  {
    slug: "find-834-termination-dates-dtp357",
    title: "Finding Termination Dates in an 834 (DTP*357) in Seconds",
    metaTitle: "Find 834 Termination Dates (DTP*357) in Seconds",
    metaDescription:
      "Where coverage-end dates live in an 834: the DTP*357 eligibility-end and DTP*349 benefit-end segments — and how to find every termination in a file fast.",
    blurb:
      "Coverage-end dates hide in DTP*357 and DTP*349 — here's how to surface every termination at a glance.",
    kicker: "Guide · 834",
    published: "2026-06-16",
  },
  {
    slug: "reading-837p-loops-and-segments",
    title: "Reading an 837P: Which Loops and Segments Actually Matter",
    metaTitle: "Reading an 837P — The Loops & Segments That Matter",
    metaDescription:
      "An 837P has dozens of segments, but only a handful decide whether a claim pays. A practical tour of the HL loops, CLM, HI, and SV1 segments that matter.",
    blurb:
      "Skip the envelope noise — the HL hierarchy, CLM, HI, and SV1 segments that actually decide a professional claim.",
    kicker: "Guide · 837",
    published: "2026-06-16",
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
