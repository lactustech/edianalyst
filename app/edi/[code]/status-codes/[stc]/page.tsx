import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleShell } from "../../../../../components/ArticleShell";
import { JsonLd } from "../../../../../components/JsonLd";
import {
  codeLabel,
  codeSlug,
  getStatusCode,
  OUTCOMES,
  relatedCodes,
  STATUS_CODES,
  type StatusCode,
} from "../../../../../lib/status-codes";
import { clamp, og, twitter } from "../../../../../lib/seo";
import { SITE_NAME } from "../../../../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return STATUS_CODES.map((c) => ({ code: "277", stc: codeSlug(c) }));
}

function codePath(c: StatusCode): string {
  return `/edi/277/status-codes/${codeSlug(c)}`;
}

/** "claim status category code" for a category, "claim status code" for a status. */
function kindWord(c: StatusCode): string {
  return c.kind === "category" ? "claim status category code" : "claim status code";
}

function titleClause(c: StatusCode): string {
  let s = c.short.replace(/\.$/, "").trim();
  // Category shorts read "Bucket / Detail" (e.g. "Acknowledgement / Returned as
  // unprocessable") — keep the meaningful detail after the bucket.
  if (s.includes(" / ")) s = s.split(" / ").slice(1).join(" / ").trim() || s;
  // Then trim at the first clause boundary (not on "/" — keeps "Claim/line").
  const clause = (s.split(/[,;(]|—/)[0] ?? s).trim();
  return clamp(clause, 30);
}

// Title uses the common search phrasing "claim status code" for both kinds (the
// H1/kicker stay precise about category vs status). Keeps "277 claim status code
// {code}" — the high-intent query — front-loaded and the title length tidy.
function metaTitle(c: StatusCode): string {
  return `277 claim status code ${codeLabel(c)} — ${titleClause(c)}`;
}

function metaDescription(c: StatusCode): string {
  return clamp(`Claim status code ${codeLabel(c)} on a 277/277CA: ${c.plain} What to do: ${c.fix}`, 158);
}

export function generateMetadata({ params }: { params: { stc: string } }): Metadata {
  const c = getStatusCode(params.stc);
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
function faqLd(c: StatusCode) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What does claim status code ${codeLabel(c)} mean?`, acceptedAnswer: { "@type": "Answer", text: c.plain } },
      { "@type": "Question", name: `Why did I get ${codeLabel(c)}?`, acceptedAnswer: { "@type": "Answer", text: c.why } },
      { "@type": "Question", name: `What do I do about ${codeLabel(c)}?`, acceptedAnswer: { "@type": "Answer", text: c.fix } },
    ],
  };
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 border-t border-ink pt-6 text-sm font-semibold uppercase tracking-wide text-ink">{children}</h2>;
}

export default function StatusCodePage({ params }: { params: { stc: string } }) {
  const c = getStatusCode(params.stc);
  if (!c) notFound();

  const kindName = c.kind === "category" ? "Claim Status Category Code" : "Claim Status Code";
  const related = relatedCodes(c);

  return (
    <>
      <JsonLd data={faqLd(c)} />
      <ArticleShell
        crumbs={[
          { label: "Home", href: "/" },
          { label: "277 status", href: "/edi/277" },
          { label: "Status codes", href: "/edi/277/status-codes" },
          { label: codeLabel(c) },
        ]}
        path={codePath(c)}
        kicker={`${kindName} · ${OUTCOMES[c.outcome].label}`}
        title={`${codeLabel(c)} ${kindWord(c)}`}
        intro={c.short}
      >
        <H2>What {codeLabel(c)} means</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.plain}</p>

        <H2>Why you got it</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.why}</p>

        <H2>What to do</H2>
        <p className="mt-4 text-base leading-relaxed text-muted">{c.fix}</p>

        <H2>How it appears in the STC segment</H2>
        <p className="mt-4 text-sm text-muted">
          On a 277, status is reported in the <span className="font-mono text-ink">STC</span> segment as{" "}
          <span className="font-mono text-ink">category:status</span>
          {c.kind === "category" ? (
            <>
              {" "}— <span className="font-mono text-ink">{codeLabel(c)}</span> is the <strong>category</strong>, paired
              with a numeric status code that gives the specific reason (for example{" "}
              <span className="font-mono text-ink">{codeLabel(c)}:21</span>).
            </>
          ) : (
            <>
              {" "}— <span className="font-mono text-ink">{codeLabel(c)}</span> is the <strong>status</strong> detail,
              paired with a category code that gives the headline (for example{" "}
              <span className="font-mono text-ink">A3:{codeLabel(c)}</span>).
            </>
          )}
        </p>

        {/* CTA into the tool */}
        <section className="mt-12 border border-accent bg-accent-soft p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">See it in your own 277</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {SITE_NAME} decodes every STC into a plain-English outcome — accepted, rejected, paid, denied, or pending —
            and flags every rejection. Drop your 277 or 277CA in; it&apos;s parsed entirely in your browser, nothing
            uploaded.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-fg transition-colors hover:bg-ink"
          >
            Open a 277 →
          </Link>
        </section>

        <H2>Related codes</H2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {related.map((r) => (
            <li key={r.code}>
              <Link href={codePath(r)} className="group grid grid-cols-[4.5rem_1fr] items-baseline gap-4 py-3">
                <span className="font-mono text-sm font-semibold text-accent">{codeLabel(r)}</span>
                <span className="text-sm text-muted group-hover:text-ink">{r.short}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm">
          <Link href="/edi/277/status-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            ← Back to all 277 claim status codes
          </Link>
        </p>
      </ArticleShell>
    </>
  );
}
