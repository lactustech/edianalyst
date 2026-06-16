import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("anatomy-of-an-x12-file")!;

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

const EXAMPLE = `ISA*00*          *00*          *ZZ*SENDERID       *ZZ*RECEIVERID     *260616*1200*^*00501*000000001*0*P*:~
GS*HC*SENDERID*RECEIVERID*20260616*1200*1*X*005010X222A1~
ST*837*0001*005010X222A1~
... transaction content ...
SE*42*0001~
GE*1*1~
IEA*1*000000001~`;

const FAQ = [
  {
    q: "What are the ISA, GS, and ST segments?",
    a: "They're the three envelope layers of an X12 file. ISA opens the interchange (the whole transmission), GS opens a functional group (transactions of one type), and ST opens a single transaction set (one 837, 835, etc.). Each is closed by a matching trailer: IEA, GE, and SE.",
  },
  {
    q: "Where are the X12 delimiters defined?",
    a: "In the ISA segment itself. The element separator is the character right after 'ISA', the component (sub-element) separator is ISA16, and the segment terminator is the character immediately after ISA16. A reader learns the delimiters by reading those fixed positions first.",
  },
  {
    q: "What are control numbers used for?",
    a: "Each envelope level has a control number — ISA13, GS06, ST02 — that must match its trailer (IEA02, GE02, SE02). They let the receiver confirm nothing was lost and acknowledge specific interchanges, groups, and transactions.",
  },
  {
    q: "What's the difference between a segment, an element, and a loop?",
    a: "An element is a single value; a segment is a line of elements identified by a tag (like NM1); a loop is a repeating group of related segments. Loops give X12 its hierarchy — for example, one claim loop containing several service-line loops.",
  },
];

