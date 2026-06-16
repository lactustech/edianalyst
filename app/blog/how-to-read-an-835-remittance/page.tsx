import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("how-to-read-an-835-remittance")!;

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

export default function Article() {
  return (
    <ArticleShell
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "Reading an 835" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="How to read an 835 remittance"
      intro="An 835 (ERA) tells you exactly how a payer settled each claim — what was paid, what was adjusted, and why. Here's how to read one segment by segment and trace a single denial back to its reason."
      published={post.published}
      description={post.metaDescription}
    >
      <ArticleSection title="What an 835 is">
        <p>
          An 835 — the Electronic Remittance Advice, or ERA — is the electronic version of the paper EOB a payer
          sends a provider. It travels alongside the payment (usually an ACH/EFT) and explains, claim by claim and
          line by line, how every dollar was resolved: paid, adjusted, or denied.
        </p>
        <p>
          The hard part is that the &ldquo;why&rdquo; is encoded. Every amount that wasn&apos;t paid is tagged with a
          terse adjustment code packed into a <Seg>CAS</Seg> segment. Reading an 835 well means knowing where to look
          and how to decode those codes.
        </p>
      </ArticleSection>

      <ArticleSection title="The structure, top to bottom">
        <p>An 835 is organized as a payment, then payers and payees, then one entry per claim, then per service line:</p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {[
            ["BPR", "The financial header — the total amount paid, the payment method (ACH, check, non-payment), and the effective date."],
            ["TRN", "The reassociation trace number — the check or EFT number that ties this remittance to the actual money."],
            ["N1", "Who's paying (payer) and who's being paid (payee)."],
            ["CLP", "Claim-level payment — one per claim. Carries the claim's status, total charge, amount paid, and patient responsibility."],
            ["NM1", "The patient/subscriber the claim is for."],
            ["SVC", "Service-line payment — the procedure, its charge, and what was paid on that line."],
            ["CAS", "The adjustments — the group code, CARC, and amount for every dollar not paid. This is where the 'why' lives."],
            ["LQ", "The RARC remark codes that add detail to an adjustment."],
          ].map(([seg, desc]) => (
            <div key={seg} className="grid grid-cols-[4.5rem_1fr] gap-4 py-3">
              <dt className="font-mono text-sm font-semibold text-accent">{seg}</dt>
              <dd className="text-sm text-muted">{desc}</dd>
            </div>
          ))}
        </dl>
      </ArticleSection>

      <ArticleSection title="The CLP status: was the claim paid or denied?">
        <p>
          Each <Seg>CLP</Seg> carries a claim status code that tells you the outcome at a glance. The ones you&apos;ll
          see most:
        </p>
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li><span className="font-mono text-ink">1</span> — processed as primary (paid).</li>
          <li><span className="font-mono text-ink">2</span> — processed as secondary.</li>
          <li><span className="font-mono text-ink">3</span> — processed as tertiary.</li>
          <li><span className="font-mono text-ink">4</span> — denied.</li>
          <li><span className="font-mono text-ink">22</span> — reversal of a previous payment.</li>
        </ul>
        <p>
          A status of 4, or a paid amount of zero against a non-zero charge, is your signal to look at the{" "}
          <Seg>CAS</Seg> adjustments to find out why.
        </p>
      </ArticleSection>

      <ArticleSection title="Decoding the CAS: why a claim was denied">
        <p>
          The <Seg>CAS</Seg> segment is the heart of the answer. It repeats in groups of three values: a{" "}
          <strong>group code</strong>, a <strong>CARC</strong> (claim adjustment reason code), and the{" "}
          <strong>amount</strong>. For example, <Seg>CAS*CO*45*120</Seg> reads as &ldquo;$120 adjusted as a
          contractual write-off because the charge exceeded the allowed amount.&rdquo;
        </p>
        <p>The group code tells you who owns the money — and whether you can bill the patient:</p>
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li><span className="font-mono text-ink">CO</span> — contractual obligation; a provider write-off you can&apos;t bill the patient for.</li>
          <li><span className="font-mono text-ink">PR</span> — patient responsibility; deductible, coinsurance, or copay you can bill.</li>
          <li><span className="font-mono text-ink">OA</span> — other adjustment; often coordination of benefits.</li>
          <li><span className="font-mono text-ink">PI</span> — payer-initiated reduction.</li>
        </ul>
        <p>
          The CARC after the group code is the actual reason. <span className="font-mono text-ink">CO-45</span>{" "}
          (over fee schedule), <span className="font-mono text-ink">CO-97</span> (bundled),{" "}
          <span className="font-mono text-ink">CO-197</span> (no authorization), and{" "}
          <span className="font-mono text-ink">PR-1</span> (deductible) are among the most common. A denial often
          comes with a <Seg>LQ</Seg> RARC remark for extra detail — look up both. Our{" "}
          <Link href="/edi/835/denial-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            denial-code reference
          </Link>{" "}
          has a plain-English page for each one.
        </p>
      </ArticleSection>

      <ArticleSection title="Does the claim balance?">
        <p>
          A correct 835 always balances at the claim level: the <strong>total charge</strong> equals the{" "}
          <strong>amount paid</strong> plus <strong>every CAS adjustment</strong>. If those don&apos;t add up, either
          a segment was misread or the remittance has a real problem worth questioning. Checking this by hand across a
          large file is tedious and error-prone — it&apos;s the first thing to automate.
        </p>
      </ArticleSection>

      <ArticleSection title="Read it without the manual decoding">
        <p>
          {SITE_NAME} does all of the above for you: it reads the <Seg>BPR</Seg> and <Seg>TRN</Seg> for the payment
          total and trace number, turns every <Seg>CLP</Seg> into a row, expands each <Seg>CAS</Seg> adjustment into
          its plain-English CARC and RARC reason, checks that every claim balances, and pulls denied claims into a
          findings list. Drop your 835 in — it&apos;s parsed entirely in your browser, so no PHI ever leaves your
          device.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open an 835 in EDIAnalyst →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
