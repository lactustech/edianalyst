import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";

const post = getPost("find-834-termination-dates-dtp357")!;

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
    q: "What's the difference between DTP*357 and DTP*349?",
    a: "DTP*357 is the member's eligibility end date — when they stop being eligible overall. DTP*349 is the benefit end date for a specific coverage (the HD block it follows). A member can have a 349 on dental while their 357 eligibility continues.",
  },
  {
    q: "What does the D8 in DTP*357*D8*20260630 mean?",
    a: "D8 is the date-format qualifier — it says the date that follows is a single CCYYMMDD value (2026-06-30). You may also see RD8 for a date range (begin-end), written as CCYYMMDD-CCYYMMDD.",
  },
  {
    q: "Should every termination have a 024 maintenance type?",
    a: "Ideally yes — a clean term pairs INS03=024 with a DTP end date. An end date without a 024, or a 024 without an end date, is worth investigating before you act on it.",
  },
];

export default function Article() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <JsonLd data={faqLd} />
      <ArticleShell
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "834 termination dates" }]}
        path={`/blog/${post.slug}`}
        kicker={post.kicker}
        title="Finding termination dates in an 834 (DTP*357) in seconds"
        intro="When a member's coverage ends, the date lives in an 834 DTP segment — usually DTP*357 (eligibility end) or DTP*349 (benefit end). Here's how to read them and surface every termination in a file fast."
        published={post.published}
        description={post.metaDescription}
      >
        <ArticleSection title="Where the date actually lives">
          <p>
            An 834 carries dates in <Seg>DTP</Seg> segments, and the qualifier in <Seg>DTP01</Seg> says <em>which</em>{" "}
            date it is. There are a dozen possible qualifiers in an 834, but for a termination you care about two — and
            it helps to see them next to their &ldquo;begin&rdquo; counterparts:
          </p>
          <dl className="mt-2 divide-y divide-line border-y border-line">
            {[
              ["DTP*357", "Eligibility End — the date the member's eligibility ends. The clearest 'termed on this date' signal."],
              ["DTP*349", "Benefit End — the date a specific coverage (the HD block it follows) ends."],
              ["DTP*348", "Benefit Begin — the coverage start date, for contrast."],
              ["DTP*356", "Eligibility Begin — the eligibility start date, for contrast."],
            ].map(([seg, desc]) => (
              <div key={seg} className="grid grid-cols-[5.5rem_1fr] gap-4 py-3">
                <dt className="font-mono text-sm font-semibold text-accent">{seg}</dt>
                <dd className="text-sm text-muted">{desc}</dd>
              </div>
            ))}
          </dl>
          <p>
            A segment like <Seg>DTP*357*D8*20260630</Seg> reads as: eligibility ends on 2026-06-30. The{" "}
            <Seg>D8</Seg> qualifier means a single <Seg>CCYYMMDD</Seg> date; you&apos;ll occasionally see{" "}
            <Seg>RD8</Seg> instead, which carries a begin-end range as <Seg>CCYYMMDD-CCYYMMDD</Seg>.
          </p>
        </ArticleSection>

        <ArticleSection title="Why termination dates matter so much">
          <p>
            Of all the data in an 834, the termination date is the one most likely to cause a real-world problem if
            it&apos;s wrong or missed. Get it too early and you cut off someone&apos;s active coverage — they&apos;re
            denied at the pharmacy or the doctor&apos;s office. Get it too late, or miss it entirely, and the plan keeps
            paying claims and premium for someone who should be gone, which surfaces painfully during an audit. Because
            the date is buried in a <Seg>DTP</Seg> segment rather than shown as a column, it&apos;s easy to overlook —
            which is exactly why it&apos;s worth knowing precisely where to look.
          </p>
          <p>
            There&apos;s also a subtle gotcha in how end dates are expressed. Some senders use the last day of coverage
            (the member is covered <em>through</em> 2026-06-30), while others use the first day of non-coverage (coverage
            ends <em>as of</em> 2026-07-01). A one-day difference sounds trivial until it lands on a claim with a date of
            service right at the boundary. When a termination date looks off by a day, check the sender&apos;s companion
            guide for which convention they follow before you assume the file is wrong.
          </p>
        </ArticleSection>

        <ArticleSection title="Pair the date with the maintenance type">
          <p>
            A termination date is most meaningful next to the member&apos;s maintenance type. A member with{" "}
            <Seg>INS03</Seg> = <Seg>024</Seg> (termination) and a <Seg>DTP*357</Seg> end date is a clean term. If you see
            an end date <em>without</em> a 024 — or a 024 <em>without</em> an end date — that&apos;s worth a closer look
            before you act on it. See{" "}
            <Link href="/blog/834-maintenance-type-codes-ins03" className="font-medium text-accent underline-offset-2 hover:underline">
              834 maintenance type codes
            </Link>{" "}
            for what each value means, and the{" "}
            <Link href="/edi/834/enrollment-codes" className="font-medium text-accent underline-offset-2 hover:underline">
              834 enrollment codes
            </Link>{" "}
            reference for the rest.
          </p>
        </ArticleSection>

        <ArticleSection title="Watch the level: member vs. coverage">
          <p>
            Dates attach at different levels. A <Seg>DTP*357</Seg> after the member loop applies to the member&apos;s
            overall eligibility; a <Seg>DTP*349</Seg> after a specific <Seg>HD</Seg> coverage block applies to{" "}
            <em>that coverage</em>. A member can keep medical while dental ends — so always read the end date against the
            coverage block it follows, not just the member. Treating a coverage-level dental term as a full eligibility
            term is a classic mistake that drops someone&apos;s medical by accident.
          </p>
        </ArticleSection>

        <ArticleSection title="Retroactive terminations">
          <p>
            Not every termination is dated in the future. Sponsors frequently send <strong>retroactive</strong> terms —
            an end date that&apos;s already in the past, because the member actually left weeks ago and the paperwork
            caught up late. Those are the ones that create the messiest reconciliation: claims may have already paid
            after the real end date. When you scan for termination dates, sort by the date itself and flag any that
            precede the file&apos;s creation date — those are the retro-terms that need follow-up, often a claim
            recovery or a premium adjustment.
          </p>
        </ArticleSection>

        <ArticleSection title="Surface every termination at a glance">
          <p>
            Scanning a full file for <Seg>DTP*357</Seg> segments by hand is slow and easy to miss.{" "}
            <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
              EDIAnalyst
            </Link>{" "}
            reads the DTP dates into each member&apos;s row, badges terminations, and tallies them — so the file&apos;s
            terms are visible in one table. Sort by termination date, filter to just the 024s, or compare two files to
            see new terms since last week, then export to Excel. Everything is parsed in your browser; nothing is
            uploaded.
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

        <ArticleSection title="Related">
          <p>
            <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
              Open an 834 in EDIAnalyst →
            </Link>{" "}
            ·{" "}
            <Link href="/blog/how-to-read-an-834-enrollment-file" className="font-medium text-accent underline-offset-2 hover:underline">
              Read an 834 field by field →
            </Link>{" "}
            ·{" "}
            <Link href="/blog/diff-two-834-files" className="font-medium text-accent underline-offset-2 hover:underline">
              Diff two 834 files →
            </Link>
          </p>
        </ArticleSection>
      </ArticleShell>
    </>
  );
}
