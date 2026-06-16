import Link from "next/link";
import { SiteFooter } from "./SiteFooter";

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

/**
 * Chrome for the standalone informational/legal pages: branded header, a title
 * block, the page body, and the shared site footer. Matches the reference-page
 * layout (max-w-3xl, hairline header) so the pages feel part of the same app.
 */
export function PageShell({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24">
      <header className="flex items-center justify-between border-b border-ink py-3">
        <Link href="/" className="flex items-center gap-3">
          <Mark />
          <span className="display text-[15px] uppercase tracking-[-0.01em] text-ink">EDIAnalyst</span>
        </Link>
        <span className="label">X12 · 5010</span>
      </header>

      <nav className="pt-4 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-accent">Home</Link>
        <span className="px-1.5 text-line">/</span>
        <span className="text-ink">{title}</span>
      </nav>

      <article className="pb-4">
        <h1 className="display mt-8 text-4xl leading-[0.98] text-ink sm:text-5xl">
          {title}
          <span className="text-accent">.</span>
        </h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-muted">{intro}</p>}
        {updated && <p className="mt-3 label">Last updated · {updated}</p>}

        <div className="mt-10 space-y-8">{children}</div>
      </article>

      <SiteFooter />
    </main>
  );
}

/** A titled section within a PageShell body — hairline rule + uppercase heading. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="border-t border-ink pt-6 text-sm font-semibold uppercase tracking-wide text-ink">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-muted">{children}</div>
    </section>
  );
}
