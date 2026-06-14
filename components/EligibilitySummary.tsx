"use client";

import type { Eligibility } from "../lib/transform/eligibility";
import type { ValidationReport } from "../lib/validate/engine";

export function coverageTone(status: string): string {
  if (status === "Active") return "bg-emerald-100 text-emerald-800";
  if (status === "Inactive") return "bg-rose-100 text-rose-800";
  return "bg-slate-100 text-slate-600";
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="px-4 py-3 first:pl-0">
      <div className={`display text-2xl leading-none tabular-nums ${tone ?? "text-ink"}`}>{value}</div>
      <div className="label mt-2">{label}</div>
    </div>
  );
}

/** Swiss summary band for a 270 inquiry or 271 response. */
export function EligibilitySummary({
  doc,
  report,
  fileName,
}: {
  doc: Eligibility;
  report: ValidationReport;
  fileName?: string;
}) {
  const findingTotal = report.counts.error + report.counts.warning + report.counts.info;
  const isResponse = doc.variant === "response";
  return (
    <div className="animate-slide-up border border-ink">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-2.5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-ink">{fileName ?? "Eligibility file"}</span>
          <span className="border border-accent px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
            {isResponse ? "Eligibility response" : "Eligibility inquiry"}
          </span>
          {doc.payerName && (
            <span className="label normal-case tracking-normal text-muted">
              {doc.providerName ?? "provider"} → {doc.payerName}
            </span>
          )}
        </div>
      </div>
      <div className={`grid ${isResponse ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"} divide-x divide-line [&>*]:px-4`}>
        <Stat label="Members" value={doc.totals.members} />
        {isResponse && <Stat label="Active" value={doc.totals.active} tone="text-emerald-600" />}
        {isResponse && <Stat label="Inactive" value={doc.totals.inactive} tone={doc.totals.inactive ? "text-rose-600" : "text-ink"} />}
        <Stat label="Findings" value={findingTotal} tone={findingTotal ? "text-accent" : "text-ink"} />
      </div>
    </div>
  );
}
