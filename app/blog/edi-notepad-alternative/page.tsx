import type { Metadata } from "next";
import Link from "next/link";
import { ArticleShell, ArticleSection } from "../../../components/ArticleShell";
import { JsonLd } from "../../../components/JsonLd";
import { getPost } from "../../../lib/blog";
import { og, twitter } from "../../../lib/seo";
import { SITE_NAME } from "../../../lib/site";

const post = getPost("edi-notepad-alternative")!;

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
  ["Install", "Windows desktop install", "None — runs in any browser"],
  ["Operating system", "Windows only", "Mac, Windows, Linux, Chromebook — anything with a browser"],
  ["Cost", "Free tier historically, availability varied", "Free"],
  ["Where your file goes", "Stays on your machine (desktop app)", "Stays in your browser — never uploaded"],
  ["Transaction detection", "Manual / pick the guide", "Auto-detects 834/835/837P/837I/270/271/276/277/277CA/999/820"],
  ["Reading the data", "Tree of raw segments", "One clean row per claim / member / payment"],
  ["Validation", "Structure/syntax", "Plain-English checks — denials, balancing, missing data"],
  ["Denial decoding", "Raw CARC/RARC codes", "CARC/RARC decoded into plain English"],
  ["Export", "Varies", "CSV and Excel"],
];

