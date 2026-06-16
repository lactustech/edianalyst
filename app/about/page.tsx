import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Section } from "../../components/PageShell";
import { CONTACT_EMAIL, SITE_COMPANY, SITE_NAME } from "../../lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `${SITE_NAME} is a free, browser-based viewer for healthcare X12 EDI files. Learn who builds it and why.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PageShell
      title="About Us"
      intro={`${SITE_NAME} turns unreadable healthcare EDI into clean, readable tables — entirely in your browser.`}
    >
      <Section title="What we built">
        <p>
          {SITE_NAME} is a free tool for the people who work with healthcare X12 EDI every day:
          enrollment specialists, claims and remittance analysts, EDI coordinators, and developers
          integrating payer feeds. Drop in an 834, 835, 837P/837I, 270/271, 276/277, 277CA, 999, or
          820 file and it detects the transaction type and turns it into a clean, sortable table —
          with denials, rejections, and validation problems explained in plain English.
        </p>
        <p>
          There is nothing to install and nothing to configure. Open the page, drop a file, read it.
        </p>
      </Section>

      <Section title="Why it stays in your browser">
        <p>
          Healthcare EDI carries protected health information (PHI). Most online &ldquo;EDI
          viewers&rdquo; ask you to upload that data to a server you have to trust. {SITE_NAME} does
          not. Every file is parsed entirely on your own device — no bytes are uploaded, so there is
          no server holding your PHI and no HIPAA hosting to worry about. You can confirm it yourself
          in your browser&rsquo;s Network tab.
        </p>
        <p>
          We believe a tool this useful should not require handing over sensitive data to use it.
          That principle shapes every decision we make.
        </p>
      </Section>

      <Section title="Who makes it">
        <p>
          {SITE_NAME} is built and maintained by {SITE_COMPANY}. We are a small team that cares about
          fast, honest, privacy-respecting software for healthcare operations.
        </p>
        <p>
          Have a question, a bug, or a file format you wish we handled better?{" "}
          <Link href="/contact" className="font-medium text-accent underline-offset-2 hover:underline">
            Get in touch
          </Link>{" "}
          or email us at{" "}
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
