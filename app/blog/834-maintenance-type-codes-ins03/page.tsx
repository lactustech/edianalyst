import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
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

const FAQ = [
  {
    q: "Which INS03 value is a termination?",
    a: "024 (Termination / Cancellation). It ends a member's coverage and carries a termination date in the DTP segment. It's the value enrollment teams watch most closely, because a wrong 024 drops someone's coverage.",
  },
  {
    q: "What's the difference between 021 and 025?",
    a: "021 (Addition) enrolls a brand-new member or coverage. 025 (Reinstatement) restores coverage that was previously terminated. Use 025 to bring someone back after an 024 rather than re-adding them as a new 021, so history is preserved.",
  },
  {
    q: "What's the difference between INS03 and INS04?",
    a: "INS03 is the maintenance type — what's happening (add, term, change). INS04 is the maintenance reason — why it's happening (e.g. birth, retirement, termination of employment). Read them together when reconciling.",
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
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "834 maintenance types" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="834 maintenance type codes (INS03)"
      intro="The maintenance type code in INS03 is the single field that decides what happens to a member in an 834 — added, terminated, reinstated, or changed. Here's every value you'll see, and what it actually does."
      published={post.published}
      description={post.metaDescription}
    >
      <JsonLd data={faqLd} />
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

      <ArticleSection title="Full-file vs change-file changes how you read 030">
        <p>
          Context matters for the maintenance type — especially <Seg>030</Seg> (audit/compare). On a{" "}
          <strong>change file</strong>, every record is a real movement, so an <Seg>021</Seg> or <Seg>024</Seg> means
          exactly what it says. On a <strong>full file</strong> (the entire census re-sent each cycle), senders often
          stamp every member <Seg>030</Seg> — which tells you nothing about who actually moved.
        </p>
        <p>
          That&apos;s the trap: on a full file you can&apos;t trust the maintenance type alone to find changes. You have
          to compare the file against the prior one. See{" "}
          <Link href="/blog/diff-two-834-files" className="font-medium text-accent underline-offset-2 hover:underline">
            how to diff two 834 files
          </Link>{" "}
          for the reliable way to catch every add, term, and change regardless of what INS03 claims.
        </p>
      </ArticleSection>

      <ArticleSection title="Why it's worth getting right">
        <p>
          The maintenance type drives real outcomes: an 021 enrolls someone, an 024 ends their coverage, an 001 quietly
          changes a plan or address. A misread or mis-sent INS03 is how people lose coverage they should have, or keep
          coverage they shouldn&apos;t. When you open an enrollment file, the maintenance type on each member is the
          first thing to verify.
        </p>
        <p>
          A few habits keep INS03 from causing trouble. Always pair a <Seg>024</Seg> with a termination date in the{" "}
          <Seg>DTP</Seg> (see{" "}
          <Link href="/blog/find-834-termination-dates-dtp357" className="font-medium text-accent underline-offset-2 hover:underline">
            finding termination dates
          </Link>
          ); treat a <Seg>024</Seg> with no end date, or an end date with no <Seg>024</Seg>, as something to verify
          before acting; and confirm a <Seg>021</Seg> is genuinely new rather than a change that should have been an{" "}
          <Seg>001</Seg>. Small discrepancies here become coverage gaps and premium errors downstream.
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
          </Link>{" "}
          ·{" "}
          <Link href="/edi/834/enrollment-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            All 834 enrollment codes →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
