import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("diff-two-834-files")!;

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
    q: "What key should I match members on?",
    a: "Subscriber ID plus member/dependent ID, taken from the REF and NM1 segments. Don't match on name (it changes spelling) or file position (it's meaningless). A stable identifier is what lets the two files line up correctly.",
  },
  {
    q: "Why not just trust the INS03 maintenance type?",
    a: "On full-file 834s the maintenance type is often 030 (audit/compare) for everyone, so it doesn't tell you what actually moved. A real diff compares the data itself, which catches silent terms and unflagged changes the maintenance type misses.",
  },
  {
    q: "Are both files uploaded?",
    a: "No. Both 834s are parsed and compared entirely in your browser — no PHI is sent to a server.",
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
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "Diff two 834s" }]}
        path={`/blog/${post.slug}`}
        kicker={post.kicker}
        title="How to diff two 834 files and catch every add, term, and change"
        intro="Full-file 834s resend everyone every week, so the real question is what changed. Here's how to compare this week's file against last week's and see exactly who was added, terminated, or changed — down to the field."
        published={post.published}
        description={post.metaDescription}
      >
        <ArticleSection title="Why diffing an 834 is hard by hand">
          <p>
            Many payers and sponsors send <strong>full-file</strong> 834s — every member, every week — rather than just
            the changes. That means the file is mostly noise: the handful of real adds, terms, and changes are buried
            among thousands of unchanged members. Eyeballing two files side by side doesn&apos;t scale, and a missed
            term has real consequences — someone keeps coverage they shouldn&apos;t (and the plan keeps paying premium
            for them), or someone loses coverage they should have kept and shows up denied at the pharmacy counter.
          </p>
          <p>
            The maintenance type in <Seg>INS03</Seg> is supposed to flag the action, and it helps when the sender
            populates it honestly. But on a full file it&apos;s frequently just <Seg>030</Seg> (audit/compare) for every
            record, so it tells you nothing about what actually moved. The only reliable way to know is to compare the
            two files&apos; data directly — a real diff.
          </p>
        </ArticleSection>

        <ArticleSection title="Full file vs change file — know which you have">
          <p>
            An 834 comes in two flavors. A <strong>change file</strong> contains only members who were added, termed, or
            changed since the last cycle — small and already &ldquo;diffed&rdquo; for you, but dependent on the sender
            getting the maintenance types right. A <strong>full file</strong> (sometimes called a census or audit file)
            re-sends the entire membership every cycle; it&apos;s authoritative but enormous, and you have to compute
            the delta yourself.
          </p>
          <p>
            Most reconciliation problems come from full files, because the delta isn&apos;t handed to you. That&apos;s
            exactly where a diff earns its keep: it turns &ldquo;here are 12,000 members&rdquo; into &ldquo;here are the
            9 that changed since last week.&rdquo;
          </p>
        </ArticleSection>

        <ArticleSection title="The key: a stable member key">
          <p>
            A diff is only as good as the key it matches members on. The reliable key in an 834 is the{" "}
            <strong>subscriber ID + member ID</strong> (from the <Seg>REF</Seg> and <Seg>NM1</Seg> segments) — not the
            name, which can change spelling, and not position in the file, which is meaningless. Match on the stable
            identifier and every member lines up between the two files, so the comparison can tell a genuine change from
            a row that simply moved.
          </p>
        </ArticleSection>

        <ArticleSection title="Diff two 834s in your browser">
          <p>{SITE_NAME} compares two enrollment files for you:</p>
          <ol className="ml-5 list-decimal space-y-2 text-sm">
            <li>
              <span className="text-ink">Open last week&apos;s file</span> in{" "}
              <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
                EDIAnalyst
              </Link>
              , then load this week&apos;s as the comparison.
            </li>
            <li>
              <span className="text-ink">Read the three buckets.</span> Members are keyed on subscriber + member ID and
              sorted into <strong>added</strong>, <strong>removed/terminated</strong>, and <strong>changed</strong>.
            </li>
            <li>
              <span className="text-ink">Drill into changes.</span> For each changed member you get a field-level before
              and after — so you see the demographic, coverage, or date that actually moved, not just that
              <em> something</em> did.
            </li>
          </ol>
          <p>Both files are parsed entirely on your device — nothing is uploaded.</p>
        </ArticleSection>

        <ArticleSection title="What counts as a change">
          <p>
            A diff catches things a maintenance type won&apos;t, because it compares the underlying data rather than
            trusting a flag:
          </p>
          <ul className="ml-5 list-disc space-y-1.5 text-sm">
            <li>A member silently dropped from a full file — an implied term the sender never flagged.</li>
            <li>A coverage-tier change (e.g. <Seg>HD05</Seg> from <Seg>EMP</Seg> to <Seg>FAM</Seg>) with no INS03 change.</li>
            <li>A new dependent added under an existing subscriber.</li>
            <li>A corrected date of birth or member ID that affects matching downstream.</li>
            <li>An effective- or termination-date shift in the <Seg>DTP</Seg> segments — including retroactive terms.</li>
          </ul>
        </ArticleSection>

        <ArticleSection title="A weekly reconciliation workflow">
          <p>
            The practical pattern is simple and repeatable. Each cycle, diff the new file against the one you processed
            last time. Work the three buckets in order: confirm the <strong>adds</strong> enrolled correctly, verify the{" "}
            <strong>terms</strong> have a real end date and reason (cross-check against{" "}
            <Link href="/blog/find-834-termination-dates-dtp357" className="font-medium text-accent underline-offset-2 hover:underline">
              the DTP termination dates
            </Link>
            ), and review the <strong>changes</strong> for anything that affects eligibility or premium. Anything
            unexpected — a term with no reason, a tier change you didn&apos;t initiate — gets escalated before it hits
            the next premium invoice. Keeping the diff tight each week is far cheaper than untangling months of drift
            during an audit.
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

        <ArticleSection title="Try it with your own files">
          <p>
            <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
              Open two 834s in EDIAnalyst →
            </Link>{" "}
            ·{" "}
            <Link href="/blog/834-maintenance-type-codes-ins03" className="font-medium text-accent underline-offset-2 hover:underline">
              834 maintenance type codes →
            </Link>{" "}
            ·{" "}
            <Link href="/blog/convert-834-to-member-roster-excel" className="font-medium text-accent underline-offset-2 hover:underline">
              Convert an 834 to Excel →
            </Link>
          </p>
        </ArticleSection>
      </ArticleShell>
    </>
  );
}
