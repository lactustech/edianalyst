import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Section } from "../../components/PageShell";
import { CONTACT_EMAIL, SITE_COMPANY, SITE_NAME } from "../../lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The terms that govern your use of ${SITE_NAME}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Use"
      intro={`By using ${SITE_NAME}, you agree to these terms. Please read them.`}
      updated="June 2026"
    >
      <Section title="Acceptance">
        <p>
          These Terms of Use govern your access to and use of {SITE_NAME} (the &ldquo;Service&rdquo;),
          provided by {SITE_COMPANY}. By using the Service you agree to be bound by these terms. If you
          do not agree, do not use the Service.
        </p>
      </Section>

      <Section title="The Service">
        <p>
          {SITE_NAME} is a free, browser-based tool that reads healthcare X12 EDI files and presents
          them as readable tables. All processing happens locally in your browser; we do not receive
          or store the files you open.
        </p>
        <p>
          The Service is provided for informational and convenience purposes. It is a viewing and
          analysis aid — not a system of record, a clearinghouse, a compliance tool, or a substitute
          for your authoritative source data.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Use the Service in violation of any applicable law or regulation.</li>
          <li>
            Upload data you are not authorized to handle, or use the Service in a way that breaches
            your own obligations to protect health information.
          </li>
          <li>
            Attempt to disrupt, reverse-engineer for malicious purposes, overload, or gain
            unauthorized access to the Service or its infrastructure.
          </li>
          <li>Misrepresent the Service&rsquo;s output as certified, validated, or guaranteed.</li>
        </ul>
        <p>
          You are responsible for your own use of the data you view and for complying with HIPAA and
          any other obligations that apply to you.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without
          warranties of any kind, express or implied, including merchantability, fitness for a
          particular purpose, accuracy, and non-infringement. We do not warrant that the Service will
          be uninterrupted, error-free, or that its interpretations of EDI data are complete or
          correct. See our{" "}
          <Link href="/disclaimer" className="font-medium text-accent underline-offset-2 hover:underline">
            Disclaimer
          </Link>{" "}
          for more.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, {SITE_COMPANY} will not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or for any loss of data, revenue,
          or profits, arising out of or related to your use of (or inability to use) the Service —
          even if advised of the possibility of such damages. The Service is free; your sole remedy
          for dissatisfaction is to stop using it.
        </p>
      </Section>

      <Section title="Intellectual property">
        <p>
          The Service, including its design, code, and original content, is owned by {SITE_COMPANY}
          and protected by applicable intellectual-property laws. The EDI files you open and their
          contents remain yours; we claim no rights to them.
        </p>
      </Section>

      <Section title="Changes and availability">
        <p>
          We may modify, suspend, or discontinue the Service, or update these terms, at any time. When
          we change these terms we will revise the &ldquo;Last updated&rdquo; date above. Continued use
          after a change means you accept the updated terms.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by applicable law, without regard to conflict-of-law principles.
          Any provision found unenforceable will be limited or removed to the minimum extent necessary,
          and the remaining terms will stay in effect.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms? Email {SITE_COMPANY} at{" "}
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
