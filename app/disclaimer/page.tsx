import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Section } from "../../components/PageShell";
import { CONTACT_EMAIL, SITE_NAME } from "../../lib/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `Important disclaimers about using ${SITE_NAME} to read healthcare EDI files.`,
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <PageShell
      title="Disclaimer"
      intro={`${SITE_NAME} is a viewing aid, not an authoritative source. Please read this before relying on its output.`}
      updated="June 2026"
    >
      <Section title="Informational use only">
        <p>
          {SITE_NAME} is provided for informational and convenience purposes only. It helps you read
          and understand healthcare X12 EDI files, but its interpretations — including plain-English
          explanations of denials, rejections, balancing, and validation — are best-effort and may be
          incomplete or incorrect for your specific file or trading-partner configuration.
        </p>
      </Section>

      <Section title="Not professional advice">
        <p>
          Nothing produced by {SITE_NAME} constitutes legal, medical, billing, coding, compliance, or
          financial advice. Do not make claims, payment, enrollment, or compliance decisions based
          solely on what you see here. Always verify against your authoritative source data and, where
          appropriate, consult a qualified professional.
        </p>
      </Section>

      <Section title="No guarantee of accuracy">
        <p>
          EDI implementations vary by payer and trading partner. {SITE_NAME} may not reflect every
          companion guide, custom segment, or local convention. We make no guarantee that parsed
          values, decoded codes (such as CARC/RARC), or exported tables are accurate, complete, or
          current. You are responsible for confirming any figure before acting on it.
        </p>
      </Section>

      <Section title="Your responsibility for data">
        <p>
          Because all processing happens in your browser, you remain solely responsible for the files
          you open and for handling any protected health information (PHI) in accordance with HIPAA and
          your own policies. {SITE_NAME} does not receive, store, or transmit your files.
        </p>
      </Section>

      <Section title="No affiliation">
        <p>
          {SITE_NAME} is an independent tool. References to X12, HIPAA, transaction-set numbers, or any
          payer, clearinghouse, or standards body are for identification and educational purposes only
          and do not imply affiliation, sponsorship, or endorsement.
        </p>
      </Section>

      <Section title="Related">
        <p>
          This Disclaimer is part of, and should be read together with, our{" "}
          <Link href="/terms" className="font-medium text-accent underline-offset-2 hover:underline">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-accent underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          . Questions? Email us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-accent underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </PageShell>
  );
}
