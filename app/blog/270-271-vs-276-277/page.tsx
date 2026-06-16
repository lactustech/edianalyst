import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("270-271-vs-276-277")!;

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
  ["Question", "Is this patient covered, and what are the benefits?", "What's happening with a claim I submitted?"],
  ["Inquiry / response", "270 inquiry → 271 response", "276 inquiry → 277 response"],
  ["When it fires", "Before the visit / before billing", "After the claim is submitted"],
  ["Subject", "A member and the benefits in question", "A specific claim already on file"],
  ["Defining codes", "EQ service type codes; EB benefit lines", "STC claim status category & status codes"],
  ["Typical use", "Front-desk eligibility, benefit verification", "AR follow-up, chasing unpaid claims"],
  ["Pairing key", "Matched by trace number (TRN)", "Matched by trace number (TRN)"],
];

const FAQ = [
  {
    q: "What's the difference between 270/271 and 276/277?",
    a: "270/271 is eligibility: the 270 asks whether a patient is covered and what their benefits are, and the 271 answers. 276/277 is claim status: the 276 asks what's happening with a claim already submitted, and the 277 answers. One checks coverage before care; the other tracks a claim after billing.",
  },
  {
    q: "When do you send a 270 vs a 276?",
    a: "Send a 270 before the visit or before billing, to confirm the patient is covered and verify benefits. Send a 276 after you've submitted a claim, to find out whether it was received, paid, denied, or is still pending.",
  },
  {
    q: "How are the inquiry and response matched?",
    a: "Each pair is a request and its answer, tied together by a trace number (TRN). The 271 references the 270 it answers, and the 277 references the 276 — so you can match responses back to the inquiries that triggered them.",
  },
  {
    q: "Are these real-time transactions?",
    a: "Often, yes. Eligibility (270/271) and claim status (276/277) are commonly run interactively — a front-desk or billing system fires the inquiry and gets a response back in seconds — though they can also be batched.",
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
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "270/271 vs 276/277" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="270/271 vs 276/277: eligibility vs claim status"
      intro="Both are request/response pairs, and both get confused for each other — but they answer different questions at different points in the revenue cycle. Here's how eligibility (270/271) and claim status (276/277) differ, and when each one fires."
      published={post.published}
      description={post.metaDescription}
    >
      <JsonLd data={faqLd} />

      <ArticleSection title="Two question-and-answer pairs">
        <p>
          These four transactions share a shape — each is an <strong>inquiry</strong> followed by a{" "}
          <strong>response</strong> — which is why they get lumped together. But they ask different things. The{" "}
          <strong>270/271</strong> pair is about <strong>eligibility</strong>: is this patient covered, and what are
          their benefits? The <strong>276/277</strong> pair is about <strong>claim status</strong>: what&apos;s
          happening with a claim I&apos;ve already sent? One looks forward (before care), the other looks back (after
          billing).
        </p>
      </ArticleSection>

      <ArticleSection title="270/271 — eligibility & benefits">
        <p>
          The <strong>270</strong> is an eligibility and benefit inquiry: a provider asking a payer whether a patient is
          covered and which benefits apply. The <strong>271</strong> is the payer&apos;s response — active or inactive
          coverage, plus copays, deductibles, and limits. The 270 names the service types in question using{" "}
          <Seg>EQ</Seg> codes, and the 271 answers with <Seg>EB</Seg> benefit lines. This pair fires{" "}
          <strong>before</strong> the visit or before billing, so the front desk knows what to collect and the biller
          knows the claim will be covered. See the{" "}
          <Link href="/edi/270/service-type-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            service type codes
          </Link>{" "}
          and{" "}
          <Link href="/edi/271/eligibility-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            eligibility &amp; benefit codes
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="276/277 — claim status">
        <p>
          The <strong>276</strong> is a claim status inquiry: a provider asking a payer what&apos;s happening with a
          claim that was already submitted. The <strong>277</strong> is the response — received, accepted, paid, denied,
          or pending — encoded in <Seg>STC</Seg> claim status codes. This pair fires <strong>after</strong> the claim
          goes out, and it&apos;s the backbone of AR follow-up: instead of calling the payer, you send a 276 and read
          the 277. (A related transaction, the 277CA, is an unsolicited claim acknowledgment a clearinghouse returns
          right after an 837.) See the{" "}
          <Link href="/edi/277/status-codes" className="font-medium text-accent underline-offset-2 hover:underline">
            claim status codes
          </Link>{" "}
          reference.
        </p>
      </ArticleSection>

      <ArticleSection title="When each fires in the workflow">
        <p>The simplest way to keep them straight is by <em>when</em> they happen:</p>
        <ol className="ml-5 list-decimal space-y-2 text-sm">
          <li><span className="text-ink">Before care:</span> run a <Seg>270</Seg>, read the <Seg>271</Seg> — confirm coverage and benefits.</li>
          <li><span className="text-ink">Provide the service and submit the 837 claim.</span></li>
          <li><span className="text-ink">After submission:</span> run a <Seg>276</Seg>, read the <Seg>277</Seg> — track where the claim stands.</li>
        </ol>
        <p>
          So 270/271 protects you from billing for uncovered care, and 276/277 keeps claims from sitting unpaid without
          anyone noticing.
        </p>
      </ArticleSection>

      <ArticleSection title="270/271 vs 276/277, side by side">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink text-left">
                <th className="py-2 pr-4 font-semibold text-ink">Aspect</th>
                <th className="py-2 pr-4 font-semibold text-ink">270 / 271</th>
                <th className="py-2 font-semibold text-ink">276 / 277</th>
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

      <ArticleSection title="Real-time vs batch">
        <p>
          Both pairs are commonly run <strong>real-time</strong>: a front-desk or billing system fires a single inquiry
          and gets the response back in seconds, so staff can verify a patient at check-in or check a claim&apos;s status
          on demand. The same transactions can also run in <strong>batch</strong> — hundreds of inquiries sent together
          and the responses returned as a file — which is how a billing team might re-verify an entire schedule the
          night before, or sweep every open claim for status at once. The transaction is identical; only the delivery
          differs.
        </p>
        <p>
          A practical implication: a real-time 271 or 277 is one member or one claim, while a batch response is a file
          full of them — which is exactly the case where reading it as a table, rather than one response at a time,
          saves real work.
        </p>
      </ArticleSection>

      <ArticleSection title="A quick worked example">
        <p>
          Say a patient is scheduled for an office visit. Before the visit, the practice sends a <Seg>270</Seg> asking
          about service type <Seg>30</Seg> (health benefit plan coverage) and gets back a <Seg>271</Seg> showing active
          coverage with a $30 office-visit copay. The visit happens, an 837 claim goes out, and two weeks later the
          payment hasn&apos;t arrived. Now the biller sends a <Seg>276</Seg> for that claim and the <Seg>277</Seg> comes
          back with an <Seg>STC</Seg> showing the claim is pending additional information. Same patient, same claim —
          but the eligibility pair answered &ldquo;will this be covered?&rdquo; up front, and the status pair answered
          &ldquo;where is my money?&rdquo; after the fact.
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

      <ArticleSection title="Read any of the four in your browser">
        <p>
          {SITE_NAME} reads all four transactions — it lists the members and service types on a 270/271 and decodes the
          STC outcomes on a 276/277, flagging inactive coverage and rejected claims. Drop a file in; it&apos;s parsed
          entirely in your browser, nothing uploaded.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open a file in EDIAnalyst →
          </Link>{" "}
          ·{" "}
          <Link href="/edi/270" className="font-medium text-accent underline-offset-2 hover:underline">
            270/271 reference →
          </Link>{" "}
          ·{" "}
          <Link href="/edi/277" className="font-medium text-accent underline-offset-2 hover:underline">
            276/277 reference →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
