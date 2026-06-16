import Link from "next/link";
import { FOOTER_PAGES, SITE_LAUNCH_YEAR, SITE_NAME } from "../lib/site";

/**
 * Site-wide footer strip: informational/legal links + copyright. Rendered at the
 * bottom of the landing page, the reference pages, and the standalone pages.
 *
 * Static export means we can't read the current year at request time, so the ©
 * range is anchored to the launch year (see SITE_LAUNCH_YEAR).
 */
export function SiteFooter() {
  return (
    <div className="mt-12 border-t border-line pt-6">
      <nav aria-label="Site" className="flex flex-wrap gap-x-6 gap-y-2">
        {FOOTER_PAGES.map((p) => (
          <Link
            key={p.slug}
            href={`/${p.slug}`}
            className="text-sm text-muted transition-colors hover:text-accent"
          >
            {p.label}
          </Link>
        ))}
      </nav>
      <p className="mt-4 label">
        © {SITE_LAUNCH_YEAR} {SITE_NAME} · Processed entirely in your browser
      </p>
    </div>
  );
}
