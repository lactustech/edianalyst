import type { Metadata } from "next";
import { ArticleShell, ArticleSection } from "../../../../components/ArticleShell";
import { CodeBrowser, type BrowserRow } from "../../../../components/CodeBrowser";
import { codeLabel, codeSlug, POS_CODES } from "../../../../lib/place-of-service-codes";
import { og, twitter } from "../../../../lib/seo";

// Place of Service codes appear on the 837 (CLM05-1 / SV105). Hub lives at
// /edi/837/place-of-service-codes. dynamicParams=false means no other code resolves.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ code: "837" }];
}

const TITLE = "Place of Service Codes (POS) — 837 Claim Reference";
const DESCRIPTION =
  "A searchable reference for the Place of Service (POS) codes on an 837 claim — 11 office, 02 & 10 telehealth, 21 inpatient hospital, 23 emergency room. Plain-English page per code.";
const PATH = "/edi/837/place-of-service-codes";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: og({ title: TITLE, description: DESCRIPTION, path: PATH }),
  twitter: twitter({ title: TITLE, description: DESCRIPTION }),
};

export default function PlaceOfServiceHub() {
  const rows: BrowserRow[] = POS_CODES.map((c) => ({
    slug: codeSlug(c),
    label: codeLabel(c),
    kind: "pos",
    short: c.name,
  }));

  return (
    <ArticleShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "837 claim", href: "/edi/837" },
        { label: "Place of service codes" },
      ]}
      path={PATH}
      kicker="837 reference"
      title="Place of service (POS) codes"
      intro="A place of service code says where a service was rendered. Search the one you're looking at — 11 office, 02 telehealth, 21 inpatient hospital — and get what it means and when it's used."
    >
      <ArticleSection title="Find a code">
        <p>
          On an 837 professional claim, the <strong>place of service</strong> code appears at the claim level
          (<span className="font-mono text-ink">CLM05-1</span>) and on each service line
          (<span className="font-mono text-ink">SV105</span>). It tells the payer the setting where care happened —
          which drives the right benefit and reimbursement. Type a code or place below.
        </p>
        <CodeBrowser
          rows={rows}
          basePath="/edi/837/place-of-service-codes"
          tabs={[{ key: "all", label: "All" }]}
          placeholder="Search a code or place — e.g. 11, office, telehealth, emergency"
          labelWidth="3.5rem"
        />
      </ArticleSection>

      <ArticleSection title="A note on POS codes">
        <p>
          Place of Service codes are maintained by <strong>CMS</strong> (not X12), but they ride on the 837 and a wrong
          one is a common reason a claim is denied or paid at the wrong rate (see denial code{" "}
          <a href="/edi/835/denial-codes/co-5" className="font-medium text-accent underline-offset-2 hover:underline">
            CO-5
          </a>{" "}
          — procedure inconsistent with the place of service). The most-used codes are{" "}
          <span className="font-mono text-ink">11</span> (office), <span className="font-mono text-ink">02</span>/
          <span className="font-mono text-ink">10</span> (telehealth), <span className="font-mono text-ink">21</span>{" "}
          (inpatient hospital), and <span className="font-mono text-ink">23</span> (emergency room).
        </p>
        <p>
          Drop an 837 into{" "}
          <a href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            EDIAnalyst
          </a>{" "}
          and the place of service is shown per claim — parsed entirely in your browser, nothing uploaded.
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
