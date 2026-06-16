import type { Metadata } from "next";
import { ArticleShell, ArticleSection } from "../../../../components/ArticleShell";
import { ServiceTypeBrowser, type ServiceRow } from "../../../../components/ServiceTypeBrowser";
import { codeLabel, codeSlug, GROUPS, SERVICE_TYPES } from "../../../../lib/service-type-codes";
import { og, twitter } from "../../../../lib/seo";

// Service type codes appear in the 270 inquiry (EQ01) and 271 response (EB03),
// so this hub lives at /edi/270/service-type-codes. dynamicParams=false means no
// other code resolves.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ code: "270" }];
}

const TITLE = "270/271 Service Type Codes — EQ & EB, Plain English";
const DESCRIPTION =
  "A searchable reference for the 270/271 service type codes — the EQ01/EB03 benefit codes like 30 (plan coverage), 98 (office visit), 88 (pharmacy). One plain-English page per code.";
const PATH = "/edi/270/service-type-codes";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: og({ title: TITLE, description: DESCRIPTION, path: PATH }),
  twitter: twitter({ title: TITLE, description: DESCRIPTION }),
};

export default function ServiceTypeCodesHub() {
  const rows: ServiceRow[] = SERVICE_TYPES.map((c) => ({
    slug: codeSlug(c),
    label: codeLabel(c),
    name: c.name,
    group: GROUPS[c.group].label,
  }));

  return (
    <ArticleShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "270 eligibility", href: "/edi/270" },
        { label: "Service type codes" },
      ]}
      path={PATH}
      kicker="270 / 271 reference"
      title="270/271 service type codes explained"
      intro="A service type code says which benefit an eligibility inquiry is about. Search the one you're looking at — 30, 98, 88, AL — and get what it covers, plus how it's used in a 270 or 271."
    >
      <ArticleSection title="Find a code">
        <p>
          A service type code names <strong>what</strong> coverage is in question. It appears in the{" "}
          <span className="font-mono text-ink">EQ01</span> element of a <strong>270</strong> eligibility inquiry (the
          benefit you&apos;re asking about) and the <span className="font-mono text-ink">EB03</span> element of the{" "}
          <strong>271</strong> response (the benefit being described). Type a code or service below.
        </p>
        <ServiceTypeBrowser rows={rows} />
      </ArticleSection>

      <ArticleSection title="Start broad, then narrow">
        <p>
          Most checks begin with <span className="font-mono text-ink">30 — Health Benefit Plan Coverage</span>, which
          confirms the member is active and returns plan-level benefits. When you need the cost share for a specific
          service, send a narrower code — <span className="font-mono text-ink">98</span> for an office visit,{" "}
          <span className="font-mono text-ink">88</span> for pharmacy, <span className="font-mono text-ink">48</span>{" "}
          for an inpatient stay.
        </p>
        <p>
          A 270 can ask about several service types at once; the 271 answers each with active/inactive status and any
          copay, coinsurance, deductible, or limit. Drop either into{" "}
          <a href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            EDIAnalyst
          </a>{" "}
          and each member and the service types in question are listed for you — parsed entirely in your browser,
          nothing uploaded.
        </p>
      </ArticleSection>

      <ArticleSection title="Service types by category">
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((k) => (
            <div key={k} className="grid grid-cols-[10rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{GROUPS[k].label}</dt>
              <dd className="text-sm text-muted">{GROUPS[k].blurb}</dd>
            </div>
          ))}
        </dl>
      </ArticleSection>
    </ArticleShell>
  );
}