export default function Article() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <ArticleShell
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "Anatomy of an X12 file" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="Anatomy of an X12 file: the ISA/GS/ST envelope explained"
      intro="Every healthcare EDI file — 837, 835, 834, and the rest — is wrapped in the same envelope. Once you can read the ISA/GS/ST structure, delimiters, and control numbers, any X12 file becomes navigable. Here's the anatomy, with a fully labeled example."
      published={post.published}
      description={post.metaDescription}
    >
      <JsonLd data={faqLd} />

      <ArticleSection title="One envelope, every transaction">
        <p>
          The reason an 837 claim and an 835 remittance look structurally similar is that they share the same{" "}
          <strong>envelope</strong>. X12 wraps the actual business content in three nested layers, and those layers are
          identical across every transaction type. Learn the envelope once and you can open any X12 file — find where a
          transaction starts and ends, confirm it&apos;s complete, and know which version it follows — before you read a
          single line of the content inside.
        </p>
      </ArticleSection>

      <ArticleSection title="The three envelope layers">
        <p>X12 nests from the outside in. Each opening segment has a matching trailer:</p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {[
            ["ISA … IEA", "The interchange — the entire transmission between one sender and one receiver. ISA opens it, IEA closes it. There's exactly one interchange envelope per file."],
            ["GS … GE", "A functional group — a batch of transactions of the same type (e.g. all the 837 claims). One interchange can hold several functional groups."],
            ["ST … SE", "A transaction set — a single business document: one 837, one 835, one 834. A functional group can hold many transaction sets."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 py-3">
              <dt className="font-mono text-sm font-semibold text-accent">{k}</dt>
              <dd className="text-sm text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <p>
          So the hierarchy is: one <strong>interchange</strong> (ISA/IEA) contains one or more{" "}
          <strong>functional groups</strong> (GS/GE), each containing one or more <strong>transaction sets</strong>{" "}
          (ST/SE), each containing the segments that carry the actual claim, payment, or enrollment data.
        </p>
      </ArticleSection>

      <ArticleSection title="A fully labeled example">
        <p>Here&apos;s the skeleton of an 837 file with the content collapsed, so the envelope is visible:</p>
        <pre className="mt-3 overflow-x-auto border border-line bg-fill p-4 font-mono text-xs leading-relaxed text-ink">{EXAMPLE}</pre>
        <p>Reading it top to bottom:</p>
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li><Seg>ISA</Seg> — opens the interchange; carries sender/receiver IDs, date/time, the version (<Seg>00501</Seg>), and the interchange control number (<Seg>000000001</Seg>).</li>
          <li><Seg>GS</Seg> — opens the functional group; <Seg>HC</Seg> = health care claim, and <Seg>005010X222A1</Seg> is the implementation guide (here, an 837P).</li>
          <li><Seg>ST</Seg> — opens the transaction set; <Seg>837</Seg> with control number <Seg>0001</Seg>.</li>
          <li><Seg>SE</Seg> — closes the transaction set; carries the segment count (<Seg>42</Seg>) and the same control number <Seg>0001</Seg>.</li>
          <li><Seg>GE</Seg> — closes the functional group; <Seg>1</Seg> transaction set, group control <Seg>1</Seg>.</li>
          <li><Seg>IEA</Seg> — closes the interchange; <Seg>1</Seg> functional group, control <Seg>000000001</Seg>.</li>
        </ul>
      </ArticleSection>

      <ArticleSection title="Delimiters: declared in the ISA">
        <p>
          X12 doesn&apos;t fix its delimiters — it declares them, and the <Seg>ISA</Seg> is where a reader learns them.
          Three characters matter:
        </p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {[
            ["Element separator", "The character right after the letters 'ISA' — commonly an asterisk (*). It separates elements within a segment."],
            ["Component separator", "Element ISA16 (the last element of the ISA) — commonly a colon (:). It separates sub-elements inside a composite element."],
            ["Segment terminator", "The character immediately after ISA16 — commonly a tilde (~). It marks the end of every segment."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[11rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{k}</dt>
              <dd className="text-sm text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <p>
          Because the <Seg>ISA</Seg> is a fixed-length segment, a parser reads those exact positions first to discover
          the delimiters, then uses them to split the rest of the file. That&apos;s also why the delimiter characters
          must never appear inside the data — they&apos;d be misread as structure.
        </p>
      </ArticleSection>

      <ArticleSection title="Control numbers and balancing">
        <p>
          Each envelope level carries a <strong>control number</strong> in its header that must match its trailer:
        </p>
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li><Seg>ISA13</Seg> (interchange control number) must equal <Seg>IEA02</Seg>.</li>
          <li><Seg>GS06</Seg> (group control number) must equal <Seg>GE02</Seg>.</li>
          <li><Seg>ST02</Seg> (transaction set control number) must equal <Seg>SE02</Seg>.</li>
        </ul>
        <p>
          The trailers also carry <strong>counts</strong>: <Seg>SE01</Seg> is the number of segments in the transaction
          set, <Seg>GE01</Seg> the number of transaction sets in the group, and <Seg>IEA01</Seg> the number of groups in
          the interchange. Together, matching control numbers and correct counts let the receiver confirm nothing was
          dropped or duplicated — and a mismatch is one of the first things a TA1 or 999 will reject on.
        </p>
      </ArticleSection>

      <ArticleSection title="Segments, elements, and loops">
        <p>Inside the envelope, three terms describe the content:</p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {[
            ["Element", "A single value — a name, a date, a code. Elements are separated by the element separator."],
            ["Segment", "A line of related elements, identified by a tag at the start (NM1, CLM, DTP). Ends at the segment terminator."],
            ["Loop", "A repeating group of related segments — for example, a claim loop containing several service-line loops. Loops give X12 its hierarchy."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[7rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{k}</dt>
              <dd className="text-sm text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <p>
          A composite element adds one more level: a single element split into sub-elements by the component separator
          (the colon), like a code qualifier and its value packed together. For the segments you&apos;ll meet most, see
          the{" "}
          <Link href="/blog/x12-segments-cheat-sheet" className="font-medium text-accent underline-offset-2 hover:underline">
            common X12 segments cheat sheet
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="A worked descent: from envelope to a single value">
        <p>
          To see how the levels nest, follow one value down. You start at the <Seg>ISA</Seg> and learn the delimiters
          and version. Inside is a <Seg>GS</Seg> that says &ldquo;this group is health care claims, implementation guide
          005010X222A1&rdquo; — so you know it&apos;s an 837P. Inside <em>that</em> is an <Seg>ST*837</Seg> opening one
          claim transaction. Within the transaction, <Seg>HL</Seg> loops nest the billing provider, then the
          subscriber, then a claim, then a service line. Within the service-line&apos;s <Seg>SV1</Seg> segment is a
          composite element — say <Seg>HC:99213</Seg> — and within that composite, the component separator splits the
          qualifier (<Seg>HC</Seg>) from the value (<Seg>99213</Seg>).
        </p>
        <p>
          That&apos;s six levels of nesting from the outside in: interchange → group → transaction → loop → segment →
          element → component. Every X12 file is some version of that descent. Once you can place any line on that
          ladder, you can navigate a file you&apos;ve never seen before — you always know whether you&apos;re looking at
          structure or at data, and which level you&apos;re on.
        </p>
      </ArticleSection>

      <ArticleSection title="How to read a file top to bottom">
        <p>Put it together and any X12 file reads in a predictable order:</p>
        <ol className="ml-5 list-decimal space-y-2 text-sm">
          <li>Read the <Seg>ISA</Seg> — learn the delimiters, the version, and the sender/receiver.</li>
          <li>Read each <Seg>GS</Seg> — note the transaction type and implementation guide (e.g. <Seg>005010X222A1</Seg>).</li>
          <li>For each <Seg>ST</Seg>, read the transaction content (the claim, payment, or enrollment).</li>
          <li>Confirm the <Seg>SE</Seg>/<Seg>GE</Seg>/<Seg>IEA</Seg> trailers — counts and control numbers — to know the file is complete.</li>
        </ol>
        <p>
          The version string in the <Seg>GS08</Seg> and <Seg>ISA12</Seg> is worth a closer look on its own — see{" "}
          <Link href="/blog/x12-vs-5010-vs-7030" className="font-medium text-accent underline-offset-2 hover:underline">
            X12 vs 5010 vs 7030
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="Why X12 looks the way it does">
        <p>
          The format can feel hostile the first time you see it — no labels, no whitespace, just delimited codes. But
          every choice is deliberate. X12 was designed in an era where <strong>compactness</strong> and{" "}
          <strong>unambiguous machine parsing</strong> mattered more than human readability: positional elements (the
          third element of <Seg>NM1</Seg> is always the last name) mean no field labels are needed, and declared
          delimiters mean a parser never has to guess where a value ends. The envelope&apos;s control numbers and counts
          make the format <strong>self-verifying</strong> — a receiver can prove a transmission arrived intact without
          any out-of-band information.
        </p>
        <p>
          Once you internalize that the file is built for a machine first, the human approach becomes clear: don&apos;t
          read it linearly like prose; read it structurally. Find the envelope, identify the transaction, then navigate
          to the loop you care about. That&apos;s exactly what a viewer automates.
        </p>
      </ArticleSection>

      <ArticleSection title="Common envelope problems">
        <p>
          Most &ldquo;the file won&apos;t process&rdquo; issues are envelope issues, and they show up as a TA1 or 999
          rejection. The usual suspects:
        </p>
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li><span className="text-ink">Control numbers don&apos;t match.</span> <Seg>ISA13</Seg> ≠ <Seg>IEA02</Seg> (or the GS/GE, ST/SE pair) — the receiver can&apos;t confirm the envelope is whole.</li>
          <li><span className="text-ink">Counts are off.</span> <Seg>SE01</Seg> doesn&apos;t equal the actual segment count, or <Seg>GE01</Seg>/<Seg>IEA01</Seg> miscount the groups — a sign of truncation or a generation bug.</li>
          <li><span className="text-ink">Delimiter collision.</span> A delimiter character (<Seg>*</Seg>, <Seg>:</Seg>, <Seg>~</Seg>) appears inside the data, so the file splits in the wrong places.</li>
          <li><span className="text-ink">Wrong version in the header.</span> The <Seg>ISA12</Seg>/<Seg>GS08</Seg> version doesn&apos;t match what the receiver expects.</li>
          <li><span className="text-ink">Truncated file.</span> A missing <Seg>IEA</Seg> or <Seg>SE</Seg> trailer — often the first clue a transfer was cut off mid-stream.</li>
        </ul>
        <p>
          Checking the envelope first — control numbers balance, counts are right, trailers are present — rules out the
          most common failures before you ever look at the business content.
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

      <ArticleSection title="See the envelope mapped for you">
        <p>
          {SITE_NAME} reads the envelope so you don&apos;t have to count positions — drop any X12 file and it detects
          the delimiters, identifies the transaction type and version, and maps the ISA/GS/ST structure before turning
          the content into a clean table. The file is parsed entirely in your browser; nothing is uploaded.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open a file in EDIAnalyst →
          </Link>{" "}
          ·{" "}
          <Link href="/blog/x12-segments-cheat-sheet" className="font-medium text-accent underline-offset-2 hover:underline">
            X12 segments cheat sheet →
          </Link>{" "}
          ·{" "}
          <Link href="/blog/x12-vs-5010-vs-7030" className="font-medium text-accent underline-offset-2 hover:underline">
            X12 vs 5010 vs 7030 →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
