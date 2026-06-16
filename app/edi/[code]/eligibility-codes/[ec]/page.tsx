import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleShell } from "../../../../../components/ArticleShell";
import { JsonLd } from "../../../../../components/JsonLd";
import {
  codeLabel,
  codePhrase,
  codeSlug,
  ELIG_CODES,
  ELIG_KINDS,
  getEligCode,
  relatedCodes,
  type EligCode,
} from "../../../../../lib/eligibility-codes";
import { clamp, og, twitter } from "../../../../../lib/seo";
import { SITE_NAME } from "../../../../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return ELIG_CODES.map((c) => ({ code: "271", ec: codeSlug(c) }));
}

function codePath(c: EligCode): string {
  return `/edi/271/eligibility-codes/${codeSlug(c)}`;
}

function metaTitle(c: EligCode): string {
  return `271 ${codePhrase(c)} — ${clamp(c.name, 34)}`;
}

function metaDescription(c: EligCode): string {
  return clamp(`271 ${codePhrase(c)} (${codeLabel(c)}): ${c.name}. ${c.plain}`, 158);
}

export function generateMetadata({ params }: { params: { ec: string } }): Metadata {
  const c = getEligCode(params.ec);
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

function faqLd(c: EligCode) {
  const q2 = c.kind === "benefit" ? `How does ${codeLabel(c)} appear in a 271?` : `Why did I get ${codeLabel(c)}?`;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What is 271 ${codePhrase(c)}?`, acceptedAnswer: { "@type": "Answer", text: `${c.name}. ${c.plain}` } },
      { "@type": "Question", name: q2, acceptedAnswer: { "@type": "Answer", text: c.context } },
      { "@type": "Question", name: `What do I do about it?`, acceptedAnswer: { "@type": "Answer", text: c.action } },
    ],
  };
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 border-t border-ink pt-6 text-sm font-semibold uppercase tracking-wide text-ink">{children}</h2>;
}

export default function EligibilityCodePage({ params }: { params: { ec: string } }) {
  const c = getEligCode(params.ec);
  if (!c) notFound();

  const meta = ELIG_KINDS[c.kind];
  const related = relatedCodes(c);
  const isBenefit = c.kind === "benefit";

  return (
    <>
      <JsonLd data={faqLd(c)} />
      <ArticleShell
        crumbs={[
          { label: "Home", href: "/" },
          { label: "271 eligibility", href: "/edi/271" },
          { label: "Eligibility codes", href: "/edi/271/eligibility-codes" },
          { label: codeLabel(c) },
        ]}
        path={codePath(c)}
        kicker={`${meta.label} · ${meta.element}`}
        title={`271 ${codePhrase(c)}`}
        intro={`${c.name} — ${c.plain}`}
      >
        <H2>What it means</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.plain}</p>

        <H2>{isBenefit ? "How it appears in a 271" : "Why the request was rejected"}</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.context}</p>

        <H2>{isBenefit ? "What to check" : "How to fix it"}</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.action}</p>

        <H2>Where it appears</H2>
        <p className="mt-4 text-sm text-muted">
          <span className="font-mono text-ink">{c.code.toUpperCase()}</span> is {isBenefit ? "an" : "a"}{" "}
          <strong>{meta.label.toLowerCase()}</strong> value, reported in the{" "}
          <span className="font-mono text-ink">{meta.element}</span> element
          {isBenefit
            ? " of an EB benefit line on the 271 response."
            : " of an AAA segment on the 270 request or 271 response."}
        </p>

        {/* CTA into the tool */}
        <section className="mt-12 border border-accent bg-accent-soft p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Read your own 270 / 271</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {SITE_NAME} derives active/inactive per member, decodes every EB benefit line, and surfaces rejects. Drop
            your file in; it&apos;s parsed entirely in your browser, nothing uploaded.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-fg transition-colors hover:bg-ink"
          >
            Open a 270 / 271 →
          </Link>
        </section>

        <H2>Related codes</H2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {related.map((r) => (
            <li key={codeSlug(r)}>
              <Link href={codePath(r)} className="group grid grid-cols-[4.5rem_1fr] items-baseline gap-4 py-3">
                <span className="font-mono text-sm font-semibold text-accent">{codeLabel(r)}</span>
                <span className="text-sm text-muted group-hover:text-ink">{r.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm">
          <Link href="/edi/271/eligibility-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            ← Back to all 271 eligibility & benefit codes
          </Link>
        </p>
      </ArticleShell>
    </>
  );
}
