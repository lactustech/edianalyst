import type { Metadata } from "next";
import { ArticleShell, ArticleSection } from "../../../../components/ArticleShell";
import { StatusCodeBrowser, type StatusRow } from "../../../../components/StatusCodeBrowser";
import { codeLabel, codeSlug, OUTCOMES, STATUS_CODES } from "../../../../lib/status-codes";
import { og, twitter } from "../../../../lib/seo";

// Only the 277 / 277CA carries STC claim status codes, so this hub exists solely
// at /edi/277/status-codes. dynamicParams=false means no other code resolves.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ code: "277" }];
}

const TITLE = "277 Claim Status Codes — Category & Status, Plain English";
const DESCRIPTION =
  "A searchable reference for the 277/277CA claim status codes — both the category codes (A1, A3, F1, F2) and the status codes (21, 65, 109). One plain-English page per code.";
const PATH = "/edi/277/status-codes";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: og({ title: TITLE, description: DESCRIPTION, path: PATH }),
  twitter: twitter({ title: TITLE, description: DESCRIPTION }),
};

export default function StatusCodesHub() {
  const rows: StatusRow[] = STATUS_CODES.map((c) => ({
    slug: codeSlug(c),
    label: codeLabel(c),
    kind: c.kind,
    short: c.short,
    outcome: OUTCOMES[c.outcome].label,
  }));

  return (
    <ArticleShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "277 status", href: "/edi/277" },
        { label: "Status codes" },
      ]}
      path={PATH}
      kicker="277 reference"
      title="277 claim status codes explained"
      intro="A 277 (and the 277CA acknowledgment) reports where a claim stands using a status code. Search the one you're looking at — A3, 21, F2, 109 — and get it in plain English, plus what to do next."
    >
      <ArticleSection title="Find a code">
        <p>
          The status lives in the <strong>STC</strong> segment, which pairs two code systems: a{" "}
          <strong>category code</strong> (the broad bucket — received, accepted, rejected, pending, paid, denied) and a{" "}
          <strong>status code</strong> (the specific detail). An STC reads <span className="font-mono text-ink">category:status</span> —{" "}
          for example <span className="font-mono text-ink">A3:21</span> means &ldquo;returned as unprocessable because of
          missing or invalid information.&rdquo; Type a code or keyword below.
        </p>
        <StatusCodeBrowser rows={rows} />
      </ArticleSection>

      <ArticleSection title="What the category code tells you">
        <p>
          Before you read the detail, the category code gives you the headline — is this claim accepted, rejected,
          pending, or finished?
        </p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {(Object.keys(OUTCOMES) as (keyof typeof OUTCOMES)[]).map((k) => (
            <div key={k} className="grid grid-cols-[10rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{OUTCOMES[k].label}</dt>
              <dd className="text-sm text-muted">{OUTCOMES[k].blurb}</dd>
            </div>
          ))}
        </dl>
      </ArticleSection>

      <ArticleSection title="277 vs 277CA — same codes">
        <p>
          A general <strong>277</strong> claim status response and a <strong>277CA</strong> claim acknowledgment (the
          X214 a clearinghouse returns right after an 837) use the same STC code systems. The difference is timing: the
          277CA accepts or rejects each claim up front, before adjudication. Drop either into{" "}
          <a href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            EDIAnalyst
          </a>{" "}
          and every STC is decoded into a plain-English outcome, with rejections flagged. The file is parsed entirely in
          your browser — nothing is uploaded.
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
