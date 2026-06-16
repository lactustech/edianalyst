import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleShell } from "../../../../../components/ArticleShell";
import { JsonLd } from "../../../../../components/JsonLd";
import {
  codeLabel,
  codeSlug,
  getServiceType,
  GROUPS,
  relatedCodes,
  SERVICE_TYPES,
  type ServiceType,
} from "../../../../../lib/service-type-codes";
import { clamp, og, twitter } from "../../../../../lib/seo";
import { SITE_NAME } from "../../../../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_TYPES.map((c) => ({ code: "270", st: codeSlug(c) }));
}

function codePath(c: ServiceType): string {
  return `/edi/270/service-type-codes/${codeSlug(c)}`;
}

function metaTitle(c: ServiceType): string {
  return `270 service type code ${codeLabel(c)} — ${clamp(c.name, 34)}`;
}

function metaDescription(c: ServiceType): string {
  return clamp(`Service type code ${codeLabel(c)} on a 270/271 eligibility transaction: ${c.name}. ${c.plain}`, 158);
}

export function generateMetadata({ params }: { params: { st: string } }): Metadata {
  const c = getServiceType(params.st);
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

/** FAQ schema — the breadcrumb is emitted by ArticleShell from its crumbs. */
function faqLd(c: ServiceType) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What is service type code ${codeLabel(c)}?`, acceptedAnswer: { "@type": "Answer", text: `${c.name}. ${c.plain}` } },
      { "@type": "Question", name: `How is ${codeLabel(c)} used in a 270/271?`, acceptedAnswer: { "@type": "Answer", text: c.use } },
    ],
  };
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 border-t border-ink pt-6 text-sm font-semibold uppercase tracking-wide text-ink">{children}</h2>;
}

export default function ServiceTypePage({ params }: { params: { st: string } }) {
  const c = getServiceType(params.st);
  if (!c) notFound();

  const related = relatedCodes(c);

  return (
    <>
      <JsonLd data={faqLd(c)} />
      <ArticleShell
        crumbs={[
          { label: "Home", href: "/" },
          { label: "270 eligibility", href: "/edi/270" },
          { label: "Service type codes", href: "/edi/270/service-type-codes" },
          { label: codeLabel(c) },
        ]}
        path={codePath(c)}
        kicker={`Service Type Code · ${GROUPS[c.group].label}`}
        title={`${codeLabel(c)} ${c.name}`}
        intro={c.plain}
      >
        <H2>What service type {codeLabel(c)} covers</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.plain}</p>

        <H2>How it&apos;s used in a 270 / 271</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.use}</p>

        <H2>What to check</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.tip}</p>

        <H2>Where it appears</H2>
        <p className="mt-4 text-sm text-muted">
          Service type <span className="font-mono text-ink">{codeLabel(c)}</span> is sent in the{" "}
          <span className="font-mono text-ink">EQ01</span> element of a 270 inquiry and returned in the{" "}
          <span className="font-mono text-ink">EB03</span> element of the 271 response, alongside the active/inactive
          status and any copay, coinsurance, deductible, or limits for {c.name.toLowerCase()}.
        </p>

        {/* CTA into the tool */}
        <section className="mt-12 border border-accent bg-accent-soft p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Read your own 270 or 271</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {SITE_NAME} lists every member and the service types in question, and decodes the 271 benefits into a clean
            table. Drop your file in; it&apos;s parsed entirely in your browser, nothing uploaded.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-fg transition-colors hover:bg-ink"
          >
            Open a 270 / 271 →
          </Link>
        </section>

        <H2>Related service types</H2>
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
          <Link href="/edi/270/service-type-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            ← Back to all 270/271 service type codes
          </Link>
        </p>
      </ArticleShell>
    </>
  );
}
