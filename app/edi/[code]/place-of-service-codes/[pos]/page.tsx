import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleShell } from "../../../../../components/ArticleShell";
import { JsonLd } from "../../../../../components/JsonLd";
import {
  codeLabel,
  codeSlug,
  getPosCode,
  POS_CODES,
  relatedCodes,
  type PosCode,
} from "../../../../../lib/place-of-service-codes";
import { clamp, og, twitter } from "../../../../../lib/seo";
import { SITE_NAME } from "../../../../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return POS_CODES.map((c) => ({ code: "837", pos: codeSlug(c) }));
}

function codePath(c: PosCode): string {
  return `/edi/837/place-of-service-codes/${codeSlug(c)}`;
}

function metaTitle(c: PosCode): string {
  return `Place of service code ${codeLabel(c)} — ${clamp(c.name, 38)}`;
}

function metaDescription(c: PosCode): string {
  return clamp(`Place of service code ${codeLabel(c)} on an 837 claim: ${c.name}. ${c.plain}`, 158);
}

export function generateMetadata({ params }: { params: { pos: string } }): Metadata {
  const c = getPosCode(params.pos);
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

function faqLd(c: PosCode) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What is place of service code ${codeLabel(c)}?`, acceptedAnswer: { "@type": "Answer", text: `${c.name}. ${c.plain}` } },
      { "@type": "Question", name: `When is POS ${codeLabel(c)} used?`, acceptedAnswer: { "@type": "Answer", text: c.use } },
    ],
  };
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 border-t border-ink pt-6 text-sm font-semibold uppercase tracking-wide text-ink">{children}</h2>;
}

export default function PlaceOfServicePage({ params }: { params: { pos: string } }) {
  const c = getPosCode(params.pos);
  if (!c) notFound();

  const related = relatedCodes(c);

  return (
    <>
      <JsonLd data={faqLd(c)} />
      <ArticleShell
        crumbs={[
          { label: "Home", href: "/" },
          { label: "837 claim", href: "/edi/837" },
          { label: "Place of service codes", href: "/edi/837/place-of-service-codes" },
          { label: codeLabel(c) },
        ]}
        path={codePath(c)}
        kicker="Place of Service Code · CMS"
        title={`Place of service ${codeLabel(c)}: ${c.name}`}
        intro={c.plain}
      >
        <H2>What place of service {codeLabel(c)} means</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.plain}</p>

        <H2>When it&apos;s used</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.use}</p>

        <H2>What to check</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.tip}</p>

        <H2>Where it appears</H2>
        <p className="mt-4 text-sm text-muted">
          Place of service <span className="font-mono text-ink">{codeLabel(c)}</span> is reported on the 837 at the
          claim level in <span className="font-mono text-ink">CLM05-1</span> and per service line in{" "}
          <span className="font-mono text-ink">SV105</span>. A mismatch between the procedure and the place of service
          is a common denial — see{" "}
          <Link href="/edi/835/denial-codes/co-5" className="font-medium text-accent underline-offset-2 hover:underline">
            CO-5
          </Link>
          .
        </p>

        {/* CTA into the tool */}
        <section className="mt-12 border border-accent bg-accent-soft p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Read your own 837</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {SITE_NAME} flattens an 837 into one row per claim and shows the place of service alongside the diagnoses and
            service lines. Drop your claim in; it&apos;s parsed entirely in your browser, nothing uploaded.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-fg transition-colors hover:bg-ink"
          >
            Open an 837 →
          </Link>
        </section>

        <H2>Related place of service codes</H2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {related.map((r) => (
            <li key={r.code}>
              <Link href={codePath(r)} className="group grid grid-cols-[3.5rem_1fr] items-baseline gap-4 py-3">
                <span className="font-mono text-sm font-semibold text-accent">{codeLabel(r)}</span>
                <span className="text-sm text-muted group-hover:text-ink">{r.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm">
          <Link href="/edi/837/place-of-service-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            ← Back to all place of service codes
          </Link>
        </p>
      </ArticleShell>
    </>
  );
}
