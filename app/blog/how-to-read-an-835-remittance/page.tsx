import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
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

const FAQ = [
  {
    q: "Is an 835 the same as an ERA?",
    a: "Yes. 835 is the X12 transaction number and ERA (Electronic Remittance Advice) is the business name. It's the electronic version of the paper EOB a payer sends a provider, and it travels with the payment.",
  },
  {
    q: "What's the difference between a CARC and a RARC?",
    a: "A CARC (Claim Adjustment Reason Code) explains why an amount wasn't paid and rides in the CAS segment with a group code (CO/PR/OA/PI). A RARC (Remittance Advice Remark Code) adds extra detail and rides in the LQ segment. You often need to read both.",
  },
  {
    q: "How do I tell a denial from a write-off?",
    a: "Check the CLP status (4 = denied) and whether the paid amount is zero against a non-zero charge. A CO contractual write-off isn't a denial — the claim still paid its allowed amount; the CO line is just the part you can't bill the patient.",
  },
  {
    q: "Is my 835 uploaded anywhere?",
    a: "No. The file is parsed entirely in your browser, so no file or PHI is ever sent to a server. You can confirm it in your browser's Network tab.",
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
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "Reading an 835" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="How to read an 835 remittance"
      intro="An 835 (ERA) tells you exactly how a payer settled each claim — what was paid, what was adjusted, and why. Here's how to read one segment by segment and trace a single denial back to its reason."
      published={post.published}
      description={post.metaDescription}
    >
      <JsonLd data={faqLd} />
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

      <ArticleSection title="Claim-level vs service-line adjustments">
        <p>
          Adjustments show up at two levels, and mixing them up is a common mistake. A <Seg>CAS</Seg> directly under the{" "}
          <Seg>CLP</Seg> is a <strong>claim-level</strong> adjustment — it applies to the claim as a whole. A{" "}
          <Seg>CAS</Seg> under an <Seg>SVC</Seg> is a <strong>service-line</strong> adjustment that applies only to that
          procedure. A single claim can have both: a line-level <Seg>CO-45</Seg> write-off on one procedure and a
          claim-level <Seg>PR-1</Seg> deductible, for instance.
        </p>
        <p>
          When you reconcile, total the adjustments at the level they appear. A claim balances when its charge equals
          the paid amount plus the claim-level adjustments plus the sum of every line&apos;s charge-minus-paid. Reading
          the <Seg>SVC</Seg> lines is also how you answer &ldquo;which procedure got denied?&rdquo; when only part of a
          claim was paid.
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

      <ArticleSection title="Reassociating the payment to your deposit">
        <p>
          The 835 explains the money, but you still have to match it to the actual deposit that hit the bank. That&apos;s
          what the <Seg>BPR</Seg> and <Seg>TRN</Seg> are for. The <Seg>BPR</Seg> carries the total payment amount and
          the method — <Seg>ACH</Seg> for an EFT, <Seg>CHK</Seg> for a check, or a non-payment indicator for a
          zero-dollar remit. The <Seg>TRN</Seg> carries the reassociation trace number, which is the EFT or check number
          your bank shows on the deposit.
        </p>
        <p>
          Matching the <Seg>TRN</Seg> trace number to the deposit is called <em>reassociation</em>, and it&apos;s how
          posting teams confirm an ERA belongs to a specific payment before they post it. One 835 can cover many claims
          in a single payment, so the <Seg>BPR</Seg> total should equal the sum of what was paid across every{" "}
          <Seg>CLP</Seg> in the file — another balance worth checking.
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
          </Link>{" "}
          ·{" "}
          <Link href="/edi/835/denial-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            Browse all 835 denial codes →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
