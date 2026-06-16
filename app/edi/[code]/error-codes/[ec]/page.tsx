import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleShell } from "../../../../../components/ArticleShell";
import { JsonLd } from "../../../../../components/JsonLd";
import {
  ACK_CODES,
  ACK_KINDS,
  codeLabel,
  codePhrase,
  codeSlug,
  getAckCode,
  relatedCodes,
  type AckCode,
} from "../../../../../lib/codes-999";
import { clamp, og, twitter } from "../../../../../lib/seo";
import { SITE_NAME } from "../../../../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return ACK_CODES.map((c) => ({ code: "999", ec: codeSlug(c) }));
}

function codePath(c: AckCode): string {
  return `/edi/999/error-codes/${codeSlug(c)}`;
}

function metaTitle(c: AckCode): string {
  return `999 ${codePhrase(c)} — ${clamp(c.short.replace(/\.$/, ""), 34)}`;
}

function metaDescription(c: AckCode): string {
  return clamp(`999 ${codePhrase(c)}: ${c.plain} What to do: ${c.fix}`, 158);
}

export function generateMetadata({ params }: { params: { ec: string } }): Metadata {
  const c = getAckCode(params.ec);
  if (!c) return {};
  const title = metaTitle(c);
  const description = metaDescription(c);
  const path = codePath(c);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: og({ title, description, path }),
    twitter: twitter({ title, description }),
  };
}

function faqLd(c: AckCode) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What does 999 ${codePhrase(c)} mean?`, acceptedAnswer: { "@type": "Answer", text: c.plain } },
      { "@type": "Question", name: `Why did I get it?`, acceptedAnswer: { "@type": "Answer", text: c.why } },
      { "@type": "Question", name: `How do I fix it?`, acceptedAnswer: { "@type": "Answer", text: c.fix } },
    ],
  };
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 border-t border-ink pt-6 text-sm font-semibold uppercase tracking-wide text-ink">{children}</h2>;
}

export default function ErrorCodePage({ params }: { params: { ec: string } }) {
  const c = getAckCode(params.ec);
  if (!c) notFound();

  const meta = ACK_KINDS[c.kind];
  const related = relatedCodes(c);

  return (
    <>
      <JsonLd data={faqLd(c)} />
      <ArticleShell
        crumbs={[
          { label: "Home", href: "/" },
          { label: "999 acknowledgment", href: "/edi/999" },
          { label: "Error codes", href: "/edi/999/error-codes" },
          { label: codeLabel(c) },
        ]}
        path={codePath(c)}
        kicker={`${meta.label} · reported in ${meta.segment}`}
        title={`999 ${codePhrase(c)}`}
        intro={c.short}
      >
        <H2>What it means</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.plain}</p>

        <H2>Why you got it</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.why}</p>

        <H2>How to fix it</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.fix}</p>

        <H2>Where it appears</H2>
        <p className="mt-4 text-sm text-muted">
          This is {c.kind === "ack" ? "an" : "a"} <strong>{meta.label.toLowerCase()}</strong> reported in the{" "}
          <span className="font-mono text-ink">{meta.segment}</span> element of the 999
          {c.kind === "ack"
            ? " — the overall accept/reject result for the transaction set or functional group."
            : c.kind === "segment"
              ? `, naming a segment-level problem. Code ${c.code} is reported as the IK304 value on the IK3 segment in error.`
              : `, naming a data-element-level problem. Code ${c.code} is reported as the IK403 value on the IK4 element in error.`}
        </p>

        {/* CTA into the tool */}
        <section className="mt-12 border border-accent bg-accent-soft p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">See it in your own 999</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {SITE_NAME} reads the AK9/IK5 result and decodes every IK3 segment and IK4 element error into plain English —
            the exact segment and field to fix. Drop your 999 in; it&apos;s parsed entirely in your browser, nothing
            uploaded.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-fg transition-colors hover:bg-ink"
          >
            Open a 999 →
          </Link>
        </section>

        <H2>Related codes</H2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {related.map((r) => (
            <li key={codeSlug(r)}>
              <Link href={codePath(r)} className="group grid grid-cols-[5.5rem_1fr] items-baseline gap-4 py-3">
                <span className="font-mono text-sm font-semibold text-accent">{codeLabel(r)}</span>
                <span className="text-sm text-muted group-hover:text-ink">{r.short}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm">
          <Link href="/edi/999/error-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            ← Back to all 999 error codes
          </Link>
        </p>
      </ArticleShell>
    </>
  );
}
