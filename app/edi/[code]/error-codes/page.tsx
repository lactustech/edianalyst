import type { Metadata } from "next";
import { ArticleShell, ArticleSection } from "../../../../components/ArticleShell";
import { CodeBrowser, type BrowserRow } from "../../../../components/CodeBrowser";
import { ACK_CODES, ACK_KINDS, codeLabel, codeSlug } from "../../../../lib/codes-999";
import { og, twitter } from "../../../../lib/seo";

// Only the 999 carries these acknowledgment / syntax error codes, so this hub
// lives at /edi/999/error-codes. dynamicParams=false means no other code resolves.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ code: "999" }];
}

const TITLE = "999 Error Codes — Acknowledgment & Syntax Errors Explained";
const DESCRIPTION =
  "A searchable reference for 999 implementation acknowledgment codes — the AK9/IK5 accept-reject codes plus the IK304 segment and IK403 element syntax errors. One plain-English page per code.";
const PATH = "/edi/999/error-codes";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: og({ title: TITLE, description: DESCRIPTION, path: PATH }),
  twitter: twitter({ title: TITLE, description: DESCRIPTION }),
};

export default function ErrorCodesHub() {
  const rows: BrowserRow[] = ACK_CODES.map((c) => ({
    slug: codeSlug(c),
    label: codeLabel(c),
    kind: c.kind,
    short: c.short,
  }));

  const tabs = [
    { key: "all", label: "All" },
    { key: "ack", label: "Acknowledgment" },
    { key: "segment", label: "Segment" },
    { key: "element", label: "Element" },
  ];

  return (
    <ArticleShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "999 acknowledgment", href: "/edi/999" },
        { label: "Error codes" },
      ]}
      path={PATH}
      kicker="999 reference"
      title="999 error codes explained"
      intro="A 999 tells you whether a file you sent was accepted or rejected, and pinpoints the syntax errors. Search the code you're looking at — R, IK304:7, IK403:7 — and get it in plain English, plus how to fix it."
    >
      <ArticleSection title="Find a code">
        <p>
          A 999 reports three kinds of code. The <strong>acknowledgment code</strong> (in IK5 per transaction set, AK9
          per group) is the headline — accepted, accepted-with-errors, or rejected. When something failed, the{" "}
          <strong>segment error</strong> (<span className="font-mono text-ink">IK304</span>) and{" "}
          <strong>element error</strong> (<span className="font-mono text-ink">IK403</span>) pinpoint exactly which
          segment and field. Type a code or keyword below.
        </p>
        <CodeBrowser
          rows={rows}
          basePath="/edi/999/error-codes"
          tabs={tabs}
          placeholder="Search a code or words — e.g. R, IK403 7, invalid code, missing segment"
        />
      </ArticleSection>

      <ArticleSection title="How a 999 pinpoints an error">
        <p>
          Read it top-down: the <span className="font-mono text-ink">AK9</span> gives the group result and{" "}
          <span className="font-mono text-ink">IK5</span> the per-transaction result; an{" "}
          <span className="font-mono text-ink">IK3</span> names the segment in error (with an{" "}
          <span className="font-mono text-ink">IK304</span> reason), and an <span className="font-mono text-ink">IK4</span>{" "}
          names the data element in error (with an <span className="font-mono text-ink">IK403</span> reason). A segment
          error of <span className="font-mono text-ink">8</span> (&ldquo;segment has data element errors&rdquo;) always
          points you down to the element errors.
        </p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {(Object.keys(ACK_KINDS) as (keyof typeof ACK_KINDS)[]).map((k) => (
            <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{ACK_KINDS[k].label}</dt>
              <dd className="text-sm text-muted">
                <span className="font-mono text-xs text-accent">{ACK_KINDS[k].segment}</span> — {ACK_KINDS[k].blurb}
              </dd>
            </div>
          ))}
        </dl>
      </ArticleSection>

      <ArticleSection title="Read your own 999">
        <p>
          <a href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            EDIAnalyst
          </a>{" "}
          reads the AK9/IK5 results and decodes every IK3 segment error and IK4 element error into plain English, so you
          know exactly which segment and field to fix. The file is parsed entirely in your browser — nothing is
          uploaded.
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
