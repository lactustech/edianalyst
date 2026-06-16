import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("how-to-read-an-834-enrollment-file")!;

export const metadata: Metadata = {
  title: post.metaTitle,
  description: post.metaDescription,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: og({ title: post.metaTitle, description: post.metaDescription, path: `/blog/${post.slug}` }),
  twitter: twitter({ title: post.metaTitle, description: post.metaDescription }),
};

function Seg({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-ink">{children}</span>;
}

export default function Article() {
  return (
    <ArticleShell
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "Reading an 834" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="How to read an 834 enrollment file, field by field"
      intro="An 834 moves member enrollment between a sponsor and a health plan. Once you know which segment holds the member, their coverage, and their dates, the file reads cleanly. Here's the field-by-field tour."
      published={post.published}
      description={post.metaDescription}
    >
      <ArticleSection title="The shape of the file">
        <p>
          An 834 wraps each member in a loop that starts with an <Seg>INS</Seg> segment, followed by reference
          numbers, the member&apos;s name and demographics, and one or more coverage blocks. Around the members sit
          envelope segments — <Seg>ISA</Seg>/<Seg>GS</Seg> at the top, the <Seg>BGN</Seg> beginning segment, sponsor
          and payer <Seg>N1</Seg> loops — and a control count at the bottom. To read a member, you walk one{" "}
          <Seg>INS</Seg> loop at a time.
        </p>
      </ArticleSection>

      <ArticleSection title="Member identity and status">
        <dl className="divide-y divide-line border-y border-line">
          {[
            ["INS", "Opens the member loop. INS01 (Y/N) flags whether this is the subscriber; INS02 is the relationship (18 = self, 01 = spouse, 19 = child); INS03 is the all-important maintenance type — add, term, change, reinstate."],
            ["REF", "Reference identifiers: REF*0F is the subscriber ID, REF*1L the group/policy number, REF*23 a client/member number. These are how you key a member across files."],
            ["NM1", "The member's name and identifier — last, first, middle, and usually the SSN or member ID in NM109."],
            ["PER", "Contact information (phone, email) when the file carries it."],
          ].map(([seg, desc]) => (
            <div key={seg} className="grid grid-cols-[4.5rem_1fr] gap-4 py-3">
              <dt className="font-mono text-sm font-semibold text-accent">{seg}</dt>
              <dd className="text-sm text-muted">{desc}</dd>
            </div>
          ))}
        </dl>
        <p>
          The maintenance type in INS03 decides what happens to the member — it&apos;s worth its own read. See{" "}
          <Link href="/blog/834-maintenance-type-codes-ins03" className="font-medium text-accent underline-offset-2 hover:underline">
            834 maintenance type codes (INS03)
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="Demographics and address">
        <dl className="divide-y divide-line border-y border-line">
          {[
            ["DMG", "Date of birth (DMG02), gender (DMG03), and sometimes marital status. The demographic core of the member."],
            ["N3 / N4", "Street address (N3) and city/state/ZIP (N4)."],
            ["LUI / LE", "Language and other member-level details when present."],
          ].map(([seg, desc]) => (
            <div key={seg} className="grid grid-cols-[4.5rem_1fr] gap-4 py-3">
              <dt className="font-mono text-sm font-semibold text-accent">{seg}</dt>
              <dd className="text-sm text-muted">{desc}</dd>
            </div>
          ))}
        </dl>
      </ArticleSection>

      <ArticleSection title="Coverage and dates">
        <p>This is what enrollment is really about — what the member is covered for and when:</p>
        <dl className="divide-y divide-line border-y border-line">
          {[
            ["HD", "The health coverage block. HD03 is the insurance line / coverage type — HLT (health), DEN (dental), VIS (vision), etc. — and HD04 the plan description. A member can carry several HD blocks."],
            ["DTP", "The dates attached to a coverage. DTP*348 is a benefit begin date, DTP*349 a benefit end date, DTP*356/357 eligibility begin/end. This is where you confirm an effective or termination date."],
            ["COB / HD loops", "Coordination-of-benefits and additional coverage details when the member has other insurance."],
            ["LX / NM1 (payer)", "Plan/payer identification for the coverage."],
          ].map(([seg, desc]) => (
            <div key={seg} className="grid grid-cols-[4.5rem_1fr] gap-4 py-3">
              <dt className="font-mono text-sm font-semibold text-accent">{seg}</dt>
              <dd className="text-sm text-muted">{desc}</dd>
            </div>
          ))}
        </dl>
        <p>
          Read the <Seg>HD</Seg> and its <Seg>DTP</Seg> dates together: HD says <em>what</em> the coverage is, DTP says{" "}
          <em>from when to when</em>. A termination (INS03 = 024) should have a matching end date in DTP.
        </p>
      </ArticleSection>

      <ArticleSection title="The envelope and the totals">
        <p>
          At the file level, <Seg>BGN</Seg> identifies the transaction (and whether it&apos;s an original or a
          replacement file), the sponsor and payer <Seg>N1</Seg> loops say who&apos;s sending and receiving, and the{" "}
          <Seg>SE</Seg> trailer carries a segment count. If a member seems to be missing, a count mismatch is often the
          first clue that the file was truncated.
        </p>
      </ArticleSection>

      <ArticleSection title="Read it as a table instead">
        <p>
          {SITE_NAME} walks every <Seg>INS</Seg> loop for you and turns it into one clean row per member — name, ID,
          demographics, and coverage lines — with the maintenance type shown as a color-coded badge and the file&apos;s
          adds, terms, and changes tallied. It can also diff two 834s to show exactly who joined, left, or changed,
          field by field. Everything is parsed in your browser; no member data is uploaded.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open an 834 in EDIAnalyst →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
