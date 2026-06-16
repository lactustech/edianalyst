import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "../../components/JsonLd";
import { PageShell } from "../../components/PageShell";
import { BLOG_POSTS } from "../../lib/blog";
import { breadcrumbLd, og, twitter } from "../../lib/seo";
import { SITE_NAME, SITE_URL } from "../../lib/site";

const TITLE = "Blog";
const DESCRIPTION =
  "Plain-English guides and references for healthcare X12 EDI — 835 denial codes, reading remittances, converting 837s to Excel, and 834 enrollment files.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: og({ title: TITLE, description: DESCRIPTION, path: "/blog", type: "website" }),
  twitter: twitter({ title: TITLE, description: DESCRIPTION }),
};

const blogLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: `${SITE_NAME} Blog`,
  description: DESCRIPTION,
  url: `${SITE_URL}/blog`,
  blogPost: BLOG_POSTS.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    description: p.blurb,
    datePublished: p.published,
    url: `${SITE_URL}/blog/${p.slug}`,
  })),
};

export default function BlogIndex() {
  return (
    <>
      <JsonLd
        data={[
          blogLd,
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />
      <PageShell
        title="Blog"
        intro="Plain-English guides and references for the people who work healthcare EDI every day — denials, remittances, claims, and enrollment files."
      >
        <ul className="divide-y divide-line border-y border-line">
          {BLOG_POSTS.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group block py-6">
                <span className="label">{p.kicker}</span>
                <h2 className="display mt-2 text-2xl leading-tight text-ink group-hover:text-accent">{p.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{p.blurb}</p>
                <span className="mt-3 inline-block text-sm font-medium text-accent">Read →</span>
              </Link>
            </li>
          ))}
        </ul>
      </PageShell>
    </>
  );
}
