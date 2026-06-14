"use client";

import type { Acknowledgment999 } from "../lib/transform/ack999";
import type { ValidationReport } from "../lib/validate/engine";

/** Color the overall outcome: accepted = green, errors/partial = amber, rejected = red. */
export function ackTone(code: string): string {
  if (code === "A") return "bg-emerald-100 text-emerald-800";
  if (code === "E" || code === "P") return "bg-amber-100 text-amber-900";
  return "bg-rose-100 text-rose-800";
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="px-4 py-3 first:pl-0">
      <div className={`display text-2xl leading-none tabular-nums ${tone ?? "text-ink"}`}>{value}</div>
      <div className="label mt-2">{label}</div>
    </div>
  );
}

/** Swiss summary band for a 999 acknowledgment. */
export function Ack999Summary({
  doc,
  report,
  fileName,
}: {
  doc: Acknowledgment999;
  report: ValidationReport;
  fileName?: string;
}) {
  const findingTotal = report.counts.error + report.counts.warning + report.counts.info;
  return (
    <div className="animate-slide-up border border-ink">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-2.5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-ink">{fileName ?? "999 file"}</span>
          <span className="border border-accent px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
            Acknowledgment
          </span>
          <span className="label normal-case tracking-normal text-muted">
            {doc.functionalId} · group {doc.groupControlNumber}
          </span>
        </div>
        <span className={`px-2 py-0.5 text-xs font-semibold ${ackTone(doc.groupStatusCode)}`}>
          {doc.groupStatus}
        </span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-line sm:grid-cols-5 [&>*]:px-4">
        <Stat label="Transactions" value={doc.totals.transactions} />
        <Stat label="Accepted" value={doc.totals.accepted} tone="text-emerald-600" />
        <Stat label="With errors" value={doc.totals.withErrors} tone={doc.totals.withErrors ? "text-amber-600" : "text-ink"} />
        <Stat label="Rejected" value={doc.totals.rejected} tone={doc.totals.rejected ? "text-rose-600" : "text-ink"} />
        <Stat label="Findings" value={findingTotal} tone={findingTotal ? "text-accent" : "text-ink"} />
      </div>
    </div>
  );
}
