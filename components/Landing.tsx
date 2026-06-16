"use client";

import Link from "next/link";
import { REFERENCE } from "../lib/reference";
import { DropZone } from "./DropZone";

const CAPABILITIES = [
  {
    no: "01",
    title: "Readable tables",
    body: "Every record — member, claim, payment, status — becomes one clean, sortable row. Color-coded so you scan a file in seconds.",
  },
  {
    no: "02",
    title: "Plain-English checks",
    body: "Balancing, control totals, structure, and dates are validated and explained in words you can act on — never raw X12 codes.",
  },
  {
    no: "03",
    title: "The bytes behind it",
    body: "Click any row to see the exact raw segments that produced it. Verify the tool against your own files.",
  },
];

const SAMPLES: { code: string; label: string; file: string }[] = [
  { code: "834", label: "Enrollment", file: "sample-834.edi" },
  { code: "834", label: "Enrollment · errors", file: "sample-834-with-errors.edi" },
  { code: "835", label: "Remittance", file: "sample-835.edi" },
  { code: "837P", label: "Claim · professional", file: "sample-837.edi" },
  { code: "837I", label: "Claim · institutional", file: "sample-837i.edi" },
  { code: "270", label: "Eligibility · ask", file: "sample-270.edi" },
  { code: "271", label: "Eligibility · reply", file: "sample-271.edi" },
  { code: "276", label: "Status · ask", file: "sample-276.edi" },
  { code: "277", label: "Status · reply", file: "sample-277.edi" },
  { code: "277CA", label: "Claim acknowledgment", file: "sample-277ca.edi" },
  { code: "820", label: "Premium payment", file: "sample-820.edi" },
  { code: "999", label: "Acknowledgment", file: "sample-999.edi" },
];

export function Landing({
  onFile,
  onSample,
}: {
  onFile: (file: File) => void;
  onSample: (path: string, name: string, initialTab?: string) => void;
}) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between border-b border-line py-3">
        <span className="label">01 — Drop a file</span>
        <span className="label hidden sm:block">No upload · No server · No PHI leaves the device</span>
      </div>

      <section className="grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:py-16">
        <div>
          <h1 className="display text-6xl leading-[0.92] text-ink sm:text-7xl">
            Read any
            <br />
            EDI file<span className="text-accent">.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-muted">
            EDIAnalyst turns unreadable healthcare EDI — enrollment, claims, remittance,
            eligibility, status, and acknowledgments — into clean, sortable tables, built for analysts.
          </p>
          <div className="mt-8">
            <button
              onClick={() => onSample("/samples/sample-835.edi", "sample-835.edi", "findings")}
              className="bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-fg transition-colors hover:bg-ink"
            >
              Open a sample 835 →
            </button>
            <p className="mt-2 label">See denials decoded into plain English</p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <DropZone onFile={onFile} />
          <p className="mt-2 label">Every sample is synthetic — generated, never real data</p>
        </div>
      </section>

      {/* Sample library — one chip per transaction type */}
      <section className="border-t border-ink pt-6">
        <span className="label">Or try a synthetic sample</span>
        <div className="mt-4 grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-4">
          {SAMPLES.map((s) => (
            <button
              key={s.file}
              onClick={() => onSample(`/samples/${s.file}`, s.file)}
              className="group flex items-center gap-3 bg-canvas p-4 text-left transition-colors hover:bg-fill"
            >
              <span className="display w-14 shrink-0 text-sm font-bold text-accent">{s.code}</span>
              <span className="text-sm text-ink group-hover:text-accent">{s.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-12 grid border-t border-ink sm:grid-cols-3">
        {CAPABILITIES.map((c, i) => (
          <div
            key={c.no}
            className={`py-6 sm:px-6 ${i === 0 ? "sm:pl-0" : ""} ${i > 0 ? "border-t border-line sm:border-l sm:border-t-0" : ""}`}
          >
            <div className="flex items-baseline gap-3">
              <span className="display text-2xl text-accent">{c.no}</span>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">{c.title}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{c.body}</p>
          </div>
        ))}
      </section>

      {/* Indexable copy — what the tool is, for search engines and first-time visitors. */}
      <section className="mt-12 border-t border-ink pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">What EDIAnalyst does</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
          EDIAnalyst is a free, browser-based viewer for healthcare X12 EDI. Drop in a remittance
          (835), a professional or institutional claim (837P / 837I), an enrollment file (834), an
          eligibility inquiry or response (270 / 271), a claim-status request, response, or
          acknowledgment (276 / 277 / 277CA), an implementation acknowledgment (999), or a premium
          payment (820) — it detects the transaction type and turns it into a clean, sortable table.
          There&apos;s nothing to install and nothing to configure.
        </p>
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink">
          Your data never leaves your browser
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
          Every file is parsed entirely on your device. No bytes are uploaded, so there&apos;s no
          server to trust with PHI and no HIPAA hosting to worry about — you can confirm it in your
          browser&apos;s Network tab. Denials, rejections, and validation problems are explained in
          plain English, and any view exports to CSV or Excel.
        </p>
      </section>

      {/* Transaction reference — indexable links to the per-transaction pages. */}
      <footer className="mt-12 border-t border-ink py-8">
        <span className="label">Transaction reference</span>
        <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {REFERENCE.map((r) => (
            <li key={r.slug}>
              <Link href={`/edi/${r.slug}`} className="group inline-flex items-baseline gap-2 text-sm">
                <span className="display font-bold text-accent">{r.code}</span>
                <span className="text-muted group-hover:text-ink">{r.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
