import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("x12-segments-cheat-sheet")!;

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

// [segment, meaning, common qualifiers / key elements, one-line example]
const GROUPS: { title: string; note: string; rows: [string, string, string, string][] }[] = [
  {
    title: "Envelope & control",
    note: "The wrapper around every X12 file — same in 834, 835, 837, and the rest.",
    rows: [
      ["ISA", "Interchange header — opens the transmission", "Sender/receiver IDs, version (ISA12), control # (ISA13)", "ISA*00*…*ZZ*SENDER*ZZ*RECEIVER*…*00501*000000001*0*P*:~"],
      ["GS", "Functional group header — a batch of one transaction type", "GS01 type (HC=claim), GS08 implementation guide", "GS*HC*SENDER*RECEIVER*20260616*1200*1*X*005010X222A1~"],
      ["ST", "Transaction set header — one document", "ST01 transaction (837/835/834), ST02 control #", "ST*837*0001*005010X222A1~"],
      ["BHT", "Beginning of hierarchical transaction", "Purpose & reference of the transaction", "BHT*0019*00*REF123*20260616*1200*CH~"],
      ["SE / GE / IEA", "Trailers — close ST, GS, ISA with counts & control #s", "Segment/group/interchange counts must balance", "SE*42*0001~  GE*1*1~  IEA*1*000000001~"],
    ],
  },
  {
    title: "Names, references & dates (shared)",
    note: "These appear across transactions — learn them once and you read most of any file.",
    rows: [
      ["NM1", "Name & identifier of a party (person or org)", "Entity ID qualifier (e.g. IL subscriber, 85 billing provider); ID code", "NM1*IL*1*DOE*JANE****MI*123456789~"],
      ["N3 / N4", "Street address; city / state / ZIP", "—", "N3*123 MAIN ST~  N4*AUSTIN*TX*78701~"],
      ["REF", "Reference identifier", "Qualifier (0F subscriber ID, 1L group #, EA medical record)", "REF*0F*SUB123456~"],
      ["DTP", "Date or date range", "Qualifier (348 benefit begin, 349 benefit end, 472 service)", "DTP*472*D8*20260616~"],
      ["DMG", "Demographics", "DMG02 date of birth, DMG03 gender", "DMG*D8*19850101*F~"],
      ["PER", "Contact information", "Phone, email, fax", "PER*IC*BILLING*TE*5125551212~"],
      ["HL", "Hierarchical level — builds the loop tree", "HL parent / level code (provider, subscriber, patient)", "HL*1**20*1~"],
    ],
  },
  {
    title: "837 — claim",
    note: "The professional/institutional claim. See the 837 reference for the full structure.",
    rows: [
      ["CLM", "Claim header", "CLM01 patient control #, CLM02 total charge, CLM05 place of service / type of bill", "CLM*PCN001*250***11:B:1*Y*A*Y*Y~"],
      ["HI", "Health care diagnoses (ICD-10)", "Qualifier ABK principal, ABF additional", "HI*ABK:E119*ABF:I10~"],
      ["SV1", "Professional service line", "Procedure (CPT/HCPCS), charge, units, diagnosis pointers", "SV1*HC:99213*125*UN*1***1~"],
      ["SV2", "Institutional service line", "Revenue code, procedure, charge, units", "SV2*0450*HC:99283*350*UN*1~"],
      ["SBR", "Subscriber / payer relationship", "Payer responsibility (P/S/T), filing indicator", "SBR*P*18*******CI~"],
    ],
  },
  {
    title: "835 — remittance",
    note: "The payment/remittance. See the 835 reference and the denial-code pages for adjustments.",
    rows: [
      ["BPR", "Financial / payment header", "Amount, method (ACH/CHK/NON), effective date", "BPR*I*1500*C*ACH*…*20260616~"],
      ["TRN", "Trace number (reassociation)", "The EFT/check number tying remit to payment", "TRN*1*EFT123456*1512345678~"],
      ["CLP", "Claim-level payment", "CLP02 status (1 paid, 4 denied), charge, paid, CLP07 payer claim #", "CLP*PCN001*1*250*200*30*MC*CLM987*11~"],
      ["CAS", "Claim/line adjustment", "Group code (CO/PR/OA/PI) + CARC + amount", "CAS*CO*45*50~"],
      ["SVC", "Service-line payment", "Procedure, line charge, line paid", "SVC*HC:99213*125*100~"],
      ["LQ", "Remark codes (RARC)", "Qualifier HE + RARC code", "LQ*HE*N130~"],
    ],
  },
  {
    title: "834 — enrollment",
    note: "Benefit enrollment & maintenance. See the 834 reference and enrollment codes.",
    rows: [
      ["INS", "Member level — opens each member loop", "INS01 subscriber Y/N, INS02 relationship, INS03 maintenance type", "INS*Y*18*021*28*A***FT~"],
      ["HD", "Health coverage", "HD03 insurance line (HLT/DEN/VIS), HD05 coverage level", "HD*021**HLT*PLAN A*EMP~"],
      ["COB", "Coordination of benefits", "Other payer & responsibility", "COB*P*POLICY123*1~"],
      ["LX", "Loop counter for repeating detail", "Sequence number", "LX*1~"],
    ],
  },
];

