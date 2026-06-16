import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("834-maintenance-type-codes-ins03")!;

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

const CODES: { code: string; name: string; what: string }[] = [
  {
    code: "021",
    name: "Addition",
    what: "A new member or a new coverage is being added. This is an enrollment — the member should not already exist on the plan for this coverage, and you'd expect effective-date (DTP) and coverage (HD) details to follow.",
  },
  {
    code: "024",
    name: "Termination / Cancellation",
    what: "Coverage is ending. The member is being termed off the plan or a specific coverage is being dropped, with a termination date in the DTP segment. This is the value enrollment teams watch most closely — a wrong 024 drops someone's coverage.",
  },
  {
    code: "025",
    name: "Reinstatement",
    what: "Previously terminated coverage is being restored. Use it to bring a member back after an 024, rather than re-adding them as a brand-new 021.",
  },
  {
    code: "001",
    name: "Change",
    what: "An update to an existing member — a demographic correction, a plan change, an address update, and so on. The member stays enrolled; something about their record changes.",
  },
  {
    code: "030",
    name: "Audit or Compare",
    what: "A full-file or reconciliation record. The sponsor sends the current state of a member so the plan can compare its records against the source of truth, without necessarily implying an add, change, or term.",
  },
  {
    code: "002",
    name: "Delete",
    what: "Removes a record entirely (as opposed to terminating coverage with an end date). Less common, and used differently by different trading partners — confirm the companion-guide intent before acting on it.",
  },
];

export default function Article() {
  return (
    <ArticleShell
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "834 maintenance types" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="834 maintenance type codes (INS03)"
      intro="The maintenance type code in INS03 is the single field that decides what happens to a member in an 834 — added, terminated, reinstated, or changed. Here's every value you'll see, and what it actually does."
      published={post.published}
      description={post.metaDescription}
    >
      <ArticleSection title="Where to find it">
        <p>
          An 834 carries member enrollment between a sponsor (an employer or government program) and a health plan.
          Each member starts with an <Seg>INS</Seg> segment, and the third element — <strong>INS03</strong> — is the{" "}
          <strong>maintenance type code</strong>. It tells the receiving plan what to <em>do</em> with this member:
          enroll them, term them, reinstate them, or update them.
        </p>
        <p>
          A typical segment looks like <Seg>INS*Y*18*021*28*A***FT</Seg>. Reading left to right: <Seg>Y</Seg> = this
          person is the subscriber, <Seg>18</Seg> = self relationship, and <Seg>021</Seg> in the third position = an
          addition. INS03 is the one to read first — everything else describes a member whose fate that code decides.
        </p>
      </ArticleSection>

      <ArticleSection title="The values, decoded">
        <dl className="divide-y divide-line border-y border-line">
          {CODES.map((c) => (
            <div key={c.code} className="py-4">
              <dt className="flex items-baseline gap-3">
                <span className="font-mono text-base font-semibold text-accent">{c.code}</span>
                <span className="text-sm font-semibold text-ink">{c.name}</span>
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">{c.what}</dd>
            </div>
          ))}
        </dl>
      </ArticleSection>

      <ArticleSection title="INS03 vs. INS04 — don't confuse them">
        <p>
          INS03 (maintenance type) says <em>what</em> is happening; <strong>INS04</strong>, the maintenance reason
          code, says <em>why</em>. For a termination (024), INS04 might carry a reason such as &ldquo;28&rdquo;
          (termination of benefits) or a voluntary/involuntary indicator. When you&apos;re reconciling a file, read
          them together: the type tells you the action, the reason tells you whether it was expected.
        </p>
      </ArticleSection>

      <ArticleSection title="Why it's worth getting right">
        <p>
          The maintenance type drives real outcomes: an 021 enrolls someone, an 024 ends their coverage, an 001 quietly
          changes a plan or address. A misread or mis-sent INS03 is how people lose coverage they should have, or keep
          coverage they shouldn&apos;t. When you open an enrollment file, the maintenance type on each member is the
          first thing to verify.
        </p>
      </ArticleSection>

      <ArticleSection title="See the maintenance type on every member">
        <p>
          {SITE_NAME} reads INS03 for each member and shows it as a color-coded badge — add, term, change, reinstate —
          so you can scan an entire 834 in seconds and tally the additions, terminations, and changes at a glance. It
          can even diff this week&apos;s file against last week&apos;s to show exactly who joined, left, or changed.
          Everything is parsed in your browser; nothing is uploaded.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open an 834 in EDIAnalyst →
          </Link>{" "}
          ·{" "}
          <Link href="/blog/how-to-read-an-834-enrollment-file" className="font-medium text-accent underline-offset-2 hover:underline">
            Read an 834 field by field →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
