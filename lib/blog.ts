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
  {
    slug: "837p-vs-837i",
    title: "837P vs 837I: Professional vs Institutional Claims, Explained",
    metaTitle: "837P vs 837I — Professional vs Institutional Claims",
    metaDescription:
      "837P vs 837I: how the professional (CMS-1500) and institutional (UB-04) claims differ — loops, segments, revenue codes — and how to tell which you're holding.",
    blurb:
      "Professional (CMS-1500) vs institutional (UB-04) claims — the loop, segment, and coding differences, side by side.",
    kicker: "Compare · 837",
    published: "2026-06-16",
  },
  {
    slug: "834-vs-820",
    title: "834 vs 820: Enrollment vs Premium Payment",
    metaTitle: "834 vs 820 — Enrollment vs Premium Payment",
    metaDescription:
      "834 vs 820: the enrollment file says who's covered, the premium payment says who paid. How they pair, how to reconcile them, and how the two differ.",
    blurb:
      "One file says who's enrolled, the other says who paid — how the 834 and 820 pair and reconcile.",
    kicker: "Compare · 834 / 820",
    published: "2026-06-16",
  },
  {
    slug: "835-vs-837",
    title: "835 vs 837: How the Claim and the Payment Connect",
    metaTitle: "835 vs 837 — How the Claim and Payment Connect",
    metaDescription:
      "835 vs 837: the 837 is the claim going out, the 835 is the payment coming back. The claim lifecycle, how to match an 835 to its 837, and how the two differ.",
    blurb:
      "The 837 is the claim out; the 835 is the payment back. How to match one to the other, and how they differ.",
    kicker: "Compare · 835 / 837",
    published: "2026-06-16",
  },
  {
    slug: "999-vs-997-vs-ta1",
    title: "999 vs 997 vs TA1: Which Acknowledgment Is Which",
    metaTitle: "999 vs 997 vs TA1 — EDI Acknowledgments Explained",
    metaDescription:
      "999 vs 997 vs TA1: the TA1 acks the envelope; the 997 and 999 ack the functional group. What each accepts or rejects, and why 5010 mandates the 999.",
    blurb:
      "TA1, 997, 999 — which acknowledgment checks what, and why 5010 moved to the 999.",
    kicker: "Compare · Acks",
    published: "2026-06-16",
  },
  {
    slug: "270-271-vs-276-277",
    title: "270/271 vs 276/277: Eligibility vs Claim Status",
    metaTitle: "270/271 vs 276/277 — Eligibility vs Claim Status",
    metaDescription:
      "270/271 vs 276/277: eligibility inquiry/response vs claim status inquiry/response. How the two request/response pairs work, and when each fires in the workflow.",
    blurb:
      "Eligibility (270/271) vs claim status (276/277) — the two request/response pairs, and when each fires.",
    kicker: "Compare · 270 / 276",
    published: "2026-06-16",
  },
  {
    slug: "anatomy-of-an-x12-file",
    title: "Anatomy of an X12 File: The ISA/GS/ST Envelope Explained",
    metaTitle: "Anatomy of an X12 File — the ISA/GS/ST Envelope",
    metaDescription:
      "How an X12 EDI file is built: the ISA/IEA, GS/GE, and ST/SE envelope, delimiters, control numbers, and a fully labeled example you can read top to bottom.",
    blurb:
      "The ISA/GS/ST envelope, delimiters, and control numbers — how an X12 file is built, with a labeled example.",
    kicker: "Guide · X12",
    published: "2026-06-16",
  },
  {
    slug: "x12-vs-5010-vs-7030",
    title: "X12 vs 5010 vs 7030: EDI Standard Versions, Demystified",
    metaTitle: "X12 vs 5010 vs 7030 — EDI Versions Demystified",
    metaDescription:
      "X12 is the standard; 5010 and 7030 are versions. The 4010-to-5010 HIPAA mandate, what 5010 changed, where 7030 stands, and where the version lives in a file.",
    blurb:
      "X12 is the standard; 5010 and 7030 are editions. The HIPAA mandate, what changed, and what you'll see in production.",
    kicker: "Guide · X12",
    published: "2026-06-16",
  },
  {
    slug: "what-is-an-837-claim-file",
    title: "What Is an 837 Claim File? A Healthcare Analyst's Primer",
    metaTitle: "What Is an 837 Claim File? An Analyst's Primer",
    metaDescription:
      "What an 837 healthcare claim file is and why it exists: the claim lifecycle, the P/I/D variants, the key loops and segments, and how an 837 becomes an 835.",
    blurb:
      "What the 837 is, why it exists, its P/I/D variants, the key loops, and how it becomes an 835 — a primer.",
    kicker: "Primer · 837",
    published: "2026-06-16",
  },
  {
    slug: "x12-segments-cheat-sheet",
    title: "Common X12 Segments Cheat Sheet: INS, NM1, CLM, DTP, REF, HD",
    metaTitle: "X12 Segments Cheat Sheet — INS, NM1, CLM, DTP, REF, HD",
    metaDescription:
      "A scannable cheat sheet of the most-used X12 EDI segments across 834, 835, and 837 — plain-English meaning, common qualifiers, and a one-line example for each.",
    blurb:
      "A scannable reference to the segments you hit most across 834/835/837 — meaning, qualifiers, and examples.",
    kicker: "Cheat sheet · X12",
    published: "2026-06-16",
  },
  {
    slug: "edi-notepad-alternative",
    title: "The Best EDI Notepad Alternative for Analysts",
    metaTitle: "The Best EDI Notepad Alternative for Analysts",
    metaDescription:
      "Looking for an EDI Notepad alternative? A browser-based X12 viewer for analysts: no install, no PHI upload, auto-detection, and plain-English validation.",
    blurb:
      "Looking to replace EDI Notepad? A browser-based X12 viewer — no install, no upload, plain-English validation.",
    kicker: "Guide · Tools",
    published: "2026-06-16",
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
