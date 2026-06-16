import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("x12-vs-5010-vs-7030")!;

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

const ROWS: [string, string, string, string][] = [
  ["What it is", "The standards body & the standard", "A version (edition) of the X12 standard", "A newer version of the X12 standard"],
  ["Numbered as", "n/a — it's the framework", "005010", "007030"],
  ["Healthcare status", "Always the underlying standard", "HIPAA-mandated since 2012", "Approved by X12, not yet HIPAA-mandated"],
  ["What you'll see", "Every file is X12", "Virtually all production healthcare files today", "Pilots and forward-looking work, rarely in production"],
];

const FAQ = [
  {
    q: "Is X12 the same as 5010?",
    a: "No. X12 is the standard (and the body that maintains it); 5010 is a specific version of that standard — written 005010. Saying a file is 'X12 5010' means it follows the X12 standard at the 5010 version.",
  },
  {
    q: "What does 005010 mean?",
    a: "It's the version/release of the X12 standard a transaction follows — release 5, version 010, written 005010. In healthcare you'll also see it extended with an implementation reference like 005010X222A1, which pins the exact implementation guide (here, the 837P).",
  },
  {
    q: "What changed from 4010 to 5010?",
    a: "5010 modernized the HIPAA transactions: clearer implementation guides, support for longer/required fields (like the full 9-digit ZIP and ICD-10 readiness), the 999 acknowledgment replacing the 997, and many situational rules tightened. It became the mandated version in 2012.",
  },
  {
    q: "Do I need to worry about 7030 yet?",
    a: "For most healthcare work, no. 7030 is an approved newer version, but it is not the HIPAA-mandated standard, so production healthcare files are still 5010. It's worth knowing it exists, but you'll almost always be reading 5010.",
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
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "X12 vs 5010 vs 7030" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="X12 vs 5010 vs 7030: EDI standard versions, demystified"
      intro="These three terms get used interchangeably, but they aren't the same kind of thing. X12 is the standard; 5010 and 7030 are versions of it. Here's what each means, the history behind 5010, where 7030 stands, and which you'll actually see in production."
      published={post.published}
      description={post.metaDescription}
    >
      <JsonLd data={faqLd} />

      <ArticleSection title="The standard vs. its versions">
        <p>
          The confusion is understandable, but the relationship is simple once stated: <strong>X12</strong> is the
          standard (and ASC X12 is the body that maintains it). <strong>5010</strong> and <strong>7030</strong> are{" "}
          <strong>versions</strong> — editions — of that standard. So a healthcare file isn&apos;t &ldquo;X12 or
          5010&rdquo;; it&apos;s <strong>X12 at the 5010 version</strong>. Think of X12 as the language and 5010 as the
          edition of the dictionary everyone agreed to use.
        </p>
      </ArticleSection>

      <ArticleSection title="X12 — the standard">
        <p>
          X12 is the framework for electronic data interchange used across many industries — healthcare, insurance,
          supply chain, finance. It defines the envelope (<Seg>ISA</Seg>/<Seg>GS</Seg>/<Seg>ST</Seg>), the segment and
          element structure, and the transaction sets themselves (the 837, 835, 834, and hundreds more). Every file
          you&apos;ll read is X12; the version just tells you which edition of its rules applies. If you&apos;re new to
          the structure, start with{" "}
          <Link href="/blog/anatomy-of-an-x12-file" className="font-medium text-accent underline-offset-2 hover:underline">
            anatomy of an X12 file
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="5010 — the version healthcare runs on">
        <p>
          <strong>5010</strong> — written <Seg>005010</Seg> — is the version of X12 that HIPAA mandates for healthcare
          transactions. The industry moved from the older <strong>4010</strong> to 5010, with compliance required as of
          <strong> January 2012</strong>. The jump mattered: 5010 brought clearer implementation guides, room for
          fields that 4010 couldn&apos;t hold, the readiness needed for ICD-10 diagnosis codes, and the{" "}
          <Link href="/blog/999-vs-997-vs-ta1" className="font-medium text-accent underline-offset-2 hover:underline">
            999 acknowledgment in place of the 997
          </Link>
          . In practice, essentially every production healthcare EDI file today is 5010.
        </p>
      </ArticleSection>

      <ArticleSection title="7030 — approved, not yet mandated">
        <p>
          <strong>7030</strong> (<Seg>007030</Seg>) is a newer version of the X12 standard that has been approved by
          ASC X12. But approval by the standards body is not the same as a HIPAA mandate — and until regulators name a
          new mandated version, healthcare keeps running on 5010. So you may hear about 7030 in forward-looking work or
          pilots, but you should expect to read 5010 in production for the foreseeable future. The practical takeaway:
          know 7030 exists, build for 5010.
        </p>
      </ArticleSection>

      <ArticleSection title="Where the version is declared">
        <p>
          You don&apos;t have to guess a file&apos;s version — it&apos;s stated in the envelope, in two places:
        </p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {[
            ["ISA12", "The interchange control version — a short code like 00501 for the 5010 release, in the ISA header."],
            ["GS08", "The functional group's version/industry identifier — the full string, e.g. 005010X222A1, which also pins the implementation guide (here, the 837P)."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[6rem_1fr] gap-4 py-3">
              <dt className="font-mono text-sm font-semibold text-accent">{k}</dt>
              <dd className="text-sm text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <p>
          The <Seg>GS08</Seg> string is the richest: <Seg>005010</Seg> is the version, <Seg>X222</Seg> is the
          implementation guide, and a suffix like <Seg>A1</Seg> is the addenda. Reading it tells you the version{" "}
          <em>and</em> the exact transaction flavor in one go.
        </p>
      </ArticleSection>

      <ArticleSection title="X12 vs 5010 vs 7030, side by side">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink text-left">
                <th className="py-2 pr-4 font-semibold text-ink">Aspect</th>
                <th className="py-2 pr-4 font-semibold text-ink">X12</th>
                <th className="py-2 pr-4 font-semibold text-ink">5010</th>
                <th className="py-2 font-semibold text-ink">7030</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ROWS.map((r) => (
                <tr key={r[0]}>
                  <td className="py-2 pr-4 font-medium text-ink align-top">{r[0]}</td>
                  <td className="py-2 pr-4 text-muted align-top">{r[1]}</td>
                  <td className="py-2 pr-4 text-muted align-top">{r[2]}</td>
                  <td className="py-2 text-muted align-top">{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ArticleSection>

      <ArticleSection title="Why the version matters in practice">
        <p>
          The version isn&apos;t trivia — it changes how a file is built and validated. A payer&apos;s system expects a
          specific version and implementation guide, and a file at the wrong version (or a guide it doesn&apos;t
          support) gets rejected at the door, often on a TA1 or 999. When two trading partners disagree about the
          version, claims simply don&apos;t flow until it&apos;s reconciled.
        </p>
        <p>
          The version also dictates the <strong>rules</strong> a validator applies. The same 837 that passes under one
          implementation guide can fail under another if a field that was situational becomes required, or a code set
          changes. That&apos;s why a viewer that validates &ldquo;against 5010&rdquo; is making a specific claim: it
          knows the 5010 rules and checks your file against them, not against generic X12 syntax.
        </p>
      </ArticleSection>

      <ArticleSection title="Reading a version string you don't recognize">
        <p>
          When you see an unfamiliar implementation reference in the <Seg>GS08</Seg>, break it into its parts. Take{" "}
          <Seg>005010X223A2</Seg>: <Seg>005010</Seg> is the version (5010), <Seg>X223</Seg> is the implementation guide
          (the institutional 837), and <Seg>A2</Seg> is the addenda revision. The leading six digits tell you the
          edition; the <Seg>X</Seg>-code tells you the exact transaction flavor; the suffix tells you which round of
          corrections applies. Read left to right and the string stops being cryptic.
        </p>
        <p>
          If the leading digits aren&apos;t <Seg>005010</Seg>, you&apos;re looking at a different edition — older{" "}
          <Seg>004010</Seg> in legacy systems, or <Seg>007030</Seg> in forward-looking work — and you should expect
          different rules to apply.
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

      <ArticleSection title="Check the version of your own file">
        <p>
          {SITE_NAME} reads the <Seg>ISA12</Seg> and <Seg>GS08</Seg> for you, identifies the version and implementation
          guide, and validates the content against 5010 rules — so you know at a glance what you&apos;re holding. The
          file is parsed entirely in your browser; nothing is uploaded.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open a file in EDIAnalyst →
          </Link>{" "}
          ·{" "}
          <Link href="/blog/anatomy-of-an-x12-file" className="font-medium text-accent underline-offset-2 hover:underline">
            Anatomy of an X12 file →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
