"use client";

import type { Claims837 } from "../lib/transform/claim837";
import type { ValidationReport } from "../lib/validate/engine";
import { usd } from "../lib/util/format";

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="px-4 py-3 first:pl-0">
      <div className={`display text-2xl leading-none tabular-nums ${tone ?? "text-ink"}`}>{value}</div>
      <div className="label mt-2">{label}</div>
    </div>
  );
}

/** Swiss summary band for an 837P claim batch. */
export function Claim837Summary({
  doc,
  report,
  fileName,
}: {
  doc: Claims837;
  report: ValidationReport;
  fileName?: string;
}) {
  const findingTotal = report.counts.error + report.counts.warning + report.counts.info;
  const billing = doc.claims[0];
  return (
    <div className="animate-slide-up border border-ink">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-2.5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-ink">{fileName ?? "837 file"}</span>
          <span className="border border-accent px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
            {doc.variant === "institutional" ? "Institutional claim" : "Professional claim"}
          </span>
          {billing?.billingProviderName && (
            <span className="label normal-case tracking-normal text-muted">
              {billing.billingProviderName}
              {billing.billingProviderNpi ? ` · NPI ${billing.billingProviderNpi}` : ""}
            </span>
          )}
        </div>
        {doc.submitterName && (
          <span className="label">{doc.submitterName} → {doc.receiverName ?? "payer"}</span>
        )}
      </div>
      <div className="grid grid-cols-2 divide-x divide-line sm:grid-cols-4 [&>*]:px-4">
        <Stat label="Claims" value={doc.totals.claims} />
        <Stat label="Total charged" value={usd(doc.totals.charged)} tone="text-accent" />
        <Stat label="Service lines" value={doc.totals.serviceLines} />
        <Stat label="Findings" value={findingTotal} tone={findingTotal ? "text-accent" : "text-ink"} />
      </div>
    </div>
  );
}
