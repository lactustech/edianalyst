import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("837p-vs-837i")!;

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

const ROWS: [string, string, string][] = [
  ["Paper equivalent", "CMS-1500 (the 08/05 professional claim form)", "UB-04 / CMS-1450 (the institutional claim form)"],
  ["Who bills it", "Physicians, clinics, labs, and other individual practitioners", "Hospitals and facilities — inpatient, outpatient, SNF, home health"],
  ["Service-line segment", "SV1 — professional service line", "SV2 — institutional service line"],
  ["Procedure coding", "CPT / HCPCS procedure codes with modifiers", "NUBC revenue codes (plus HCPCS where required)"],
  ["Setting indicator", "Place of service code (CLM05-1)", "Type of bill (CLM05-1) — facility type + bill classification"],
  ["Facility-specific codes", "Rarely used", "Value codes, condition codes, occurrence codes"],
  ["Implementation guide", "005010X222 (837P)", "005010X223 (837I)"],
];

const FAQ = [
  {
    q: "Is the 837P the same as a CMS-1500?",
    a: "The 837P is the electronic EDI equivalent of the paper CMS-1500 professional claim. They carry the same kind of information — a physician or clinic billing for professional services — but the 837P is the X12 transaction sent electronically rather than a printed form.",
  },
  {
    q: "Is the 837I the same as a UB-04?",
    a: "Yes, in the same sense: the 837I is the electronic equivalent of the paper UB-04 (also called CMS-1450), the institutional claim form hospitals and facilities use. The 837I carries the type of bill and NUBC revenue codes that the UB-04 captures.",
  },
  {
    q: "Can one 837 file contain both professional and institutional claims?",
    a: "No. A single 837 functional group is either professional (X222) or institutional (X223) — they use different implementation guides. A submitter sending both produces separate 837P and 837I files (or separate functional groups).",
  },
  {
    q: "What about the 837D?",
    a: "The 837D is the dental claim (the EDI equivalent of the ADA dental claim form). It's a third variant of the 837 alongside professional and institutional, with its own dental-specific service lines.",
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
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "837P vs 837I" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="837P vs 837I: professional vs institutional claims, explained"
      intro="The 837 comes in two main flavors — professional and institutional — and they're not interchangeable. Here's exactly how the 837P and 837I differ, from the paper forms they replace down to the segments, with a side-by-side table and a quick way to tell which one you're holding."
      published={post.published}
      description={post.metaDescription}
    >
      <JsonLd data={faqLd} />

      <ArticleSection title="First, what the 837 is">
        <p>
          The 837 is the X12 transaction a provider sends a payer to get paid for healthcare services — the electronic
          replacement for paper claim forms. It carries who provided the care, who the patient is, what was done, and
          what it cost. But &ldquo;the 837&rdquo; isn&apos;t one thing: it splits into <strong>professional</strong>{" "}
          (837P), <strong>institutional</strong> (837I), and <strong>dental</strong> (837D) variants, because a
          physician&apos;s office and a hospital bill very differently.
        </p>
        <p>
          Knowing which variant you&apos;re looking at matters, because the same field can mean different things, and a
          tool, a payer, or a teammate will assume one or the other. For the full ground-up explanation, see{" "}
          <Link href="/blog/what-is-an-837-claim-file" className="font-medium text-accent underline-offset-2 hover:underline">
            what is an 837 claim file
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="837P — the professional claim">
        <p>
          The <strong>837P</strong> is the electronic equivalent of the paper <strong>CMS-1500</strong>. It&apos;s what
          physicians, clinics, labs, therapists, and other individual practitioners use to bill for professional
          services. Its defining feature is the procedure: each service line (the <Seg>SV1</Seg> segment) carries a{" "}
          <strong>CPT or HCPCS</strong> code with modifiers, a charge, units, and pointers to the diagnoses that justify
          it.
        </p>
        <p>
          The 837P also uses a <strong>place of service</strong> code (in <Seg>CLM05-1</Seg>) to say where care happened
          — office, home, telehealth, emergency room. That place-of-service code drives both coverage and payment; the
          wrong one is a common denial. See the{" "}
          <Link href="/edi/837/place-of-service-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            place of service codes
          </Link>{" "}
          reference for the full list.
        </p>
      </ArticleSection>

      <ArticleSection title="837I — the institutional claim">
        <p>
          The <strong>837I</strong> is the electronic equivalent of the paper <strong>UB-04</strong> (also called the
          CMS-1450). It&apos;s how hospitals and facilities bill — inpatient stays, outpatient services, skilled
          nursing, home health. Instead of CPT procedures on the line, the institutional service line (the{" "}
          <Seg>SV2</Seg> segment) leads with a <strong>NUBC revenue code</strong> that describes the department or kind
          of service (room and board, pharmacy, lab, OR), often alongside a HCPCS code where the payer requires it.
        </p>
        <p>
          Where the 837P uses a place of service, the 837I uses a <strong>type of bill</strong> (also in{" "}
          <Seg>CLM05-1</Seg>) that encodes the facility type and the bill&apos;s classification and frequency. The 837I
          also carries facility-specific data the professional claim rarely needs: <strong>value codes</strong>{" "}
          (amounts like blood deductible or covered days), <strong>condition codes</strong>, and{" "}
          <strong>occurrence codes</strong> (dates of events that affect the claim).
        </p>
      </ArticleSection>

      <ArticleSection title="And the 837D, in one line">
        <p>
          The <strong>837D</strong> is the dental claim — the EDI equivalent of the ADA dental claim form, with
          dental-specific service lines and tooth/surface detail. Same 837 family, different domain.
        </p>
      </ArticleSection>

      <ArticleSection title="The key structural differences">
        <p>
          Both variants share the same skeleton: an <Seg>HL</Seg> hierarchy that nests billing provider → subscriber →
          claim, a <Seg>CLM</Seg> claim header, and <Seg>HI</Seg> diagnoses. What changes is mostly the service line and
          the setting indicator:
        </p>
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li><span className="text-ink">Service line:</span> <Seg>SV1</Seg> (professional, CPT/HCPCS) vs <Seg>SV2</Seg> (institutional, revenue codes).</li>
          <li><span className="text-ink">Setting:</span> place of service vs type of bill, both in <Seg>CLM05</Seg>.</li>
          <li><span className="text-ink">Extra facility data:</span> value/condition/occurrence codes appear on the 837I, not the 837P.</li>
          <li><span className="text-ink">Implementation guide:</span> the transaction declares <Seg>005010X222</Seg> for professional or <Seg>005010X223</Seg> for institutional.</li>
        </ul>
      </ArticleSection>

      <ArticleSection title="837P vs 837I, side by side">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink text-left">
                <th className="py-2 pr-4 font-semibold text-ink">Aspect</th>
                <th className="py-2 pr-4 font-semibold text-ink">837P (professional)</th>
                <th className="py-2 font-semibold text-ink">837I (institutional)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ROWS.map((r) => (
                <tr key={r[0]}>
                  <td className="py-2 pr-4 font-medium text-ink align-top">{r[0]}</td>
                  <td className="py-2 pr-4 text-muted align-top">{r[1]}</td>
                  <td className="py-2 text-muted align-top">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ArticleSection>

      <ArticleSection title="How to tell which one you're holding">
        <p>Two reliable tells, without reading the whole file:</p>
        <ol className="ml-5 list-decimal space-y-2 text-sm">
          <li>
            <span className="text-ink">Check the implementation reference.</span> Near the top of the transaction
            (the <Seg>GS08</Seg> and the <Seg>ST03</Seg>), look for <Seg>005010X222</Seg> (with the
            <Seg>A1</Seg>/<Seg>A2</Seg> addenda) for <strong>professional</strong>, or <Seg>005010X223</Seg> for{" "}
            <strong>institutional</strong>. That string is definitive.
          </li>
          <li>
            <span className="text-ink">Look at the service lines.</span> If you see <Seg>SV1</Seg> with CPT/HCPCS
            codes, it&apos;s professional. If you see <Seg>SV2</Seg> with revenue codes, it&apos;s institutional.
          </li>
        </ol>
        <p>
          For a deeper walk through the loops and segments of the professional claim specifically, see{" "}
          <Link href="/blog/reading-837p-loops-and-segments" className="font-medium text-accent underline-offset-2 hover:underline">
            reading an 837P
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

      <ArticleSection title="Let the tool tell you">
        <p>
          You don&apos;t have to hunt for the implementation reference by hand. Drop an 837 into {SITE_NAME} — it
          auto-detects professional vs institutional, labels every loop, and flattens the claim into one readable row.
          The file is parsed entirely in your browser; nothing is uploaded.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open an 837 in EDIAnalyst →
          </Link>{" "}
          ·{" "}
          <Link href="/blog/what-is-an-837-claim-file" className="font-medium text-accent underline-offset-2 hover:underline">
            What is an 837 claim file? →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
