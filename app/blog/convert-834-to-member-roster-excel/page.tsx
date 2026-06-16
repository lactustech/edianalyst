import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("convert-834-to-member-roster-excel")!;

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

const FAQ = [
  {
    q: "Does this work with full-file 834s?",
    a: "Yes. Whether the file is a full census (every member, every week) or a change-only file, each member loop becomes one row. For a full file you'll usually want to filter or sort the roster to find what changed — or compare two files with the 834 diff.",
  },
  {
    q: "Can I get one row per coverage instead of one per member?",
    a: "Yes — choose the view that matches your question. A member-level roster gives one row per person with coverage summarized; a coverage-level export gives one row per HD block, which is better when you're reconciling premiums by line.",
  },
  {
    q: "Is my 834 uploaded anywhere?",
    a: "No. The file is parsed entirely in your browser and the Excel export is generated on your device, so no PHI is sent to a server. You can confirm it in your browser's Network tab.",
  },
];

export default function Article() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <JsonLd data={faqLd} />
      <ArticleShell
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "834 to Excel" }]}
        path={`/blog/${post.slug}`}
        kicker={post.kicker}
        title="Convert an 834 to a clean member roster in Excel"
        intro="An 834 is a nested enrollment feed, not a roster. Here's how to flatten it into one row per member — name, ID, coverage, dates, and maintenance type — and export to Excel, without uploading the file anywhere."
        published={post.published}
        description={post.metaDescription}
      >
        <ArticleSection title="Why an 834 isn't a roster yet">
          <p>
            An 834 carries enrollment as a hierarchy of segments, not a table. Each member is wrapped in an{" "}
            <Seg>INS</Seg> loop with reference IDs (<Seg>REF</Seg>), a name (<Seg>NM1</Seg>), demographics (<Seg>DMG</Seg>),
            one or more coverage blocks (<Seg>HD</Seg>), and dates (<Seg>DTP</Seg>). The roster you actually want — one
            row per member with their ID, coverage tier, and status — is scattered across those segments and repeated,
            in slightly different shapes, for every member in the file.
          </p>
          <p>
            Opening the raw file in Excel doesn&apos;t help: there&apos;s no consistent column layout to paste into, and
            the delimiters (<Seg>*</Seg> between elements, <Seg>~</Seg> between segments) don&apos;t line up into cells.
            Even &ldquo;Text to Columns&rdquo; falls apart, because a subscriber row has a different segment pattern than
            a dependent row, and a member with three coverages has more segments than one with a single line. To get a
            roster you have to walk each member loop and pull the fields into columns first — which is exactly the work
            a parser should do for you.
          </p>
        </ArticleSection>

        <ArticleSection title="The fast way: flatten and export in your browser">
          <p>{SITE_NAME} builds the roster for you and exports straight to Excel. Three steps:</p>
          <ol className="ml-5 list-decimal space-y-2 text-sm">
            <li>
              <span className="text-ink">Open the file.</span> Go to{" "}
              <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
                EDIAnalyst
              </Link>{" "}
              and drop your <Seg>.834</Seg>, <Seg>.txt</Seg>, <Seg>.edi</Seg>, or <Seg>.dat</Seg> file onto the page. It
              detects the transaction type automatically.
            </li>
            <li>
              <span className="text-ink">Review the member table.</span> Each member becomes one row, with the
              maintenance type shown as a color-coded badge (add / term / change) and the file&apos;s additions,
              terminations, and changes tallied in a summary bar.
            </li>
            <li>
              <span className="text-ink">Export to Excel.</span> Click export and choose Excel (<Seg>.xlsx</Seg>) — or
              CSV if you&apos;d rather. The download is generated on your device.
            </li>
          </ol>
          <p>
            Because parsing and export both happen in your browser, the 834 — which contains PHI — is never uploaded.
            That matters: most online &ldquo;EDI to Excel&rdquo; converters ask you to send the file to their server,
            which puts protected health information in someone else&apos;s hands. Here, you can confirm in the Network
            tab that nothing leaves the page.
          </p>
        </ArticleSection>

        <ArticleSection title="What ends up in the roster">
          <dl className="mt-2 divide-y divide-line border-y border-line">
            {[
              ["Member & subscriber", "Name and member ID (from NM1/REF), and whether they're the subscriber or a dependent — with the relationship (self, spouse, child)."],
              ["Demographics", "Date of birth and gender from DMG, plus address (N3/N4) when present."],
              ["Maintenance type", "Add (021), term (024), change (001), reinstate (025) — the action on the member from INS03."],
              ["Coverage", "The insurance line (HD03 — health, dental, vision) and coverage level (HD05 — employee, family…)."],
              ["Dates", "Effective and termination dates from the DTP segments (348/349 benefit, 356/357 eligibility)."],
              ["Plan / group", "Group or policy number from the REF segments, useful for keying members across files."],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[11rem_1fr] gap-4 py-3">
                <dt className="text-sm font-semibold text-ink">{k}</dt>
                <dd className="text-sm text-muted">{v}</dd>
              </div>
            ))}
          </dl>
          <p>
            From there it&apos;s an ordinary spreadsheet: sort by termination date, filter to just the adds, or pivot by
            coverage tier. For what each code in those columns means, see the{" "}
            <Link href="/edi/834/enrollment-codes" className="font-medium text-accent underline-offset-2 hover:underline">
              834 enrollment codes
            </Link>{" "}
            reference.
          </p>
        </ArticleSection>

        <ArticleSection title="834 quirks that trip up a manual export">
          <p>
            A few structural realities are why hand-built rosters drift out of sync — and why a parser is worth it:
          </p>
          <ul className="ml-5 list-disc space-y-1.5 text-sm">
            <li>
              <span className="text-ink">Dependents nest under the subscriber.</span> A dependent&apos;s loop carries
              <Seg>INS01</Seg> = N and relationship 19 (child) or 01 (spouse); their coverage is tied to the
              subscriber&apos;s policy, so you have to carry the subscriber ID down onto each dependent row.
            </li>
            <li>
              <span className="text-ink">Members carry multiple HD blocks.</span> One person can have health, dental,
              and vision — three <Seg>HD</Seg> blocks, each with its own dates. Flattening to one member row means
              summarizing those; a coverage-level export keeps them separate.
            </li>
            <li>
              <span className="text-ink">Full file vs change file.</span> A full-file 834 resends everyone every cycle,
              so the roster is the whole census; a change file contains only movers. Know which you have before you
              reconcile.
            </li>
            <li>
              <span className="text-ink">COBRA, retiree, and audit records</span> can appear with their own maintenance
              reasons and dates, and shouldn&apos;t be confused with active enrollments.
            </li>
          </ul>
        </ArticleSection>

        <ArticleSection title="From roster to action">
          <p>
            A clean roster is the input to most enrollment work: reconciling the plan&apos;s membership against the
            sponsor&apos;s, validating premium invoices by counting members per coverage tier, auditing for members who
            should have termed but didn&apos;t, and answering &ldquo;is this person actually enrolled, and since when?&rdquo;
            in seconds instead of grepping a flat file. Once the 834 is a spreadsheet, those become filters and pivot
            tables rather than manual segment-reading.
          </p>
          <p>
            One row per member, or one per coverage? Decide which question you&apos;re answering — a member-level roster
            (one row each, coverage summarized) versus a coverage-level export (one row per HD line) — and export the
            matching view.
          </p>
        </ArticleSection>

        <ArticleSection title="Frequently asked questions">
          <dl className="mt-4 space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="text-base font-semibold text-ink">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </ArticleSection>

        <ArticleSection title="Try it with your own 834">
          <p>No install, no account, no upload. Drop an enrollment file in and export a clean roster in seconds.</p>
          <p>
            <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
              Open an 834 in EDIAnalyst →
            </Link>{" "}
            ·{" "}
            <Link href="/blog/how-to-read-an-834-enrollment-file" className="font-medium text-accent underline-offset-2 hover:underline">
              Read an 834 field by field →
            </Link>{" "}
            ·{" "}
            <Link href="/blog/diff-two-834-files" className="font-medium text-accent underline-offset-2 hover:underline">
              Diff two 834 files →
            </Link>
          </p>
        </ArticleSection>
      </ArticleShell>
    </>
  );
}
