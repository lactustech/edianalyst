import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../../components/ArticleShell";
import { CodeBrowser, type BrowserRow } from "../../../../components/CodeBrowser";
import { codeLabel, codeSlug, ENROLL_CODES, ENROLL_KINDS } from "../../../../lib/enrollment-codes";
import { og, twitter } from "../../../../lib/seo";

// 834 enrollment codes — this hub lives at /edi/834/enrollment-codes.
// dynamicParams=false means no other code resolves.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ code: "834" }];
}

const TITLE = "834 Enrollment Codes — INS, HD Codes in Plain English";
const DESCRIPTION =
  "A searchable reference for the 834 enrollment codes — maintenance type (INS03), relationship (INS02), coverage level (HD05), and insurance line (HD03). One plain-English page per code.";
const PATH = "/edi/834/enrollment-codes";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: og({ title: TITLE, description: DESCRIPTION, path: PATH }),
  twitter: twitter({ title: TITLE, description: DESCRIPTION }),
};

export default function EnrollmentCodesHub() {
  const rows: BrowserRow[] = ENROLL_CODES.map((c) => ({
    slug: codeSlug(c),
    label: codeLabel(c),
    kind: c.kind,
    short: c.name,
  }));

  const tabs = [
    { key: "all", label: "All" },
    { key: "maintenance", label: "Maint." },
    { key: "relationship", label: "Relation" },
    { key: "coverage", label: "Coverage" },
    { key: "line", label: "Line" },
  ];

  return (
    <ArticleShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "834 enrollment", href: "/edi/834" },
        { label: "Enrollment codes" },
      ]}
      path={PATH}
      kicker="834 reference"
      title="834 enrollment codes explained"
      intro="An 834 describes each member with a handful of key codes. Search the one you're looking at — INS03 021, INS02 18, HD05 FAM, HD03 HLT — and get it in plain English."
    >
      <ArticleSection title="Find a code">
        <p>
          Four code systems carry most of an 834&apos;s meaning: the{" "}
          <strong>maintenance type</strong> (<span className="font-mono text-ink">INS03</span>) says what&apos;s
          happening to the member, the <strong>relationship</strong> (<span className="font-mono text-ink">INS02</span>)
          says who they are, the <strong>coverage level</strong> (<span className="font-mono text-ink">HD05</span>) says
          who&apos;s covered, and the <strong>insurance line</strong> (<span className="font-mono text-ink">HD03</span>)
          says what kind of coverage it is. Type a code or keyword below.
        </p>
        <CodeBrowser
          rows={rows}
          basePath="/edi/834/enrollment-codes"
          tabs={tabs}
          placeholder="Search a code or words — e.g. 021, termination, FAM, dental"
          labelWidth="4rem"
        />
      </ArticleSection>

      <ArticleSection title="The four code systems">
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {(Object.keys(ENROLL_KINDS) as (keyof typeof ENROLL_KINDS)[]).map((k) => (
            <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{ENROLL_KINDS[k].label}</dt>
              <dd className="text-sm text-muted">
                <span className="font-mono text-xs text-accent">{ENROLL_KINDS[k].element}</span> — {ENROLL_KINDS[k].blurb}
              </dd>
            </div>
          ))}
        </dl>
        <p>
          The maintenance type is the field enrollment teams watch most — for a deeper walkthrough see{" "}
          <Link href="/blog/834-maintenance-type-codes-ins03" className="font-medium text-accent underline-offset-2 hover:underline">
            834 maintenance type codes (INS03)
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="Read your own 834">
        <p>
          <a href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            EDIAnalyst
          </a>{" "}
          reads each member&apos;s INS, HD, and DTP segments into one clean row — with the maintenance type shown as a
          color-coded badge — and can diff two 834s to show who joined, left, or changed. The file is parsed entirely in
          your browser; nothing is uploaded.
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