const FAQ = [
  {
    q: "What is an X12 segment?",
    a: "A segment is one line of an X12 file — a tag like NM1 or CLM followed by its data elements, separated by a delimiter and ended by a segment terminator. Segments group into loops, which give the file its hierarchy.",
  },
  {
    q: "What's a qualifier in an X12 segment?",
    a: "A qualifier is a code in one element that tells you how to read another. For example, in REF the qualifier 0F means the value that follows is a subscriber ID; in DTP, 349 means the date is a benefit-end date. The same segment carries different meanings depending on its qualifier.",
  },
  {
    q: "Which segments appear in every transaction?",
    a: "The envelope (ISA/GS/ST … SE/GE/IEA) is in every file, and the shared segments — NM1, REF, DTP, DMG, N3/N4, PER — appear across 834, 835, and 837. The transaction-specific segments (CLM, HI, SV1 for claims; BPR, CLP, CAS for remittances; INS, HD for enrollment) tell you which transaction you're in.",
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
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "Segments cheat sheet" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="Common X12 segments cheat sheet: INS, NM1, CLM, DTP, REF, HD"
      intro="A scannable reference to the X12 EDI segments you hit most across 834, 835, and 837 — what each one means, the qualifiers that change how you read it, and a one-line example. Bookmark it."
      published={post.published}
      description={post.metaDescription}
    >
      <JsonLd data={faqLd} />

      <ArticleSection title="How to use this">
        <p>
          X12 has hundreds of segments, but day to day you read the same few dozen. This page groups the workhorses by
          where they show up — the envelope, the shared building blocks, and the segments specific to claims,
          remittances, and enrollment. For each: a plain-English meaning, the common <strong>qualifiers</strong> or key
          elements that change how you read it, and a short example. If the envelope itself is new to you, read{" "}
          <Link href="/blog/anatomy-of-an-x12-file" className="font-medium text-accent underline-offset-2 hover:underline">
            anatomy of an X12 file
          </Link>{" "}
          first. Examples use <Seg>*</Seg> as the element separator and <Seg>~</Seg> as the segment terminator.
        </p>
      </ArticleSection>

      {GROUPS.map((g) => (
        <ArticleSection key={g.title} title={g.title}>
          <p>{g.note}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink text-left">
                  <th className="py-2 pr-4 font-semibold text-ink">Segment</th>
                  <th className="py-2 pr-4 font-semibold text-ink">Meaning</th>
                  <th className="py-2 pr-4 font-semibold text-ink">Common qualifiers / key elements</th>
                  <th className="py-2 font-semibold text-ink">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {g.rows.map((r) => (
                  <tr key={r[0]}>
                    <td className="py-2 pr-4 align-top font-mono font-semibold text-accent">{r[0]}</td>
                    <td className="py-2 pr-4 align-top text-muted">{r[1]}</td>
                    <td className="py-2 pr-4 align-top text-muted">{r[2]}</td>
                    <td className="py-2 align-top font-mono text-xs text-ink">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ArticleSection>
      ))}

      <ArticleSection title="Reading the references in depth">
        <p>
          When you need more than a one-liner, the per-transaction references go deeper — the{" "}
          <Link href="/edi/835" className="font-medium text-accent underline-offset-2 hover:underline">835</Link>,{" "}
          <Link href="/edi/837" className="font-medium text-accent underline-offset-2 hover:underline">837</Link>, and{" "}
          <Link href="/edi/834" className="font-medium text-accent underline-offset-2 hover:underline">834</Link>{" "}
          pages — and the code references decode the values inside these segments: the{" "}
          <Link href="/edi/835/denial-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            CARC/RARC on a CAS/LQ
          </Link>
          , the{" "}
          <Link href="/edi/834/enrollment-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            INS/HD values
          </Link>
          , and the{" "}
          <Link href="/edi/277/status-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            STC status codes
          </Link>
          .
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

      <ArticleSection title="Stop memorizing segments">
        <p>
          A cheat sheet helps, but the fastest way to read a segment is to let the tool label it. Drop any X12 file into{" "}
          {SITE_NAME} and it identifies every segment and element, decodes the qualifiers, and turns the file into a
          clean table — parsed entirely in your browser, nothing uploaded.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open a file in EDIAnalyst →
          </Link>{" "}
          ·{" "}
          <Link href="/blog/anatomy-of-an-x12-file" className="font-medium text-accent underline-offset-2 hover:underline">
            Anatomy of an X12 file →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
