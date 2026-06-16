import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("read-a-999-why-837-rejected")!;

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
    q: "What's the difference between a 999 and a 277CA?",
    a: "A 999 checks syntax — did the file conform to the X12 implementation guide? A 277CA checks the claim itself — was it accepted for adjudication? A batch can pass the 999 and still be rejected on the 277CA, so you need to read both.",
  },
  {
    q: "Does a 999 rejection mean I should appeal?",
    a: "No. A 999 rejection is a format problem, not a payment decision. You correct the syntax error it points to and resend the file — there's nothing to appeal.",
  },
  {
    q: "Where exactly is the error in the file?",
    a: "Follow the IK3 (segment in error, with its position) down to the IK4 (the data element in error). Together with the IK304 and IK403 reason codes, they name the precise segment and field to fix.",
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
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "Read a 999" }]}
        path={`/blog/${post.slug}`}
        kicker={post.kicker}
        title="How to read a 999 and decode exactly why your 837 rejected"
        intro="A 999 tells you whether the batch you sent was accepted or rejected — and pinpoints the syntax error. Here's how to read one top-down and land on the exact segment and field that failed."
        published={post.published}
        description={post.metaDescription}
      >
        <ArticleSection title="What a 999 is (and isn't)">
          <p>
            A 999 (Implementation Acknowledgment) answers one question: <em>did the file I sent conform to the
            implementation guide?</em> It checks <strong>syntax and structure</strong> — segment order, required
            elements, valid code values — not whether the claims will be paid. A batch can pass the 999 cleanly and
            still be rejected later on a{" "}
            <Link href="/edi/277" className="font-medium text-accent underline-offset-2 hover:underline">
              277CA
            </Link>{" "}
            for a claim-level problem. So a 999 rejection means &ldquo;fix the file format and resend,&rdquo; not
            &ldquo;appeal.&rdquo;
          </p>
          <p>
            It helps to know where the 999 sits among the three acknowledgments you might get back after submitting an
            837. The <strong>TA1</strong> checks the interchange envelope (the <Seg>ISA</Seg>/<Seg>IEA</Seg> wrapper).
            The <strong>999</strong> checks the functional group&apos;s syntax — that&apos;s this document. The{" "}
            <strong>277CA</strong> then accepts or rejects each individual claim for adjudication. Reading them in that
            order tells you how far your file got before something stopped it.
          </p>
        </ArticleSection>

        <ArticleSection title="Read it top-down">
          <p>A 999 nests from the group result down to the exact element. Follow the trail:</p>
          <dl className="mt-2 divide-y divide-line border-y border-line">
            {[
              ["AK1", "Identifies the functional group being acknowledged (e.g. the 837 batch) and its control number."],
              ["AK2", "Identifies the specific transaction set within the group."],
              ["IK3", "Names a segment in error — the segment ID, its position, and the loop it's in — with an IK304 reason code."],
              ["CTX", "Context that pins the error to a business unit (e.g. which claim or billing provider) when present."],
              ["IK4", "Names the data element in error within that segment, with an IK403 reason code."],
              ["IK5", "The per-transaction result: Accepted (A), Accepted with errors (E), or Rejected (R)."],
              ["AK9", "The overall functional-group result and the count of transaction sets accepted vs. rejected."],
            ].map(([seg, desc]) => (
              <div key={seg} className="grid grid-cols-[4.5rem_1fr] gap-4 py-3">
                <dt className="font-mono text-sm font-semibold text-accent">{seg}</dt>
                <dd className="text-sm text-muted">{desc}</dd>
              </div>
            ))}
          </dl>
          <p>
            Practically: start at <Seg>AK9</Seg>/<Seg>IK5</Seg> for the verdict, then read each <Seg>IK3</Seg>/
            <Seg>IK4</Seg> pair to find <em>what</em> and <em>where</em>. The <Seg>AK9</Seg> and <Seg>IK5</Seg> share the
            same status letters — <Seg>A</Seg> accepted, <Seg>E</Seg> accepted with errors, <Seg>R</Seg> rejected, and{" "}
            <Seg>P</Seg> partially accepted at the group level — so one glance tells you whether anything got through.
          </p>
        </ArticleSection>

        <ArticleSection title="Decoding the error codes">
          <p>
            The reason lives in two code sets. <Seg>IK304</Seg> on the <Seg>IK3</Seg> gives the{" "}
            <strong>segment</strong> problem; <Seg>IK403</Seg> on the <Seg>IK4</Seg> gives the <strong>element</strong>{" "}
            problem. The ones you&apos;ll hit most:
          </p>
          <ul className="ml-5 list-disc space-y-1.5 text-sm">
            <li>
              <Link href="/edi/999/error-codes/ik304-3" className="font-medium text-accent underline-offset-2 hover:underline">IK304:3</Link>{" "}
              — a required segment is missing.
            </li>
            <li>
              <Link href="/edi/999/error-codes/ik304-8" className="font-medium text-accent underline-offset-2 hover:underline">IK304:8</Link>{" "}
              — the segment has data element errors (read the IK4s below it).
            </li>
            <li>
              <Link href="/edi/999/error-codes/ik403-7" className="font-medium text-accent underline-offset-2 hover:underline">IK403:7</Link>{" "}
              — invalid code value (the single most common element error).
            </li>
            <li>
              <Link href="/edi/999/error-codes/ik403-1" className="font-medium text-accent underline-offset-2 hover:underline">IK403:1</Link>{" "}
              — a required data element is missing.
            </li>
            <li>
              <Link href="/edi/999/error-codes/ik403-8" className="font-medium text-accent underline-offset-2 hover:underline">IK403:8</Link>{" "}
              — an invalid date (a malformed or impossible date value).
            </li>
          </ul>
          <p>
            Every code is decoded on the{" "}
            <Link href="/edi/999/error-codes" className="font-medium text-accent underline-offset-2 hover:underline">
              999 error-codes reference
            </Link>
            .
          </p>
        </ArticleSection>

        <ArticleSection title="A worked example">
          <p>
            Say your 837 comes back <Seg>IK5*R</Seg> (rejected) with <Seg>IK3*CLM*42**8</Seg> and{" "}
            <Seg>IK4*2*1028*7</Seg>. Read it as: the 42nd <Seg>CLM</Seg> segment has element errors
            (<Seg>IK304</Seg> = 8), and specifically the 2nd element used an invalid code value (<Seg>IK403</Seg> = 7).
            You&apos;d jump to that claim&apos;s <Seg>CLM</Seg> segment, fix the bad code in element 2 (for{" "}
            <Seg>CLM05</Seg> that&apos;s often a wrong facility/place-of-service code), and resend the corrected batch.
          </p>
          <p>
            The pattern generalizes: an <Seg>IK304</Seg> of 8 always means &ldquo;look at the IK4s below me for the real
            problem,&rdquo; while a standalone segment error like <Seg>IK304</Seg> = 3 (required segment missing) is the
            whole story by itself.
          </p>
        </ArticleSection>

        <ArticleSection title="Preventing the next rejection">
          <p>
            Most 999 rejections trace back to a handful of habits: stale code values that were valid last year but
            retired (invalid code value), dates that fail validation (a CCYYMMDD typo or a date that doesn&apos;t exist),
            required fields left blank when a situational rule made them mandatory, and segments sent out of order by a
            template change. When a 999 flags one of these, fix it at the source — the template or the field mapping —
            not just on the one claim, so the same error doesn&apos;t come back next batch.
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

        <ArticleSection title="Read your 999 without the manual decoding">
          <p>
            {SITE_NAME} reads the <Seg>AK9</Seg>/<Seg>IK5</Seg> result and turns every <Seg>IK3</Seg> segment error and{" "}
            <Seg>IK4</Seg> element error into plain English — exactly which segment and field to fix. Drop your 999 in;
            it&apos;s parsed entirely in your browser, nothing uploaded.
          </p>
          <p>
            <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
              Open a 999 in EDIAnalyst →
            </Link>{" "}
            ·{" "}
            <Link href="/edi/999/error-codes" className="font-medium text-accent underline-offset-2 hover:underline">
              Browse all 999 error codes →
            </Link>
          </p>
        </ArticleSection>
      </ArticleShell>
    </>
  );
}
