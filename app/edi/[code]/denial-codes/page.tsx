import type { Metadata } from "next";
import { ArticleShell, ArticleSection } from "../../../../components/ArticleShell";
import { DenialCodeBrowser, type CodeRow } from "../../../../components/DenialCodeBrowser";
import { CATEGORIES, codeLabel, codeSlug, DENIAL_CODES, GROUP_CODES, type GroupCode } from "../../../../lib/denial-codes";
import { og, twitter } from "../../../../lib/seo";

// Only the 835 carries CARC/RARC adjustments, so this hub exists solely at
// /edi/835/denial-codes. dynamicParams=false means no other code resolves.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ code: "835" }];
}

const TITLE = "835 Denial Codes — Every CARC & RARC, Plain English";
const DESCRIPTION =
  "A searchable reference for the CARC and RARC codes on an 835 remittance — one plain-English page per code. Look up CO-45, CO-97, PR-1, N130 and the rest.";
const PATH = "/edi/835/denial-codes";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: og({ title: TITLE, description: DESCRIPTION, path: PATH }),
  twitter: twitter({ title: TITLE, description: DESCRIPTION }),
};

const GROUP_ORDER: GroupCode[] = ["CO", "PR", "OA", "PI", "CR"];

export default function DenialCodesHub() {
  const rows: CodeRow[] = DENIAL_CODES.map((c) => ({
    slug: codeSlug(c),
    label: codeLabel(c),
    code: c.code,
    system: c.system,
    short: c.short,
    category: CATEGORIES[c.category].label,
  }));

  return (
    <ArticleShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "835 ERA", href: "/edi/835" },
        { label: "Denial codes" },
      ]}
      path={PATH}
      kicker="835 reference"
      title="835 denial codes explained"
      intro="Every adjustment on an 835 remittance is explained by a code. Search the one you're looking at — CO-45, CO-97, PR-204, N130 — and get it in plain English, plus what to do about it."
    >
      <ArticleSection title="Find a code">
        <p>
          On an 835 (ERA), every dollar that wasn&apos;t paid in full is explained by a <strong>CARC</strong> (Claim
          Adjustment Reason Code) in the CAS segment, often with a <strong>RARC</strong> (Remittance Advice Remark
          Code) for extra detail. Strictly, these are <em>adjustment and remark codes</em> — not every one is a denial
          (CO-45 is a contractual write-off, PR-1 is patient responsibility, and many RARCs are purely informational) —
          but analysts look them all up the same way. Type the code or a keyword below.
        </p>
        <DenialCodeBrowser rows={rows} />
      </ArticleSection>

      <ArticleSection title="What the group code (CO, PR, OA…) means">
        <p>
          A CARC never travels alone — it&apos;s prefixed with a <strong>group code</strong> that says who the
          adjustment belongs to. The same reason code means very different things depending on it: <strong>CO-45</strong>{" "}
          is a write-off you absorb, while a PR code is money you can bill the patient.
        </p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {GROUP_ORDER.map((g) => (
            <div key={g} className="grid grid-cols-[4rem_1fr] gap-4 py-3">
              <dt className="font-mono text-sm font-semibold text-accent">{g}</dt>
              <dd className="text-sm text-muted">
                <span className="font-medium text-ink">{GROUP_CODES[g].label}.</span> {GROUP_CODES[g].blurb}
              </dd>
            </div>
          ))}
        </dl>
      </ArticleSection>

      <ArticleSection title="Read the whole remittance, not just the code">
        <p>
          A single code rarely tells the whole story — you need to see it against the claim&apos;s charge, paid
          amount, and the other adjustments on the same line. Drop your 835 into{" "}
          <a href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            EDIAnalyst
          </a>{" "}
          and every CARC and RARC is decoded inline, per claim, with balancing checked automatically. The file is
          parsed entirely in your browser — nothing is uploaded.
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
