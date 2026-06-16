import type { Metadata } from "next";
import { ArticleShell, ArticleSection } from "../../../../components/ArticleShell";
import { CodeBrowser, type BrowserRow } from "../../../../components/CodeBrowser";
import { codeLabel, codeSlug, ELIG_CODES, ELIG_KINDS } from "../../../../lib/eligibility-codes";
import { og, twitter } from "../../../../lib/seo";

// 271 eligibility/benefit (EB01) + reject reason (AAA) codes. Hub lives at
// /edi/271/eligibility-codes. dynamicParams=false means no other code resolves.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ code: "271" }];
}

const TITLE = "271 Eligibility & Benefit Codes — EB01 and AAA Reject Codes";
const DESCRIPTION =
  "A searchable reference for the 270/271 eligibility codes — the EB01 benefit codes (active, inactive, copay, deductible) and the AAA reject reason codes. One plain-English page per code.";
const PATH = "/edi/271/eligibility-codes";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: og({ title: TITLE, description: DESCRIPTION, path: PATH }),
  twitter: twitter({ title: TITLE, description: DESCRIPTION }),
};

export default function EligibilityCodesHub() {
  const rows: BrowserRow[] = ELIG_CODES.map((c) => ({
    slug: codeSlug(c),
    label: codeLabel(c),
    kind: c.kind,
    short: c.name,
  }));

  const tabs = [
    { key: "all", label: "All" },
    { key: "benefit", label: "Benefit (EB01)" },
    { key: "reject", label: "Reject (AAA)" },
  ];

  return (
    <ArticleShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "271 eligibility", href: "/edi/271" },
        { label: "Eligibility codes" },
      ]}
      path={PATH}
      kicker="270 / 271 reference"
      title="271 eligibility & benefit codes explained"
      intro="A 271 answers an eligibility inquiry with benefit lines, and a 270/271 can reject the request outright. Search the code you're looking at — EB 1, EB C, AAA 72 — and get it in plain English."
    >
      <ArticleSection title="Find a code">
        <p>
          Two code systems carry the answer. The <strong>eligibility/benefit code</strong>{" "}
          (<span className="font-mono text-ink">EB01</span>) says what each 271 benefit line is — active coverage,
          inactive, copay, deductible, limitation. The <strong>reject reason code</strong>{" "}
          (<span className="font-mono text-ink">AAA03</span>) says why an inquiry couldn&apos;t be answered. Type a code
          or keyword below.
        </p>
        <CodeBrowser
          rows={rows}
          basePath="/edi/271/eligibility-codes"
          tabs={tabs}
          placeholder="Search a code or words — e.g. 1 active, C deductible, AAA 72, not found"
          labelWidth="4.5rem"
        />
      </ArticleSection>

      <ArticleSection title="The two code systems">
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {(Object.keys(ELIG_KINDS) as (keyof typeof ELIG_KINDS)[]).map((k) => (
            <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{ELIG_KINDS[k].label}</dt>
              <dd className="text-sm text-muted">
                <span className="font-mono text-xs text-accent">{ELIG_KINDS[k].element}</span> — {ELIG_KINDS[k].blurb}
              </dd>
            </div>
          ))}
        </dl>
        <p>
          Looking for the service being asked about rather than the benefit detail? See the{" "}
          <a href="/edi/270/service-type-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            270/271 service type codes
          </a>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="Read your own 271">
        <p>
          <a href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            EDIAnalyst
          </a>{" "}
          derives a clear active-or-inactive headline per member, decodes each EB benefit line (copays, deductibles,
          limits), and flags inactive coverage. The file is parsed entirely in your browser — nothing is uploaded.
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
