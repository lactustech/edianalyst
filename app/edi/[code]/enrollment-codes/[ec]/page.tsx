import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleShell } from "../../../../../components/ArticleShell";
import { JsonLd } from "../../../../../components/JsonLd";
import {
  codeLabel,
  codePhrase,
  codeSlug,
  ENROLL_CODES,
  ENROLL_KINDS,
  getEnrollCode,
  relatedCodes,
  type EnrollCode,
} from "../../../../../lib/enrollment-codes";
import { clamp, og, twitter } from "../../../../../lib/seo";
import { SITE_NAME } from "../../../../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return ENROLL_CODES.map((c) => ({ code: "834", ec: codeSlug(c) }));
}

function codePath(c: EnrollCode): string {
  return `/edi/834/enrollment-codes/${codeSlug(c)}`;
}

function metaTitle(c: EnrollCode): string {
  return `834 ${codePhrase(c)} — ${clamp(c.name, 34)}`;
}

function metaDescription(c: EnrollCode): string {
  return clamp(`834 ${codePhrase(c)} (${ENROLL_KINDS[c.kind].element}): ${c.name}. ${c.plain}`, 158);
}

export function generateMetadata({ params }: { params: { ec: string } }): Metadata {
  const c = getEnrollCode(params.ec);
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

function faqLd(c: EnrollCode) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What is 834 ${codePhrase(c)}?`, acceptedAnswer: { "@type": "Answer", text: `${c.name}. ${c.plain}` } },
      { "@type": "Question", name: `How is it used in an 834?`, acceptedAnswer: { "@type": "Answer", text: c.use } },
    ],
  };
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 border-t border-ink pt-6 text-sm font-semibold uppercase tracking-wide text-ink">{children}</h2>;
}

export default function EnrollmentCodePage({ params }: { params: { ec: string } }) {
  const c = getEnrollCode(params.ec);
  if (!c) notFound();

  const meta = ENROLL_KINDS[c.kind];
  const related = relatedCodes(c);

  return (
    <>
      <JsonLd data={faqLd(c)} />
      <ArticleShell
        crumbs={[
          { label: "Home", href: "/" },
          { label: "834 enrollment", href: "/edi/834" },
          { label: "Enrollment codes", href: "/edi/834/enrollment-codes" },
          { label: codeLabel(c) },
        ]}
        path={codePath(c)}
        kicker={`${meta.label} · ${meta.element}`}
        title={`834 ${codePhrase(c)}`}
        intro={`${c.name} — ${c.plain}`}
      >
        <H2>What it means</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.plain}</p>

        <H2>How it&apos;s used in an 834</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.use}</p>

        <H2>What to check</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.tip}</p>

        <H2>Where it appears</H2>
        <p className="mt-4 text-sm text-muted">
          <span className="font-mono text-ink">{codeLabel(c)}</span> is a <strong>{meta.label.toLowerCase()}</strong>{" "}
          value, reported in the <span className="font-mono text-ink">{meta.element}</span> element of the 834.
        </p>

        {/* CTA into the tool */}
        <section className="mt-12 border border-accent bg-accent-soft p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Read your own 834</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {SITE_NAME} turns every member into one clean row — name, ID, demographics, and coverage — with the
            maintenance type as a color-coded badge, and can diff two files. Drop your 834 in; it&apos;s parsed entirely
            in your browser, nothing uploaded.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-fg transition-colors hover:bg-ink"
          >
            Open an 834 →
          </Link>
        </section>

        <H2>Related codes</H2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {related.map((r) => (
            <li key={codeSlug(r)}>
              <Link href={codePath(r)} className="group grid grid-cols-[4rem_1fr] items-baseline gap-4 py-3">
                <span className="font-mono text-sm font-semibold text-accent">{codeLabel(r)}</span>
                <span className="text-sm text-muted group-hover:text-ink">{r.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm">
          <Link href="/edi/834/enrollment-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            ← Back to all 834 enrollment codes
          </Link>
        </p>
      </ArticleShell>
    </>
  );
}
