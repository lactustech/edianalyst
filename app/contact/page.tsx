import type { Metadata } from "next";
import { PageShell, Section } from "../../components/PageShell";
import { CONTACT_EMAIL, SITE_COMPANY, SITE_NAME } from "../../lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with the ${SITE_NAME} team — questions, bug reports, and feedback.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageShell
      title="Contact Us"
      intro="Questions, bug reports, feature requests, or feedback — we read every message."
    >
      <Section title="Email">
        <p>
          The fastest way to reach {SITE_COMPANY} is by email:
        </p>
        <p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="display text-xl font-bold text-accent underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </Section>

      <Section title="What to include">
        <p>When you write to us about an issue, it helps to mention:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>The transaction type you were working with (e.g. 835, 837P, 834).</li>
          <li>What you expected to see versus what {SITE_NAME} showed.</li>
          <li>Your browser and operating system.</li>
        </ul>
        <p className="rounded border border-line bg-fill p-4 text-sm">
          Please do <span className="font-semibold text-ink">not</span> send us real EDI files or any
          protected health information (PHI). {SITE_NAME} never receives your files, and neither
          should our inbox. If you need to share an example, use a small, fully synthetic snippet with
          all real data removed.
        </p>
      </Section>

      <Section title="Response time">
        <p>
          We are a small team and reply as quickly as we can — usually within a few business days.
        </p>
      </Section>
    </PageShell>
  );
}
