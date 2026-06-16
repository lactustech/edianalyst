import Link from "next/link";
import { Fragment } from "react";
import { articleLd, breadcrumbLd } from "../lib/seo";
import { JsonLd } from "./JsonLd";
import { SiteFooter } from "./SiteFooter";
import { ThemeToggle } from "./ThemeToggle";

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

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Chrome for blog detail pages (articles and the per-code denial pages): branded
 * header, a multi-level breadcrumb, a title block, the body, and the shared
 * footer. Mirrors PageShell but supports a breadcrumb trail deeper than Home.
 */
export function ArticleShell({
  crumbs,
  path,
  kicker,
  title,
  intro,
  published,
  description,
  children,
}: {
  crumbs: Crumb[];
  /** Canonical path of this page, used for the last breadcrumb + Article schema. */
  path: string;
  kicker?: string;
  title: string;
  intro?: string;
  published?: string;
  /** When set with `published`, emits BlogPosting structured data. */
  description?: string;
  children: React.ReactNode;
}) {
  const crumbItems = crumbs.map((c) => ({ name: c.label, path: c.href ?? path }));
  const ld: object[] = [breadcrumbLd(crumbItems)];
  if (published && description) {
    ld.push(articleLd({ title, description, path, published }));
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24">
      <JsonLd data={ld} />
      <header className="flex items-center justify-between border-b border-ink py-3">
        <Link href="/" className="flex items-center gap-3">
          <Mark />
          <span className="display text-[15px] uppercase tracking-[-0.01em] text-ink">EDIAnalyst</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="label hidden sm:inline">X12 · 5010</span>
          <ThemeToggle />
        </div>
      </header>

      <nav className="pt-4 text-sm text-muted" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="px-1.5 text-line">/</span>}
            {c.href ? (
              <Link href={c.href} className="hover:text-accent">
                {c.label}
              </Link>
            ) : (
              <span className="text-ink">{c.label}</span>
            )}
          </Fragment>
        ))}
      </nav>

      <article className="pb-4">
        {kicker && <div className="mt-8 label">{kicker}</div>}
        <h1 className={`display ${kicker ? "mt-3" : "mt-8"} text-4xl leading-[1.02] text-ink sm:text-5xl`}>
          {title}
          <span className="text-accent">.</span>
        </h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-muted">{intro}</p>}
        {published && <p className="mt-3 label">Published · {published}</p>}

        <div className="mt-10">{children}</div>
      </article>

      <SiteFooter />
    </main>
  );
}

/** A titled section within an ArticleShell body — hairline rule + heading. */
export function ArticleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="border-t border-ink pt-6 text-sm font-semibold uppercase tracking-wide text-ink">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-muted">{children}</div>
    </section>
  );
}
