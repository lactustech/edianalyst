import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "../../components/JsonLd";
import { PageShell } from "../../components/PageShell";
import { REFERENCE } from "../../lib/reference";
import { breadcrumbLd, og, twitter } from "../../lib/seo";

const TITLE = "Reference";
const DESCRIPTION =
  "Plain-English references for healthcare X12 EDI codes — look up an 835 denial code (CARC/RARC) or a 277 claim status code (STC), plus a guide to every transaction type.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/reference" },
  openGraph: og({ title: TITLE, description: DESCRIPTION, path: "/reference", type: "website" }),
  twitter: twitter({ title: TITLE, description: DESCRIPTION }),
};

// The two code references are kept separate — one card each — because they're
// different code systems for different transactions (835 adjustments vs 277
// claim status), and people search them under different terms.
const CODE_REFERENCES = [
  {
    href: "/edi/835/denial-codes",
    kicker: "835 · CARC & RARC",
    title: "835 denial codes",
    blurb:
      "Every claim adjustment reason code (CARC) and remittance advice remark code (RARC) on an 835 remittance, in plain English — CO-45, CO-97, PR-1, N130 and the rest.",
  },
  {
    href: "/edi/277/status-codes",
    kicker: "277 / 277CA · STC",
    title: "277 claim status codes",
    blurb:
      "Every claim status category and status code on a 277 or 277CA, decoded into a plain-English outcome — A3, 21, F2, 109 and more.",
  },
  {
    href: "/edi/270/service-type-codes",
    kicker: "270 / 271 · EQ & EB",
    title: "270/271 service type codes",
    blurb:
      "The EQ01/EB03 benefit codes an eligibility inquiry asks about — 30 (plan coverage), 98 (office visit), 88 (pharmacy), AL (vision) and more.",
  },
  {
    href: "/edi/834/enrollment-codes",
    kicker: "834 · INS & HD",
    title: "834 enrollment codes",
    blurb:
      "The codes that describe each member — maintenance type (INS03), relationship (INS02), coverage level (HD05), and insurance line (HD03).",
  },
  {
    href: "/edi/999/error-codes",
    kicker: "999 · IK3 / IK4 / AK9",
    title: "999 error codes",
    blurb:
      "The 999 acknowledgment codes plus the IK304 segment and IK403 element syntax errors — what each accept/reject and syntax code means and how to fix it.",
  },
];

export default function ReferenceIndex() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Reference", path: "/reference" },
        ])}
      />
      <PageShell
        title="Reference"
        intro="Plain-English references for the codes and transactions you work with in healthcare EDI."
      >
        {/* Code references — kept separate, one card each. */}
        <div className="grid gap-px bg-line sm:grid-cols-2">
          {CODE_REFERENCES.map((r) => (
            <Link key={r.href} href={r.href} className="group block bg-canvas p-5 transition-colors hover:bg-fill">
              <span className="label">{r.kicker}</span>
              <h2 className="display mt-2 text-xl leading-tight text-ink group-hover:text-accent">{r.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.blurb}</p>
              <span className="mt-3 inline-block text-sm font-medium text-accent">Open the reference →</span>
            </Link>
          ))}
        </div>

        {/* Transaction references — the per-transaction explainer pages. */}
        <section>
          <h2 className="border-t border-ink pt-6 text-sm font-semibold uppercase tracking-wide text-ink">
            Transaction references
          </h2>
          <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {REFERENCE.map((t) => (
              <li key={t.slug}>
                <Link href={`/edi/${t.slug}`} className="group inline-flex items-baseline gap-2 text-sm">
                  <span className="display font-bold text-accent">{t.code}</span>
                  <span className="text-muted group-hover:text-ink">{t.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </PageShell>
    </>
  );
}
