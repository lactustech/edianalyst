import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("reading-837p-loops-and-segments")!;

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
    q: "What's the difference between 837P and 837I?",
    a: "837P is the professional claim (doctor or clinic) with CPT/HCPCS procedures in SV1 and place-of-service codes. 837I is the institutional claim (hospital or facility) with NUBC revenue codes in SV2 and a type of bill. EDIAnalyst detects which one you dropped.",
  },
  {
    q: "What's the single most common 837P rejection?",
    a: "Missing or invalid information — a missing billing NPI, no diagnosis, or a service line pointing to a diagnosis that isn't on the claim. These are structural checks you can run before you ever submit.",
  },
  {
    q: "Do I need to read the ISA/GS envelope?",
    a: "Rarely for claim problems. The envelope and submitter/receiver loops matter for routing and acknowledgments, but the reason a claim is wrong almost always lives in the CLM, HI, or SV1 segments.",
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
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "Reading an 837P" }]}
        path={`/blog/${post.slug}`}
        kicker={post.kicker}
        title="Reading an 837P: which loops and segments actually matter"
        intro="An 837P has dozens of segments, but only a handful decide whether a claim is complete and payable. Here's the practical map — the HL hierarchy and the CLM, HI, and SV1 segments worth your attention."
        published={post.published}
        description={post.metaDescription}
      >
        <ArticleSection title="The shape: an HL hierarchy">
          <p>
            An 837P (professional claim) is built as a hierarchy of <Seg>HL</Seg> loops that nest from the billing
            provider down to the claim. The envelope around it (<Seg>ISA</Seg>/<Seg>GS</Seg>/<Seg>ST</Seg>,{" "}
            <Seg>BHT</Seg>) and the submitter/receiver loops (<Seg>1000A</Seg>/<Seg>1000B</Seg>) matter for routing, but
            they rarely tell you why a claim is wrong. The meaningful structure is the chain of HL loops:
          </p>
          <dl className="mt-2 divide-y divide-line border-y border-line">
            {[
              ["2000A / 2010AA", "Billing provider HL and its name loop — carries the billing NPI and tax ID."],
              ["2000B / 2010BA", "Subscriber HL and the subscriber's name (NM1) and demographics."],
              ["2010BB", "The payer being billed."],
              ["2000C / 2010CA", "Patient HL — present only when the patient isn't the subscriber (e.g. a dependent)."],
              ["2300", "The claim loop — one per claim. This is where the money lives."],
              ["2400", "Service line loops — one per procedure on the claim."],
            ].map(([seg, desc]) => (
              <div key={seg} className="grid grid-cols-[8rem_1fr] gap-4 py-3">
                <dt className="font-mono text-sm font-semibold text-accent">{seg}</dt>
                <dd className="text-sm text-muted">{desc}</dd>
              </div>
            ))}
          </dl>
          <p>
            The reason it&apos;s a hierarchy and not a flat list is reuse: one billing provider can submit for many
            subscribers, and each subscriber can have several claims. The HL loops carry that context downward, so a
            single claim &ldquo;inherits&rdquo; its billing provider and subscriber rather than repeating them. When you
            read an 837P, the first job is to keep track of which provider and subscriber the current claim sits under.
          </p>
        </ArticleSection>

        <ArticleSection title="The segments that decide the claim">
          <p>Inside that hierarchy, these are the segments to actually read:</p>
          <dl className="mt-2 divide-y divide-line border-y border-line">
            {[
              ["NM1 (billing)", "The billing provider name and NPI (NM109). A missing or wrong billing NPI is a top rejection cause."],
              ["SBR", "Subscriber/payer relationship and claim-filing indicator — primary, secondary, etc."],
              ["CLM", "The claim header: patient control number (CLM01), total charge (CLM02), and place of service (CLM05). The anchor of the claim."],
              ["HI", "Diagnoses (ICD-10) — the principal diagnosis plus any additional ones, each with its qualifier (ABK/ABF)."],
              ["SV1", "Each service line: the procedure (CPT/HCPCS) with modifiers, charge, units, and diagnosis pointers."],
              ["DTP", "Dates of service at the claim and line level."],
              ["REF", "Identifiers like the claim's prior authorization or referral number, when required."],
            ].map(([seg, desc]) => (
              <div key={seg} className="grid grid-cols-[8rem_1fr] gap-4 py-3">
                <dt className="font-mono text-sm font-semibold text-accent">{seg}</dt>
                <dd className="text-sm text-muted">{desc}</dd>
              </div>
            ))}
          </dl>
        </ArticleSection>

        <ArticleSection title="How CLM, HI, and SV1 fit together">
          <p>
            These three are the heart of the claim and they reference each other. The <Seg>CLM</Seg> sets the total
            charge and the place of service. The <Seg>HI</Seg> lists the diagnoses in order — the first is the principal
            diagnosis. Then each <Seg>SV1</Seg> service line points back to those diagnoses by position: a pointer of{" "}
            <Seg>1</Seg> means &ldquo;this line is for the first diagnosis on the HI.&rdquo; That linkage is where a lot
            of claims go wrong — a service line that points to a diagnosis position that doesn&apos;t exist, or a claim
            whose <Seg>SV1</Seg> charges don&apos;t add up to the <Seg>CLM02</Seg> total, will be rejected or
            short-paid. Reading the three together — total, diagnoses, lines — is how you check a claim is internally
            consistent.
          </p>
        </ArticleSection>

        <ArticleSection title="The checks that catch most rejections">
          <p>When you read an 837P, these are the things payers reject on — verify them first:</p>
          <ul className="ml-5 list-disc space-y-1.5 text-sm">
            <li><span className="text-ink">Billing NPI present</span> on the <Seg>2010AA</Seg> <Seg>NM1</Seg>.</li>
            <li><span className="text-ink">At least one diagnosis</span> on the <Seg>HI</Seg>.</li>
            <li><span className="text-ink">Diagnosis pointers in range</span> — every <Seg>SV1</Seg> pointer references a diagnosis that&apos;s actually on the claim.</li>
            <li><span className="text-ink">Claim balances</span> — the <Seg>CLM</Seg> total equals the sum of the <Seg>SV1</Seg> line charges.</li>
            <li><span className="text-ink">Place of service fits the procedure</span> — a mismatch draws denial code{" "}
              <Link href="/edi/835/denial-codes/co-5" className="font-medium text-accent underline-offset-2 hover:underline">CO-5</Link>.</li>
            <li><span className="text-ink">Required authorization referenced</span> when the service needs it — otherwise expect{" "}
              <Link href="/edi/835/denial-codes/co-197" className="font-medium text-accent underline-offset-2 hover:underline">CO-197</Link>.</li>
          </ul>
        </ArticleSection>

        <ArticleSection title="837P vs 837I">
          <p>
            The professional claim (837P) carries CPT/HCPCS procedures in <Seg>SV1</Seg> and place-of-service codes —
            see the{" "}
            <Link href="/edi/837/place-of-service-codes" className="font-medium text-accent underline-offset-2 hover:underline">
              place of service codes
            </Link>{" "}
            reference. The institutional claim (837I) instead carries NUBC revenue codes in <Seg>SV2</Seg> and a type of
            bill, for facility billing. The HL hierarchy is the same in both; what changes is the service-line segment
            and the coding system. {SITE_NAME} detects which one you dropped automatically.
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

        <ArticleSection title="Read it as one row per claim">
          <p>
            <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
              EDIAnalyst
            </Link>{" "}
            walks the <Seg>HL</Seg> loops for you and flattens the claim into one row — billing provider, patient,
            charge, diagnoses, and service lines — running the checks above and flagging what a payer would reject on.
            Parsed entirely in your browser; nothing is uploaded.
          </p>
          <p>
            <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
              Open an 837 in EDIAnalyst →
            </Link>{" "}
            ·{" "}
            <Link href="/blog/convert-837-claim-to-excel" className="font-medium text-accent underline-offset-2 hover:underline">
              Convert an 837 to Excel →
            </Link>{" "}
            ·{" "}
            <Link href="/edi/837/place-of-service-codes" className="font-medium text-accent underline-offset-2 hover:underline">
              Place of service codes →
            </Link>
          </p>
        </ArticleSection>
      </ArticleShell>
    </>
  );
}