const FAQ = [
  {
    q: "Is there a free alternative to EDI Notepad?",
    a: "Yes — EDIAnalyst is a free, browser-based X12 viewer. There's nothing to install, it runs on any operating system, and it auto-detects the transaction type and turns the file into a readable table with plain-English validation.",
  },
  {
    q: "Do I have to upload my EDI file?",
    a: "No. EDIAnalyst parses the file entirely in your browser — no bytes are sent to a server. That's important for healthcare EDI, which contains PHI; you can confirm nothing is uploaded in your browser's Network tab.",
  },
  {
    q: "Does it work on a Mac or Chromebook?",
    a: "Yes. Because it runs in the browser, it works on Mac, Windows, Linux, and Chromebooks alike — there's no Windows-only desktop install to worry about.",
  },
  {
    q: "Which transactions does it read?",
    a: "834 enrollment, 835 remittance, 837P/837I claims, 270/271 eligibility, 276/277/277CA claim status, 999 acknowledgments, and 820 premium payments — detected automatically.",
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
      crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "EDI Notepad alternative" }]}
      path={`/blog/${post.slug}`}
      kicker={post.kicker}
      title="The best EDI Notepad alternative for analysts"
      intro="If you relied on EDI Notepad to eyeball X12 files and you're looking for a replacement, EDIAnalyst is the direct, browser-based alternative — nothing to install, nothing uploaded, and it decodes the file into plain English instead of a raw segment tree."
      published={post.published}
      description={post.metaDescription}
    >
      <JsonLd data={faqLd} />

      <ArticleSection title="If you're looking to replace EDI Notepad">
        <p>
          For years, EDI Notepad was the quick way to open an X12 file and see its structure — a free Windows desktop
          viewer that turned a wall of segments into a readable tree. If you&apos;re reading this, you&apos;re probably
          looking for an alternative: maybe it&apos;s no longer an option on your machine, maybe you&apos;ve moved off
          Windows, or maybe you just want something you don&apos;t have to install and maintain. Whatever the reason,{" "}
          {SITE_NAME} does the same job — and a few things the desktop tool never could.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open an EDI file in EDIAnalyst now →
          </Link>
        </p>
      </ArticleSection>

      <ArticleSection title="What analysts used EDI Notepad for">
        <p>The core jobs were simple, and they&apos;re the same jobs you still have:</p>
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li>Open an <Seg>834</Seg>, <Seg>835</Seg>, or <Seg>837</Seg> and actually see what&apos;s in it.</li>
          <li>Find a specific claim, member, or payment without scrolling raw text.</li>
          <li>Confirm the file&apos;s structure looked right before sending or after receiving.</li>
          <li>Look up what a segment or code meant.</li>
        </ul>
        <p>
          A browser tool covers all of that — and removes the friction of a Windows-only install while adding
          plain-English decoding on top.
        </p>
      </ArticleSection>

      <ArticleSection title="Why a browser tool wins">
        <p>Moving this job into the browser isn&apos;t just convenient — it&apos;s a better fit for healthcare EDI:</p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {[
            ["Nothing to install", "No download, no admin rights, no version to keep updated. Open a page and go — on any computer, including locked-down work machines."],
            ["Your PHI never leaves the device", "Healthcare EDI contains protected health information. EDIAnalyst parses the file entirely in your browser — no upload — so there's no server holding your PHI. You can verify it in the Network tab."],
            ["Auto-detection", "Drop any file and it identifies the transaction — 834, 835, 837P/837I, 270/271, 276/277, 999, 820 — instead of asking you to pick the guide."],
            ["Plain-English, not raw codes", "It decodes CARC/RARC denials, checks balancing, and flags missing data in words you can act on — not a tree of terse segments."],
            ["Any OS", "Mac, Windows, Linux, Chromebook. The tool is the browser you already have."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[12rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{k}</dt>
              <dd className="text-sm text-muted">{v}</dd>
            </div>
          ))}
        </dl>
      </ArticleSection>

      <ArticleSection title="EDIAnalyst as the direct replacement">
        <p>
          {SITE_NAME} is a free, browser-based viewer built for the people who work X12 every day. Drop in a file and it
          detects the transaction type and turns it into a clean, sortable table — one row per claim, member, or
          payment — with denials, rejections, and validation problems explained in plain English. Click any row to see
          the exact raw segments behind it, so you can still verify the tool against the bytes. And because everything
          runs in your browser, there&apos;s nothing to install and nothing is uploaded.
        </p>
      </ArticleSection>

      <ArticleSection title="Feature comparison">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink text-left">
                <th className="py-2 pr-4 font-semibold text-ink">Feature</th>
                <th className="py-2 pr-4 font-semibold text-ink">EDI Notepad (desktop)</th>
                <th className="py-2 font-semibold text-ink">EDIAnalyst (browser)</th>
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

      <ArticleSection title="What to look for in a replacement">
        <p>
          Not every &ldquo;EDI viewer&rdquo; is a real replacement. If you&apos;re evaluating options, the things that
          actually matter day to day:
        </p>
        <ul className="ml-5 list-disc space-y-1.5 text-sm">
          <li><span className="text-ink">It never uploads your file.</span> For healthcare EDI this is non-negotiable — the file is PHI. A tool that posts your data to a server is a compliance problem, not a convenience.</li>
          <li><span className="text-ink">It detects the transaction for you.</span> You shouldn&apos;t have to know whether you&apos;re holding an 837P or an 837I before you can open it.</li>
          <li><span className="text-ink">It decodes, not just displays.</span> A raw segment tree is only marginally better than the text file. Real help means CARC/RARC denials in plain English, balancing checks, and flagged missing data.</li>
          <li><span className="text-ink">It works on your machine.</span> Mac, Chromebook, a locked-down work laptop — a browser tool doesn&apos;t care.</li>
          <li><span className="text-ink">It exports.</span> Getting the data into CSV or Excel is half the reason you opened the file.</li>
        </ul>
        <p>EDIAnalyst was built around exactly these priorities.</p>
      </ArticleSection>

      <ArticleSection title="Common worries about a browser tool">
        <p>The reasonable objections to a web-based viewer — and why they don&apos;t apply here:</p>
        <dl className="mt-2 divide-y divide-line border-y border-line">
          {[
            ["“Isn't it less secure than a desktop app?”", "The opposite, for this use case. Because parsing happens in your browser with no upload, your file never touches a server — there's no transmission to intercept and no stored copy to breach. A desktop app that emails support a sample is riskier."],
            ["“What about large files?”", "Parsing runs locally on your machine's resources, the same as a desktop app would. Big batch files are handled in-browser without a round trip."],
            ["“Will it work behind our firewall?”", "It's a static web page — there's no special port or server connection to your data. Loading the page is all that touches the network; your EDI file does not."],
            ["“Do I need an account?”", "No login, no install, no license to track. Open the page and drop a file."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[14rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink">{k}</dt>
              <dd className="text-sm text-muted">{v}</dd>
            </div>
          ))}
        </dl>
      </ArticleSection>

      <ArticleSection title="Who it's for">
        <p>
          The analysts who relied on EDI Notepad are exactly who {SITE_NAME} is built for: enrollment specialists
          reading 834s, remittance and denial analysts working 835s, claims staff checking 837s before they go out, EDI
          coordinators triaging 999 rejections, and developers integrating payer feeds who just need to eyeball a file
          quickly. If your job involves opening an X12 file and figuring out what it says, this replaces the desktop
          viewer without the install.
        </p>
      </ArticleSection>

      <ArticleSection title="How to switch today">
        <p>There&apos;s no migration — just open a file:</p>
        <ol className="ml-5 list-decimal space-y-2 text-sm">
          <li>Go to <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">EDIAnalyst</Link>.</li>
          <li>Drag in an <Seg>834</Seg>, <Seg>835</Seg>, <Seg>837</Seg>, or any supported file — or open a synthetic sample to try it.</li>
          <li>Read the table, check the plain-English findings, and export to CSV or Excel if you need to.</li>
        </ol>
        <p>
          From there, the how-to guides walk the common files in depth:{" "}
          <Link href="/blog/how-to-read-an-835-remittance" className="font-medium text-accent underline-offset-2 hover:underline">
            reading an 835
          </Link>
          ,{" "}
          <Link href="/blog/how-to-read-an-834-enrollment-file" className="font-medium text-accent underline-offset-2 hover:underline">
            reading an 834
          </Link>
          , and{" "}
          <Link href="/blog/read-a-999-why-837-rejected" className="font-medium text-accent underline-offset-2 hover:underline">
            decoding a 999
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

      <ArticleSection title="Open your first file">
        <p>
          The switch takes about ten seconds: no install, no account, no upload. Drop an X12 file into {SITE_NAME} and
          read it in plain English right now.
        </p>
        <p>
          <Link href="/" className="font-medium text-accent underline-offset-2 hover:underline">
            Open EDIAnalyst →
          </Link>
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
