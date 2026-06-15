import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRef, REFERENCE } from "../../../lib/reference";
import { SITE_NAME } from "../../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return REFERENCE.map((r) => ({ code: r.slug }));
}

export function generateMetadata({ params }: { params: { code: string } }): Metadata {
  const r = getRef(params.code);
  if (!r) return {};
  const title = `${r.code} — ${r.name}: free in-browser viewer`;
  const description = r.summary[0];
  return {
    title,
    description,
    alternates: { canonical: `/edi/${r.slug}` },
    openGraph: { title: `${title} · ${SITE_NAME}`, description, url: `/edi/${r.slug}`, type: "article" },
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

export default function ReferencePage({ params }: { params: { code: string } }) {
  const r = getRef(params.code);
  if (!r) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24">
      <header className="flex items-center justify-between border-b border-ink py-3">
        <Link href="/" className="flex items-center gap-3">
          <Mark />
          <span className="display text-[15px] uppercase tracking-[-0.01em] text-ink">EDIAnalyst</span>
        </Link>
        <span className="label">X12 · 5010</span>
      </header>

      <article className="py-12 sm:py-16">
        <div className="label">Transaction reference</div>
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

        <div className="mt-10">
          <Link
            href={`/?try=${r.sample}`}
            className="inline-block bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-fg transition-colors hover:bg-ink"
          >
            Open a sample {r.code} in the viewer →
          </Link>
          <p className="mt-2 label">Runs in your browser · the sample is synthetic, never real data</p>
        </div>

        <h2 className="mt-14 border-t border-ink pt-6 text-sm font-semibold uppercase tracking-wide text-ink">
          What&apos;s inside a {r.code}
        </h2>
        <dl className="mt-5 grid gap-px bg-line sm:grid-cols-2">
          {r.points.map((pt) => (
            <div key={pt.h} className="bg-canvas p-5">
              <dt className="font-mono text-sm font-semibold text-accent">{pt.h}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">{pt.b}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-14 text-sm font-semibold uppercase tracking-wide text-ink">Related transactions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
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
    </main>
  );
}
