import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("835-vs-837")!;

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

const ROWS: [string, string, string][] = [
  ["Direction", "Provider → payer", "Payer → provider"],
  ["Purpose", "Request payment for services (the claim)", "Explain how the claim was paid (the remittance)"],
  ["Business name", "Health Care Claim", "Electronic Remittance Advice (ERA)"],
  ["Travels with", "Nothing — it's the ask", "The payment (an ACH/EFT or check)"],
  ["Key segments", "CLM (claim), HI (diagnoses), SV1/SV2 (service lines)", "BPR/TRN (payment), CLP (claim payment), CAS (adjustments)"],
  ["Carries the 'why'", "What was done and billed", "CARC / RARC codes explaining every unpaid dollar"],
  ["One file holds", "Many claims", "Many claim payments under one payment"],
];

const FAQ = [
  {
    q: "What's the difference between an 835 and an 837?",
    a: "The 837 is the claim a provider sends to a payer to request payment. The 835 is the remittance the payer sends back explaining how that claim was paid, adjusted, or denied — and it travels with the actual payment. One goes out, the other comes back.",
  },
  {
    q: "How do I match an 835 back to the 837 it paid?",
    a: "The patient control number you put in the 837's CLM01 comes back in the 835's CLP01, so it's the primary key for matching. The payer's own claim number is in CLP07, and the TRN trace number ties the remittance to the deposit. Match on the patient control number first.",
  },
  {
    q: "Why was a line on my 835 not paid in full?",
    a: "Every unpaid dollar on an 835 is explained by a CARC (claim adjustment reason code) in the CAS segment, often with a RARC remark. A CO write-off is contractual; a PR amount is patient responsibility; other codes mean a denial or coordination of benefits.",
  },
  {
    q: "Does an 835 always correspond to one 837?",
    a: "Not one-to-one. A single 835 (one payment) can cover many claims from different 837 files, and a claim can be split or reprocessed across remittances. Match at the claim level using the patient control number, not file to file.",
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
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "835 vs 837" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="835 vs 837: how the claim and the payment connect"
      intro="The 837 and the 835 are two halves of the same conversation: the 837 is the claim a provider sends out, and the 835 is the payment that comes back. Here's how they relate across the claim lifecycle, and exactly how to match a remittance to the claim it paid."
      published={post.published}
      description={post.metaDescription}
    >
      <JsonLd data={faqLd} />

      <ArticleSection title="Two ends of one transaction">
        <p>
          It&apos;s easy to confuse the 835 and the 837 because they describe the same claim — but from opposite
          directions. The <strong>837</strong> is the <strong>claim going out</strong>: a provider telling a payer what
          was done and what it costs, to request payment. The <strong>835</strong> is the{" "}
          <strong>payment coming back</strong>: the payer&apos;s explanation of how that claim was resolved — paid,
          adjusted, or denied — and it travels with the actual money (an ACH/EFT or a check). The 835 is also called the
          ERA, the Electronic Remittance Advice, and it&apos;s the electronic version of the paper EOB.
        </p>
      </ArticleSection>

      <ArticleSection title="The claim lifecycle">
        <p>A claim and its payment are separated by several steps. In order:</p>
        <ol className="ml-5 list-decimal space-y-2 text-sm">
          <li><span className="text-ink">Submit.</span> The provider sends the <Seg>837</Seg> (often through a clearinghouse).</li>
          <li><span className="text-ink">Acknowledge.</span> A <Seg>999</Seg> confirms the file&apos;s syntax was accepted, and a 277CA accepts or rejects each claim for processing.</li>
          <li><span className="text-ink">Adjudicate.</span> The payer applies the member&apos;s benefits, contracts, and edits to decide what to pay.</li>
          <li><span className="text-ink">Remit.</span> The payer returns the <Seg>835</Seg> with the payment, explaining the outcome of every claim and line.</li>
        </ol>
        <p>
          So the 835 you&apos;re reading today is the downstream answer to an 837 you sent days or weeks ago. Posting
          teams reconcile the two to confirm they were paid correctly.
        </p>
      </ArticleSection>

      <ArticleSection title="Matching an 835 to its 837">
        <p>This is the part analysts ask about most. Three identifiers do the work:</p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {[
            ["Patient control number", "The number you assign in the 837's CLM01 is echoed back in the 835's CLP01. This is the primary key for matching a remittance line to the claim you submitted."],
            ["Payer claim control number", "The payer's own internal claim number, returned in CLP07. Use it when you call the payer or appeal."],
            ["TRN trace number", "Ties the whole remittance to the payment — the EFT or check number your bank shows on the deposit (reassociation)."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[11rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{k}</dt>
              <dd className="text-sm text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <p>
          Match on the <strong>patient control number</strong> first — it&apos;s the link you control. One 835 can pay
          claims from several 837 batches, so matching file-to-file doesn&apos;t work; you match claim-to-claim.
        </p>
      </ArticleSection>

      <ArticleSection title="The 835 carries the 'why'">
        <p>
          Where the 837 says what you billed, the 835 says what happened to it — and encodes the reason. Every dollar
          that wasn&apos;t paid sits in a <Seg>CAS</Seg> segment as a group code (CO, PR, OA, PI), a{" "}
          <strong>CARC</strong> (claim adjustment reason code), and an amount, often with a <strong>RARC</strong> remark
          for detail. <Seg>CO-45</Seg> is a contractual write-off; <Seg>PR-1</Seg> is the deductible;{" "}
          <Seg>CO-197</Seg> is a missing authorization. Each one is decoded in the{" "}
          <Link href="/edi/835/denial-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            835 denial-code reference
          </Link>
          , and{" "}
          <Link href="/blog/how-to-read-an-835-remittance" className="font-medium text-accent underline-offset-2 hover:underline">
            how to read an 835
          </Link>{" "}
          walks the whole segment structure.
        </p>
      </ArticleSection>

      <ArticleSection title="835 vs 837, side by side">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink text-left">
                <th className="py-2 pr-4 font-semibold text-ink">Aspect</th>
                <th className="py-2 pr-4 font-semibold text-ink">837 (claim)</th>
                <th className="py-2 font-semibold text-ink">835 (remittance)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ROWS.map((r) => (
                <tr key={r[0]}>
                  <td className="py-2 pr-4 font-medium text-ink align-top">{r[0]}</td>
                  <td className="py-2 pr-4 text-muted align-top">{r[1]}</td>
                  <td className="py-2 text-muted align-top">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Worth knowing: the 837 itself splits into professional and institutional variants — see{" "}
          <Link href="/blog/837p-vs-837i" className="font-medium text-accent underline-offset-2 hover:underline">
            837P vs 837I
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

      <ArticleSection title="See denials tied back to claims">
        <p>
          {SITE_NAME} reads an 835 into one row per claim, decodes every CARC and RARC into plain English, checks that
          each claim balances, and surfaces the patient control number so you can tie it back to your 837. Drop your
          835 to see denials decoded and matched to claims — parsed entirely in your browser, nothing uploaded.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open an 835 in EDIAnalyst →
          </Link>{" "}
          ·{" "}
          <Link href="/blog/how-to-read-an-835-remittance" className="font-medium text-accent underline-offset-2 hover:underline">
            How to read an 835 →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
