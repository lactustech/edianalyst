import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("999-vs-997-vs-ta1")!;

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
  ["What it checks", "The interchange envelope (ISA/IEA)", "The functional group's syntax", "The functional group's syntax (implementation-aware)"],
  ["Level", "Interchange", "Functional group / transaction set", "Functional group / transaction set"],
  ["Era", "Always (envelope-level)", "Older — X12 4010", "Current — X12 5010"],
  ["Detail", "Accept/reject + a coarse error code", "Segment & element errors (AK3/AK4)", "Segment & element errors (IK3/IK4) with implementation rules"],
  ["HIPAA 5010", "Still used for the envelope", "Replaced by the 999", "Mandated functional acknowledgment"],
];

const FAQ = [
  {
    q: "What's the difference between a 999 and a 997?",
    a: "Both are functional acknowledgments that report whether a transaction set's syntax was accepted or rejected. The 997 is the older version (X12 4010); the 999 is the current one used under HIPAA 5010. The 999 is implementation-aware — it can flag violations of the implementation guide, not just base X12 syntax — and uses IK3/IK4 error segments instead of the 997's AK3/AK4.",
  },
  {
    q: "What is a TA1?",
    a: "The TA1 is an interchange acknowledgment. It checks the outermost envelope — the ISA/IEA wrapper — for problems like a bad control number or a malformed interchange. It operates a level above the 997/999, which look inside at the functional group.",
  },
  {
    q: "Why does 5010 use the 999 instead of the 997?",
    a: "5010 introduced implementation guides (the X222, X223, etc.) with rules beyond base X12 syntax. The 999 was designed to acknowledge against those implementation rules, so HIPAA 5010 adopted it as the functional acknowledgment in place of the 997.",
  },
  {
    q: "Will I still see a TA1 under 5010?",
    a: "Yes. The TA1 acknowledges the interchange envelope and is still used alongside the 999. A typical flow is: TA1 for the envelope, then a 999 for the functional group, then a 277CA for the claims inside an 837.",
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
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "999 vs 997 vs TA1" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="999 vs 997 vs TA1: which acknowledgment is which"
      intro="After you send an X12 file, you can get back up to three different acknowledgments — and they check different layers. Here's what the TA1, 997, and 999 each accept or reject, why HIPAA 5010 moved to the 999, and how to read each one."
      published={post.published}
      description={post.metaDescription}
    >
      <JsonLd data={faqLd} />

      <ArticleSection title="Three acknowledgments, three layers">
        <p>
          An X12 file is built in nested layers — an interchange envelope (<Seg>ISA</Seg>/<Seg>IEA</Seg>) wraps one or
          more functional groups (<Seg>GS</Seg>/<Seg>GE</Seg>), which wrap transaction sets (<Seg>ST</Seg>/<Seg>SE</Seg>).
          The three acknowledgments map onto those layers: the <strong>TA1</strong> checks the envelope, while the{" "}
          <strong>997</strong> and <strong>999</strong> check the functional group inside it. Knowing which one you
          received tells you <em>where</em> something went wrong before you even read the detail.
        </p>
      </ArticleSection>

      <ArticleSection title="TA1 — the interchange acknowledgment">
        <p>
          The <strong>TA1</strong> is the outermost check. It validates the interchange envelope — the{" "}
          <Seg>ISA</Seg>/<Seg>IEA</Seg> wrapper — for things like a malformed interchange, an invalid control number,
          or mismatched sender/receiver IDs. A TA1 reject means the envelope itself was wrong, so nothing inside could
          even be read. It&apos;s coarse by design: it tells you the package was undeliverable, not what was wrong with
          the contents.
        </p>
      </ArticleSection>

      <ArticleSection title="997 — the original functional acknowledgment">
        <p>
          The <strong>997</strong> is the classic functional acknowledgment from the X12 4010 era. It reports whether a
          functional group and its transaction sets were syntactically accepted or rejected, pinpointing segment errors
          (<Seg>AK3</Seg>) and element errors (<Seg>AK4</Seg>). It checks <strong>base X12 syntax</strong> — required
          segments, valid data types, correct structure — but it doesn&apos;t know about implementation-guide rules.
          You&apos;ll still encounter 997s in plenty of non-healthcare and legacy exchanges.
        </p>
      </ArticleSection>

      <ArticleSection title="999 — the implementation acknowledgment">
        <p>
          The <strong>999</strong> is the current functional acknowledgment under HIPAA 5010. It does everything the 997
          does and adds <strong>implementation-guide awareness</strong>: it can flag violations of the 5010
          implementation guides (the X222, X223, and so on), not just base X12 syntax. It reports segment errors in{" "}
          <Seg>IK3</Seg> and element errors in <Seg>IK4</Seg>, with the per-transaction result in <Seg>IK5</Seg> and the
          group result in <Seg>AK9</Seg>. That&apos;s why a 999 can reject a file the 997 would have passed — it&apos;s
          checking against a stricter, healthcare-specific rulebook. For the full walk-through, see{" "}
          <Link href="/blog/read-a-999-why-837-rejected" className="font-medium text-accent underline-offset-2 hover:underline">
            how to read a 999
          </Link>{" "}
          and the{" "}
          <Link href="/edi/999/error-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            999 error-codes reference
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="Why 5010 mandates the 999">
        <p>
          The move from 4010 to 5010 didn&apos;t just change the transactions — it formalized{" "}
          <strong>implementation guides</strong> that layer healthcare-specific rules on top of base X12. The 997 had no
          way to acknowledge against those rules. The 999 was built to, so HIPAA 5010 adopted it as the functional
          acknowledgment. In practice, in a 5010 healthcare exchange you get a <strong>999</strong>, not a 997, for the
          functional group — with the <strong>TA1</strong> still handling the envelope above it.
        </p>
      </ArticleSection>

      <ArticleSection title="TA1 vs 997 vs 999, side by side">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink text-left">
                <th className="py-2 pr-4 font-semibold text-ink">Aspect</th>
                <th className="py-2 pr-4 font-semibold text-ink">TA1</th>
                <th className="py-2 pr-4 font-semibold text-ink">997</th>
                <th className="py-2 font-semibold text-ink">999</th>
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

      <ArticleSection title="How to read each one">
        <p>The mental model when an acknowledgment comes back:</p>
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li><span className="text-ink">TA1 rejected?</span> The envelope is broken — check your <Seg>ISA</Seg>/<Seg>IEA</Seg> control numbers and IDs. Nothing inside was processed.</li>
          <li><span className="text-ink">997/999 rejected?</span> The envelope was fine, but a transaction set failed syntax or implementation rules — read the <Seg>AK3/AK4</Seg> (997) or <Seg>IK3/IK4</Seg> (999) to find the segment and element.</li>
          <li><span className="text-ink">999 accepted, but claims still denied?</span> Syntax passed; the business decision comes later on a 277CA or 835.</li>
        </ul>
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

      <ArticleSection title="Decode an acknowledgment in seconds">
        <p>
          {SITE_NAME} reads a 999 and decodes every <Seg>IK3</Seg> segment error and <Seg>IK4</Seg> element error into
          plain English — the exact segment and rule that rejected your batch. Paste a 999 and see what failed; it&apos;s
          parsed entirely in your browser, nothing uploaded.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open a 999 in EDIAnalyst →
          </Link>{" "}
          ·{" "}
          <Link href="/blog/read-a-999-why-837-rejected" className="font-medium text-accent underline-offset-2 hover:underline">
            How to read a 999 →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
