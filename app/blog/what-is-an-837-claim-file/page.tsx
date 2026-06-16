import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("what-is-an-837-claim-file")!;

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
    q: "What is an 837 file in simple terms?",
    a: "It's the electronic healthcare claim — the standardized X12 EDI file a provider sends a payer to request payment for services. It's the digital replacement for paper claim forms like the CMS-1500 and UB-04.",
  },
  {
    q: "What are the 837P, 837I, and 837D?",
    a: "They're the three variants of the 837. 837P is the professional claim (physicians, clinics; CMS-1500). 837I is the institutional claim (hospitals, facilities; UB-04). 837D is the dental claim. They share a structure but differ in their service lines and coding.",
  },
  {
    q: "How do I open or read an 837 file?",
    a: "An 837 is plain text, but it's a nested hierarchy of cryptic segments, so a text editor isn't enough. A viewer that flattens it into one row per claim — with diagnoses, service lines, and validation — makes it readable. EDIAnalyst does this in your browser, with nothing uploaded.",
  },
  {
    q: "What happens to an 837 after it's sent?",
    a: "The payer acknowledges it (a 999 for syntax, a 277CA for claim acceptance), adjudicates it against the member's benefits, and returns an 835 remittance with the payment and the reason for every paid or unpaid dollar.",
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
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "What is an 837" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="What is an 837 claim file? A healthcare analyst's primer"
      intro="The 837 is the electronic healthcare claim — the file that gets providers paid. This primer explains what it is, why it exists, how it's structured, and how to actually read one, without assuming you've seen X12 before."
      published={post.published}
      description={post.metaDescription}
    >
      <JsonLd data={faqLd} />

      <ArticleSection title="What the 837 is, and why it exists">
        <p>
          An <strong>837</strong> is a healthcare claim in electronic form. When a provider — a doctor&apos;s office, a
          hospital, a lab — wants to be paid for a service, they send a claim to the patient&apos;s insurer. For
          decades that meant a paper form (the CMS-1500 for professionals, the UB-04 for facilities). The 837 is the
          standardized electronic replacement, defined by the <strong>X12</strong> standards body and required under
          HIPAA so that every provider and payer exchanges claims the same way.
        </p>
        <p>
          That standardization is the whole point. Instead of each payer inventing its own format, a provider produces
          one 837 that any payer can ingest. The trade-off is that the file is built for machines, not people: it&apos;s
          a dense string of segments and codes. Once you understand the shape, though, it reads cleanly — and that&apos;s
          what this primer is for.
        </p>
      </ArticleSection>

      <ArticleSection title="Where the 837 sits in the claim lifecycle">
        <p>
          The 837 is the first step of a longer conversation between provider and payer. End to end:
        </p>
        <ol className="ml-5 list-decimal space-y-2 text-sm">
          <li><span className="text-ink">Create &amp; submit.</span> The provider&apos;s billing system produces the <Seg>837</Seg> and sends it — usually through a clearinghouse that forwards it to the right payer.</li>
          <li><span className="text-ink">Acknowledge.</span> The payer or clearinghouse returns a <Seg>999</Seg> (did the file&apos;s syntax conform?) and a <strong>277CA</strong> (was each claim accepted for processing?).</li>
          <li><span className="text-ink">Adjudicate.</span> The payer applies the member&apos;s eligibility, the provider&apos;s contract, and its edits to decide what to pay.</li>
          <li><span className="text-ink">Remit.</span> The payer returns an <Seg>835</Seg> remittance with the payment and a coded reason for every paid, adjusted, or denied dollar.</li>
        </ol>
        <p>
          So an 837 doesn&apos;t live in isolation — it has acknowledgments behind it and a remittance ahead of it. See{" "}
          <Link href="/blog/835-vs-837" className="font-medium text-accent underline-offset-2 hover:underline">
            835 vs 837
          </Link>{" "}
          for how the claim and the payment connect.
        </p>
      </ArticleSection>

      <ArticleSection title="The three variants: P, I, and D">
        <p>
          &ldquo;The 837&rdquo; is really a family of three, because different providers bill differently:
        </p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {[
            ["837P — Professional", "Physicians, clinics, labs, individual practitioners. The electronic CMS-1500. CPT/HCPCS procedures and a place-of-service code."],
            ["837I — Institutional", "Hospitals and facilities. The electronic UB-04. NUBC revenue codes, a type of bill, and value/condition/occurrence codes."],
            ["837D — Dental", "Dental providers. The electronic ADA dental claim, with tooth- and surface-level detail."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[12rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{k}</dt>
              <dd className="text-sm text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <p>
          They share a skeleton but aren&apos;t interchangeable — a fuller comparison is in{" "}
          <Link href="/blog/837p-vs-837i" className="font-medium text-accent underline-offset-2 hover:underline">
            837P vs 837I
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="How an 837 is structured: the loops">
        <p>
          An 837 isn&apos;t a flat list of rows — it&apos;s a <strong>hierarchy</strong>. It&apos;s built from{" "}
          <Seg>HL</Seg> (hierarchical level) loops that nest from the provider down to the individual service, so that
          shared information isn&apos;t repeated for every claim. Reading an 837 means keeping track of which level
          you&apos;re in. The loops that matter:
        </p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {[
            ["Billing provider (2000A / 2010AA)", "Who is billing — the practice or facility, with its NPI and tax ID."],
            ["Subscriber (2000B / 2010BA)", "The insured person and their member ID, plus the payer being billed (2010BB)."],
            ["Patient (2000C)", "Present only when the patient isn't the subscriber — e.g. a dependent child."],
            ["Claim (2300)", "One per claim. The CLM segment carries the patient control number, total charge, and place of service or type of bill; the HI segment carries the diagnoses."],
            ["Service line (2400)", "One per procedure. SV1 (professional) or SV2 (institutional) carries the code, charge, units, and diagnosis pointers."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[13rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{k}</dt>
              <dd className="text-sm text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <p>
          The reason for the hierarchy is reuse: one billing provider can submit for many subscribers, and each
          subscriber can have several claims. The loops carry that context downward so each claim &ldquo;inherits&rdquo;
          its provider and subscriber rather than repeating them.
        </p>
      </ArticleSection>

      <ArticleSection title="The segments you'll actually read">
        <p>Inside those loops, a handful of segments carry the substance of the claim:</p>
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li><Seg>NM1</Seg> — names and identifiers (billing provider NPI, subscriber, payer).</li>
          <li><Seg>CLM</Seg> — the claim header: control number, total charge, and place of service / type of bill.</li>
          <li><Seg>HI</Seg> — the diagnoses (ICD-10), principal first.</li>
          <li><Seg>SV1</Seg> / <Seg>SV2</Seg> — each service line, with the procedure or revenue code, charge, units, and pointers to the diagnoses that justify it.</li>
          <li><Seg>DTP</Seg> — dates of service.</li>
        </ul>
        <p>
          The wider envelope around the claims — the <Seg>ISA</Seg>/<Seg>GS</Seg>/<Seg>ST</Seg> wrapper — handles
          routing and control, and is the same across all X12 transactions; see{" "}
          <Link href="/blog/anatomy-of-an-x12-file" className="font-medium text-accent underline-offset-2 hover:underline">
            anatomy of an X12 file
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="How an 837 becomes an 835">
        <p>
          The 837 is only half the story. After the payer adjudicates it, it returns an <Seg>835</Seg> remittance — the
          payment and the explanation. The patient control number you put in the 837&apos;s <Seg>CLM01</Seg> comes back
          in the 835&apos;s <Seg>CLP01</Seg>, which is how a posting team ties a payment back to the claim that earned
          it. If a claim was short-paid or denied, the 835&apos;s CARC/RARC codes say why. That round trip — claim out,
          remittance back — is the core of the revenue cycle.
        </p>
      </ArticleSection>

      <ArticleSection title="Who handles an 837 along the way">
        <p>
          An 837 passes through several hands between the exam room and the payment, and knowing the players helps the
          file make sense:
        </p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {[
            ["The provider / billing staff", "Capture the visit and produce the claim — diagnoses, procedures, charges — usually in a practice-management or hospital billing system."],
            ["The billing system / vendor", "Generates the actual 837 file from that data, applying the X12 rules so the output conforms to the implementation guide."],
            ["The clearinghouse", "A middleman most providers send through. It scrubs claims, routes each to the correct payer, and returns acknowledgments (a 999 and a 277CA)."],
            ["The payer", "Receives the 837, adjudicates it against the member's benefits and the provider's contract, and returns the 835 with payment."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[12rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{k}</dt>
              <dd className="text-sm text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <p>
          This is why an analyst sees acknowledgments come back before any payment: the clearinghouse and payer each
          check the file before money moves. It&apos;s also why the same claim can be described slightly differently at
          each hop — the provider&apos;s control number, the clearinghouse&apos;s tracking, and the payer&apos;s claim
          number are all different identifiers for the same claim.
        </p>
      </ArticleSection>

      <ArticleSection title="A single claim, walked through">
        <p>
          To make the abstract concrete, picture one office visit moving through an 837P. The billing provider loop
          carries the practice&apos;s name and <Seg>NPI</Seg>. The subscriber loop carries the patient (or, if the
          patient is a dependent, a patient loop nested under the subscriber) and the payer being billed. The claim loop
          opens with a <Seg>CLM</Seg> that holds the practice&apos;s own claim number, the total charge, and the place
          of service — say, <Seg>11</Seg> for an office. The <Seg>HI</Seg> segment lists the diagnoses that justify the
          visit. Then one <Seg>SV1</Seg> service line carries the procedure code (a CPT like an office-visit level), its
          charge, the units, and a pointer back to the diagnosis it supports.
        </p>
        <p>
          That single claim is a few dozen segments. A real file stacks hundreds of them under one envelope — which is
          why reading an 837 by scrolling raw text doesn&apos;t scale, and why flattening it into rows is the move.
        </p>
      </ArticleSection>

      <ArticleSection title="Reading one in practice">
        <p>
          You can open an 837 in a text editor, but the nesting and the delimiters make it hard to follow, and a real
          file has hundreds of claims. The practical move is to <strong>flatten</strong> it: one row per claim, with the
          billing provider, patient, charge, diagnoses, and service lines pulled into columns. Then you can check the
          things payers reject on:
        </p>
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li>A billing provider <strong>NPI</strong> is present.</li>
          <li>The claim has at least one <strong>diagnosis</strong>.</li>
          <li>Every service line&apos;s <strong>diagnosis pointer</strong> references a diagnosis that&apos;s actually on the claim.</li>
          <li>The claim <strong>balances</strong> — the total equals the sum of the line charges.</li>
        </ul>
        <p>
          For a deeper, segment-level tour of the professional claim, see{" "}
          <Link href="/blog/reading-837p-loops-and-segments" className="font-medium text-accent underline-offset-2 hover:underline">
            reading an 837P
          </Link>
          , and for getting the data into a spreadsheet,{" "}
          <Link href="/blog/convert-837-claim-to-excel" className="font-medium text-accent underline-offset-2 hover:underline">
            convert an 837 to Excel
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="The identifiers you'll reconcile on">
        <p>
          A claim carries several identifiers, and knowing which is which saves hours when you&apos;re tracking a claim
          through its lifecycle:
        </p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {[
            ["Patient control number (CLM01)", "Your own number for the claim. It's echoed back on the 835 (in CLP01), so it's the key you use to match a payment to the claim that earned it."],
            ["Billing provider NPI", "The 10-digit identifier for who's billing. A missing or wrong NPI is one of the most common reasons a claim rejects."],
            ["Subscriber / member ID", "Identifies the insured person to the payer. A mismatch here means the payer can't find the patient and the claim won't process."],
            ["Payer claim control number", "Assigned by the payer once it has the claim; it comes back on the 835 (CLP07) and is what you quote when you call or appeal."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[14rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{k}</dt>
              <dd className="text-sm text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <p>
          The through-line that matters most is the patient control number: you assign it on the 837, and it returns on
          the 835. That single thread is how an entire revenue-cycle team ties payments back to the claims they came
          from.
        </p>
      </ArticleSection>

      <ArticleSection title="Claims vs encounters">
        <p>
          One distinction trips up newcomers: not every 837 is a request for payment. In managed care, a provider paid
          under capitation still has to <em>report</em> the services they delivered, so they send an 837 as an{" "}
          <strong>encounter</strong> — the same format, but used to inform the payer rather than to bill. It looks
          almost identical to a fee-for-service claim; the difference is intent and a few indicators. If you&apos;re
          analyzing volume in a managed-care book, knowing whether you&apos;re looking at claims or encounters changes
          what the numbers mean.
        </p>
      </ArticleSection>

      <ArticleSection title="Common points of confusion">
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li><span className="text-ink">837 vs 835.</span> The 837 is the claim out; the 835 is the payment back. Different direction, different segments.</li>
          <li><span className="text-ink">P vs I.</span> Professional and institutional aren&apos;t the same file — they use different service lines and coding.</li>
          <li><span className="text-ink">Claim vs encounter.</span> An encounter is an 837 used to report a service for which no payment is expected (common in managed care), not to request payment.</li>
          <li><span className="text-ink">One file, many claims.</span> An 837 file typically holds many claims under one envelope — it&apos;s not one file per claim.</li>
          <li><span className="text-ink">Delimiters look like data.</span> The <Seg>*</Seg> and <Seg>~</Seg> characters are separators, not part of the values.</li>
        </ul>
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

      <ArticleSection title="Read your first 837 right now">
        <p>
          The fastest way to understand an 837 is to open one. {SITE_NAME} is a free, browser-based viewer: drop in a
          claim file (or open a synthetic sample) and it detects whether it&apos;s professional or institutional,
          flattens every claim into a readable row, and flags what a payer would reject on. Nothing is uploaded — the
          file is parsed entirely on your device.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open an 837 in EDIAnalyst →
          </Link>{" "}
          ·{" "}
          <Link href="/blog/837p-vs-837i" className="font-medium text-accent underline-offset-2 hover:underline">
            837P vs 837I →
          </Link>{" "}
          ·{" "}
          <Link href="/blog/835-vs-837" className="font-medium text-accent underline-offset-2 hover:underline">
            835 vs 837 →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
