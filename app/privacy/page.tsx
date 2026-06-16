import type { Metadata } from "next";
import { PageShell, Section } from "../../components/PageShell";
import { CONTACT_EMAIL, SITE_COMPANY, SITE_NAME } from "../../lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles your data. Your EDI files are parsed entirely in your browser and never uploaded.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy"
      intro="The short version: your EDI files never leave your device. We cannot see them, store them, or recover them."
      updated="June 2026"
    >
      <Section title="Your files stay on your device">
        <p>
          {SITE_NAME} parses every file you open <span className="font-semibold text-ink">entirely
          inside your web browser</span>. The contents of your EDI files — including any protected
          health information (PHI) — are never uploaded, transmitted, logged, or stored on any server.
          We have no technical ability to access them.
        </p>
        <p>
          You can verify this yourself: open your browser&rsquo;s developer tools, watch the Network
          tab, and drop in a file. No request carries your file&rsquo;s contents off the page.
        </p>
      </Section>

      <Section title="Information we do collect">
        <p>
          We use a privacy-respecting analytics service (Google Analytics 4) to understand aggregate
          usage — for example, how many people visit, which pages they view, and roughly where in the
          world traffic comes from. This data is limited to standard web-page events such as page
          views, referring links, approximate location, and general device or browser type.
        </p>
        <p>
          Analytics never receives the contents of your EDI files. File parsing happens in an isolated
          part of the browser with no network access, so your data is structurally separated from any
          analytics.
        </p>
      </Section>

      <Section title="Cookies and local storage">
        <p>
          {SITE_NAME} stores a small preference in your browser&rsquo;s local storage to remember your
          light/dark theme choice. Our analytics provider may set cookies to measure aggregate usage.
          We do not use cookies to identify you personally or to track you across other websites.
        </p>
      </Section>

      <Section title="Third-party services">
        <p>
          We rely on a small number of third parties to deliver the site: a static web host/CDN to
          serve the pages, web fonts, and the analytics provider described above. These services may
          process technical request data (such as your IP address) as part of delivering content, as
          is standard for any website. They do not receive your EDI files.
        </p>
      </Section>

      <Section title="Children&rsquo;s privacy">
        <p>
          {SITE_NAME} is a professional tool intended for adults working with healthcare data. It is
          not directed at children, and we do not knowingly collect personal information from them.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may update this policy from time to time. When we do, we will revise the &ldquo;Last
          updated&rdquo; date above. Continued use of the site after a change means you accept the
          updated policy.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about privacy? Email {SITE_COMPANY} at{" "}
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
