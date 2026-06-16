import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleShell } from "../../../../../components/ArticleShell";
import { JsonLd } from "../../../../../components/JsonLd";
import {
  CATEGORIES,
  codeLabel,
  codeSlug,
  DENIAL_CODES,
  getDenialCode,
  GROUP_CODES,
  relatedCodes,
  type DenialCode,
  type GroupCode,
} from "../../../../../lib/denial-codes";
import { clamp, og, twitter } from "../../../../../lib/seo";
import { SITE_NAME } from "../../../../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return DENIAL_CODES.map((c) => ({ code: "835", carc: codeSlug(c) }));
}

function codePath(c: DenialCode): string {
  return `/edi/835/denial-codes/${codeSlug(c)}`;
}

/** "denial code" for a CARC, "remark code" for a RARC — used in the H1 and title. */
function kindWord(c: DenialCode): string {
  return c.system === "CARC" ? "denial code" : "remark code";
}

/** First clause of the short description, kept tidy for the <title> tail. */
function titleClause(c: DenialCode): string {
  const s = c.short.replace(/\.$/, "").trim();
  const clause = (s.split(/[,;(]|—/)[0] ?? s).trim();
  return clamp(clause, 34);
}

function metaTitle(c: DenialCode): string {
  return `${codeLabel(c)} ${kindWord(c)} — ${titleClause(c)}`;
}

function metaDescription(c: DenialCode): string {
  return clamp(`${codeLabel(c)} on an 835 remittance: ${c.plain} What to do: ${c.fix}`, 158);
}

export function generateMetadata({ params }: { params: { carc: string } }): Metadata {
  const c = getDenialCode(params.carc);
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

/** FAQ schema only — the breadcrumb is emitted by ArticleShell from its crumbs. */
function faqLd(c: DenialCode) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What does ${codeLabel(c)} mean?`, acceptedAnswer: { "@type": "Answer", text: c.plain } },
      { "@type": "Question", name: `Why did I get ${codeLabel(c)}?`, acceptedAnswer: { "@type": "Answer", text: c.why } },
      { "@type": "Question", name: `How do I fix ${codeLabel(c)}?`, acceptedAnswer: { "@type": "Answer", text: c.fix } },
    ],
  };
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 border-t border-ink pt-6 text-sm font-semibold uppercase tracking-wide text-ink">{children}</h2>;
}

export default function DenialCodePage({ params }: { params: { carc: string } }) {
  const c = getDenialCode(params.carc);
  if (!c) notFound();

  const groups: GroupCode[] = [c.group, ...(c.alsoGroups ?? [])].filter(Boolean) as GroupCode[];
  const sysName = c.system === "CARC" ? "Claim Adjustment Reason Code (CARC)" : "Remittance Advice Remark Code (RARC)";
  const related = relatedCodes(c);

  return (
    <>
      <JsonLd data={faqLd(c)} />
      <ArticleShell
        crumbs={[
          { label: "Home", href: "/" },
          { label: "835 ERA", href: "/edi/835" },
          { label: "Denial codes", href: "/edi/835/denial-codes" },
          { label: codeLabel(c) },
        ]}
        path={codePath(c)}
        kicker={`${sysName} · ${CATEGORIES[c.category].label}`}
        title={`${codeLabel(c)} ${kindWord(c)}`}
        intro={c.short}
      >
        <H2>What {codeLabel(c)} means</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.plain}</p>

        <H2>Why you got it</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.why}</p>

        <H2>How to resolve it</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.fix}</p>

        {c.system === "CARC" && groups.length > 0 && (
          <>
            <H2>The group code{groups.length > 1 ? "s" : ""} you&apos;ll see this with</H2>
            <p className="mt-4 text-sm text-muted">
              On an 835, {c.code} is reported as <span className="font-mono text-ink">{codeLabel(c)}</span>
              {groups.length > 1 ? " (and other group codes). " : ". "}
              The group code decides who owns the amount:
            </p>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {groups.map((g) => (
                <div key={g} className="grid grid-cols-[6rem_1fr] gap-4 py-3">
                  <dt className="font-mono text-sm font-semibold text-accent">{g}-{c.code}</dt>
                  <dd className="text-sm text-muted">
                    <span className="font-medium text-ink">{GROUP_CODES[g].label}.</span> {GROUP_CODES[g].blurb}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}

        {/* CTA into the tool */}
        <section className="mt-12 border border-accent bg-accent-soft p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">See it in your own 835</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {SITE_NAME} decodes every {codeLabel(c)} and other CARC/RARC right next to the claim it belongs to — with
            balancing checked automatically. Drop your remittance in; it&apos;s parsed entirely in your browser, nothing
            uploaded.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-fg transition-colors hover:bg-ink"
          >
            Open an 835 →
          </Link>
        </section>

        <H2>Related codes</H2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {related.map((r) => (
            <li key={r.code}>
              <Link href={codePath(r)} className="group grid grid-cols-[6rem_1fr] items-baseline gap-4 py-3">
                <span className="font-mono text-sm font-semibold text-accent">{codeLabel(r)}</span>
                <span className="text-sm text-muted group-hover:text-ink">{r.short}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm">
          <Link href="/edi/835/denial-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            ← Back to all 835 denial codes
          </Link>
        </p>
      </ArticleShell>
    </>
  );
}
