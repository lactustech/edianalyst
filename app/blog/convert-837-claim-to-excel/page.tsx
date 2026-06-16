import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("convert-837-claim-to-excel")!;

export const metadata: Metadata = {
  title: post.metaTitle,
  description: post.metaDescription,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: og({ title: post.metaTitle, description: post.metaDescription, path: `/blog/${post.slug}` }),
  twitter: twitter({ title: post.metaTitle, description: post.metaDescription }),
};

function Seg({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-ink">{children}</span>;
}

const FAQ = [
  {
    q: "Does it handle both 837P and 837I?",
    a: "Yes. EDIAnalyst detects the professional (837P) and institutional (837I) variants automatically. The 837P export carries CPT/HCPCS procedures and place of service; the 837I export carries NUBC revenue codes and type of bill.",
  },
  {
    q: "Can I get one row per service line instead of per claim?",
    a: "Yes — pick the view that matches your analysis. One row per claim is best for claim-level totals; one row per service line is best for line-level detail like procedure, units, and charge.",
  },
  {
    q: "Will the file be uploaded to convert it?",
    a: "No. Parsing and the Excel/CSV export both happen in your browser, so the claim file — which contains PHI — never leaves your device. You can confirm it in the Network tab.",
  },
];

export default function Article() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <ArticleShell
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "837 to Excel" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="How to convert an 837 claim file to Excel"
      intro="An 837 is a hierarchy of cryptic segments, not a spreadsheet. Here's how to turn an 837P or 837I into a clean, one-row-per-claim Excel file you can sort, filter, and pivot — without uploading it anywhere."
      published={post.published}
      description={post.metaDescription}
    >
      <JsonLd data={faqLd} />
      <ArticleSection title="Why an 837 isn't already a table">
        <p>
          An 837 is the claim a provider sends a payer. It isn&apos;t rows and columns — it&apos;s a nested hierarchy
          built from <Seg>HL</Seg> loops: a billing provider contains subscribers, each subscriber contains claims,
          and each claim contains diagnoses and service lines. The data you want in a spreadsheet — patient, charge,
          diagnosis, procedure — is scattered across <Seg>NM1</Seg>, <Seg>CLM</Seg>, <Seg>HI</Seg>, and{" "}
          <Seg>SV1</Seg>/<Seg>SV2</Seg> segments and only makes sense once you carry the hierarchy&apos;s context onto
          each claim.
        </p>
        <p>
          That&apos;s why opening an 837 in a text editor and trying to paste it into Excel doesn&apos;t work: there&apos;s
          no consistent column structure to paste into. You first have to flatten the hierarchy.
        </p>
      </ArticleSection>

      <ArticleSection title="The fastest way: flatten and export in your browser">
        <p>{SITE_NAME} does the flattening for you and exports straight to Excel. Three steps:</p>
        <ol className="ml-5 list-decimal space-y-2 text-sm">
          <li>
            <span className="text-ink">Open the file.</span> Go to{" "}
            <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
              EDIAnalyst
            </Link>{" "}
            and drop your <Seg>.837</Seg>, <Seg>.txt</Seg>, <Seg>.edi</Seg>, or <Seg>.dat</Seg> file onto the page. It
            detects 837P (professional) and 837I (institutional) automatically.
          </li>
          <li>
            <span className="text-ink">Review the table.</span> Each claim becomes one row — patient control number,
            billing provider, total charge, place of service or type of bill, diagnoses, and service lines — with
            balancing and missing-NPI/diagnosis checks already run.
          </li>
          <li>
            <span className="text-ink">Export to Excel.</span> Click export and choose Excel (<Seg>.xlsx</Seg>) — or
            CSV if you&apos;d rather. The download is generated in your browser.
          </li>
        </ol>
        <p>
          Because parsing and the export both happen on your device, the claim file — which contains PHI — is never
          uploaded. You can confirm it in your browser&apos;s Network tab.
        </p>
      </ArticleSection>

      <ArticleSection title="What ends up in the spreadsheet">
        <p>The flattened export gives you the fields analysts actually work with, one claim per row:</p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {[
            ["Patient & subscriber", "Name and member ID, carried down from the subscriber loop."],
            ["Claim (CLM)", "Patient control number, total charge, and place of service or type of bill."],
            ["Diagnoses (HI)", "The principal ICD-10 diagnosis plus any additional ones."],
            ["Service lines (SV1/SV2)", "Procedures (professional) or revenue codes (institutional), units, and charges."],
            ["Billing provider", "Billing NPI and tax ID."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[10rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{k}</dt>
              <dd className="text-sm text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <p>
          From there it&apos;s an ordinary spreadsheet: sort by charge, filter by payer, or pivot by place of service.
        </p>
      </ArticleSection>

      <ArticleSection title="A note on service lines">
        <p>
          One claim can have many service lines. Depending on what you&apos;re analyzing you may want one row per
          claim (with lines summarized) or one row per service line. Decide which question you&apos;re answering —
          claim-level totals versus line-level detail — and export the corresponding view.
        </p>
      </ArticleSection>

      <ArticleSection title="Why flatten before you analyze">
        <p>
          The reason a flattened export is so much more useful than the raw file is that it turns EDI questions into
          spreadsheet questions. Once each claim is a row, &ldquo;which payer am I billing most?&rdquo; is a pivot,
          &ldquo;which claims are over $5,000?&rdquo; is a filter, and &ldquo;what&apos;s my total billed this batch?&rdquo;
          is a sum. None of that is possible while the data is still a nested <Seg>HL</Seg> hierarchy.
        </p>
        <p>
          A flattened 837 is also the right artifact for a pre-submission review. Sorting by total charge surfaces
          outliers, filtering for blank billing NPIs catches claims that will reject, and grouping by place of service
          shows whether a setting is coded consistently. Catching those in a spreadsheet before you submit is far
          cheaper than working them as denials weeks later.
        </p>
      </ArticleSection>

      <ArticleSection title="Common things that look wrong in the export">
        <p>A few patterns are normal even though they look odd the first time:</p>
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li>
            <span className="text-ink">Repeated subscriber across rows</span> — one subscriber can have several claims;
            the subscriber columns repeat because the data is carried down from the <Seg>HL</Seg> loop.
          </li>
          <li>
            <span className="text-ink">Multiple diagnoses in one cell</span> — the <Seg>HI</Seg> segment holds the
            principal plus additional diagnoses; a claim-level export lists them together.
          </li>
          <li>
            <span className="text-ink">Diagnosis pointers, not codes, on a line</span> — <Seg>SV1</Seg> points at the
            diagnoses by position (1, 2, 3), so a line shows pointers that reference the claim&apos;s <Seg>HI</Seg> list.
          </li>
        </ul>
        <p>
          For a deeper tour of which segments drive a professional claim, see{" "}
          <Link href="/blog/reading-837p-loops-and-segments" className="font-medium text-accent underline-offset-2 hover:underline">
            Reading an 837P: which loops and segments actually matter
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="Frequently asked questions">
        <dl className="mt-4 space-y-5">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="text-base font-semibold text-ink">{f.q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </ArticleSection>

      <ArticleSection title="Try it with your own 837">
        <p>
          No install, no account, no upload. Drop a claim file in and export a clean Excel sheet in seconds.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open an 837 in EDIAnalyst →
          </Link>{" "}
          ·{" "}
          <Link href="/blog/reading-837p-loops-and-segments" className="font-medium text-accent underline-offset-2 hover:underline">
            Reading an 837P →
          </Link>{" "}
          ·{" "}
          <Link href="/edi/837/place-of-service-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            Place of service codes →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
