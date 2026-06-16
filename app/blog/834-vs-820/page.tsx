import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("834-vs-820")!;

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
  ["Question it answers", "Who is enrolled?", "Who paid, and how much?"],
  ["Business name", "Benefit Enrollment and Maintenance", "Payroll Deducted / Group Premium Payment"],
  ["Direction", "Sponsor / employer → health plan", "Sponsor / employer → health plan (or its bank)"],
  ["Granularity", "One loop per member", "A payment total, then one line per premium item"],
  ["Key segments", "INS, NM1, DMG, HD, DTP", "BPR, TRN, ENT, RMR, REF"],
  ["Carries money?", "No — coverage and demographics only", "Yes — the premium remittance, with the EFT/check"],
  ["Frequency", "Often weekly or on change", "Typically monthly, with the premium cycle"],
];

const FAQ = [
  {
    q: "What's the difference between an 834 and an 820?",
    a: "The 834 is the enrollment file — it tells the health plan who is covered, and adds, terminates, or changes members. The 820 is the premium payment — it tells the plan who paid and how much, and travels with the money. One manages membership; the other pays for it.",
  },
  {
    q: "How do the 834 and 820 work together?",
    a: "A sponsor (usually an employer) enrolls members with the 834, then pays the premiums for those members with the 820. The same benefits-administration team often owns both, and reconciling them confirms the plan is being paid for exactly the members it's covering.",
  },
  {
    q: "Does the 820 list individual members?",
    a: "It can. The 820 carries a payment total in the BPR, then remittance detail — the RMR lines and ENT loops can break the premium down by policy, group, or individual member, depending on how the sponsor remits.",
  },
  {
    q: "Are these files uploaded to reconcile them?",
    a: "Not with EDIAnalyst — both the 834 and 820 are parsed entirely in your browser, so no member or payment data leaves your device.",
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
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "834 vs 820" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="834 vs 820: enrollment vs premium payment"
      intro="The 834 and the 820 are the two halves of group benefits administration: one says who's enrolled, the other says who paid. Here's how they differ, how they pair in the payer workflow, and how to reconcile one against the other."
      published={post.published}
      description={post.metaDescription}
    >
      <JsonLd data={faqLd} />

      <ArticleSection title="Two files, one workflow">
        <p>
          When an employer offers a health plan, two distinct things have to happen every cycle: the plan has to know{" "}
          <strong>who is covered</strong>, and it has to be <strong>paid</strong> for covering them. Those are two
          different X12 transactions. The <strong>834</strong> is the enrollment file — it adds, terminates, and changes
          members. The <strong>820</strong> is the premium payment — it remits the money and explains what it&apos;s
          for. They&apos;re easy to mention in the same breath because the same benefits team usually handles both, but
          they carry completely different data.
        </p>
      </ArticleSection>

      <ArticleSection title="834 — who's enrolled">
        <p>
          The <strong>834</strong> (Benefit Enrollment and Maintenance) moves membership between a sponsor (an employer
          or government program) and a health plan. Each member is an <Seg>INS</Seg> loop carrying their relationship
          and the all-important maintenance type — add, terminate, change, reinstate — followed by their name
          (<Seg>NM1</Seg>), demographics (<Seg>DMG</Seg>), coverage (<Seg>HD</Seg>), and effective/termination dates
          (<Seg>DTP</Seg>). There&apos;s no money in an 834; it&apos;s purely about coverage. For the full tour see{" "}
          <Link href="/blog/how-to-read-an-834-enrollment-file" className="font-medium text-accent underline-offset-2 hover:underline">
            how to read an 834
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="820 — who paid">
        <p>
          The <strong>820</strong> (Payroll Deducted and Other Group Premium Payment) is the premium remittance. It
          carries a payment total and method in the <Seg>BPR</Seg>, a trace number in the <Seg>TRN</Seg> (the EFT or
          check reference), and then remittance detail — <Seg>ENT</Seg> entities and <Seg>RMR</Seg> remittance lines
          that break the premium down by policy, group, or member. Where the 834 answers &ldquo;who&apos;s
          covered,&rdquo; the 820 answers &ldquo;who paid, and how much.&rdquo; It&apos;s the transaction that moves the
          money.
        </p>
      </ArticleSection>

      <ArticleSection title="How they pair in the payer workflow">
        <p>
          The two transactions are sequential halves of the same relationship. The sponsor <strong>enrolls</strong>{" "}
          members via the 834, and then <strong>pays</strong> for them via the 820 on the premium cycle. The plan
          receives membership from one file and payment from the other, and expects them to agree: the premium on the
          820 should correspond to the members enrolled on the 834. When they don&apos;t, someone is being covered
          without being paid for, or paid for without being covered — both worth catching.
        </p>
      </ArticleSection>

      <ArticleSection title="Reconciling the two">
        <p>Reconciliation is where these files meet. The questions you&apos;re answering:</p>
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li><span className="text-ink">Billed but not enrolled</span> — a premium line on the 820 for a member who isn&apos;t active on the 834.</li>
          <li><span className="text-ink">Enrolled but not paid</span> — an active member on the 834 with no matching premium on the 820.</li>
          <li><span className="text-ink">Tier mismatch</span> — the coverage level enrolled (employee, family) doesn&apos;t match the premium amount remitted.</li>
          <li><span className="text-ink">Timing gaps</span> — a mid-month add or term that the premium cycle hasn&apos;t caught up to yet.</li>
        </ul>
        <p>
          Reading both files as clean tables — members from the 834, premium lines from the 820 — turns reconciliation
          into a comparison instead of a manual segment hunt.
        </p>
      </ArticleSection>

      <ArticleSection title="834 vs 820, side by side">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink text-left">
                <th className="py-2 pr-4 font-semibold text-ink">Aspect</th>
                <th className="py-2 pr-4 font-semibold text-ink">834 (enrollment)</th>
                <th className="py-2 font-semibold text-ink">820 (premium payment)</th>
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

      <ArticleSection title="Reconcile enrollment against premium">
        <p>
          {SITE_NAME} reads both an 834 and an 820 into clean tables — members and their coverage on one side, the
          payment total and premium lines on the other — so you can line them up and spot who&apos;s enrolled but not
          paid (or paid but not enrolled). Both files are parsed entirely in your browser; nothing is uploaded.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open a file in EDIAnalyst →
          </Link>{" "}
          ·{" "}
          <Link href="/edi/834" className="font-medium text-accent underline-offset-2 hover:underline">
            834 reference →
          </Link>{" "}
          ·{" "}
          <Link href="/edi/820" className="font-medium text-accent underline-offset-2 hover:underline">
            820 reference →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
