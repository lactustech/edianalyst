import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRef, REFERENCE, type RefPage } from "../../../lib/reference";
import { SITE_NAME, SITE_URL } from "../../../lib/site";
import { Viewer } from "../../../components/Viewer";
import { SiteFooter } from "../../../components/SiteFooter";

export const dynamicParams = false;

export function generateStaticParams() {
  return REFERENCE.map((r) => ({ code: r.slug }));
}

export function generateMetadata({ params }: { params: { code: string } }): Metadata {
  const r = getRef(params.code);
  if (!r) return {};
  return {
    title: r.metaTitle,
    description: r.metaDescription,
    alternates: { canonical: `/edi/${r.slug}` },
    openGraph: {
      title: `${r.metaTitle} · ${SITE_NAME}`,
      description: r.metaDescription,
      url: `/edi/${r.slug}`,
      type: "article",
    },
  };
}

function Mark() {
  return (
    <svg viewBox="0 0 28 28" className="h-7 w-7" aria-hidden>
      <rect width="28" height="28" rx="3" className="fill-accent" />
      <rect x="6" y="9" width="16" height="2.4" className="fill-accent-fg" opacity="0.6" />
      <rect x="6" y="14" width="10" height="2.4" className="fill-accent-fg" />
      <rect x="6" y="19" width="13" height="2.4" className="fill-accent-fg" opacity="0.6" />
    </svg>
  );
}

function structuredData(r: RefPage) {
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: r.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "EDIAnalyst", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: `${r.code} reference`, item: `${SITE_URL}/edi/${r.slug}` },
    ],
  };
  return JSON.stringify([faqPage, breadcrumb]);
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-14 border-t border-ink pt-6 text-sm font-semibold uppercase tracking-wide text-ink">{children}</h2>;
}

export default function ReferencePage({ params }: { params: { code: string } }) {
  const r = getRef(params.code);
  if (!r) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(r) }} />

      <header className="flex items-center justify-between border-b border-ink py-3">
        <Link href="/" className="flex items-center gap-3">
          <Mark />
          <span className="display text-[15px] uppercase tracking-[-0.01em] text-ink">EDIAnalyst</span>
        </Link>
        <span className="label">X12 · 5010</span>
      </header>

      {/* breadcrumb */}
      <nav className="pt-4 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-accent">Home</Link>
        <span className="px-1.5 text-line">/</span>
        <span className="text-ink">{r.code} reference</span>
      </nav>

      <article className="pb-12">
        <div className="mt-8 label">Transaction reference</div>
        <h1 className="display mt-3 text-5xl leading-[0.95] text-ink sm:text-6xl">
          {r.code}
          <span className="text-accent">.</span>
        </h1>
        <p className="mt-3 text-xl text-muted">{r.name}</p>

        <div className="mt-8 space-y-4 text-base leading-relaxed text-muted">
          {r.summary.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* The tool, embedded: drop a real file or open a sample, results inline. */}
        <section className="mt-10 border-t border-ink pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
            Try it — open a {r.code} file
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Drop your own {r.code} below (or open a synthetic sample). It&apos;s parsed entirely in
            your browser — nothing is uploaded.
          </p>
          <div className="mt-5">
            <Viewer embedded sampleFile={r.sample} sampleCode={r.code} />
          </div>
        </section>

        <H2>How EDIAnalyst reads a {r.code}</H2>
        <p className="mt-5 text-base leading-relaxed text-muted">{r.reads}</p>

        <H2>What&apos;s inside a {r.code}</H2>
        <dl className="mt-5 grid gap-px bg-line sm:grid-cols-2">
          {r.points.map((pt) => (
            <div key={pt.h} className="bg-canvas p-5">
              <dt className="font-mono text-sm font-semibold text-accent">{pt.h}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">{pt.b}</dd>
            </div>
          ))}
        </dl>

        <H2>{r.extra.title}</H2>
        <dl className="mt-5 divide-y divide-line border-y border-line">
          {r.extra.items.map((it) => (
            <div key={it.k} className="grid grid-cols-[7rem_1fr] gap-4 py-3">
              <dt className="font-mono text-sm font-semibold text-ink">{it.k}</dt>
              <dd className="text-sm text-muted">{it.v}</dd>
            </div>
          ))}
        </dl>

        {r.code === "835" && (
          <p className="mt-5 text-sm">
            <Link
              href="/edi/835/denial-codes"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              Browse every CARC &amp; RARC denial code, explained in plain English →
            </Link>
          </p>
        )}

        <H2>Frequently asked questions</H2>
        <dl className="mt-5 space-y-5">
          {r.faq.map((f) => (
            <div key={f.q}>
              <dt className="text-base font-semibold text-ink">{f.q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>

        <H2>Related transactions</H2>
        <div className="mt-5 flex flex-wrap gap-2">
          {r.related.map((code) => (
            <Link
              key={code}
              href={`/edi/${code}`}
              className="border border-ink px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-accent hover:text-accent-fg"
            >
              {code}
            </Link>
          ))}
        </div>
      </article>

      <footer className="border-t border-line py-6 text-sm text-muted">
        <Link href="/" className="border-b border-ink pb-0.5 font-medium text-ink hover:border-accent hover:text-accent">
          ← Back to the EDIAnalyst viewer
        </Link>
        <p className="mt-3 label">Processed entirely in your browser — no PHI leaves the device</p>
      </footer>

      <SiteFooter />
    </main>
  );
}
