"use client";

import type { Document834 } from "../lib/transform/member834";
import type { ValidationReport } from "../lib/validate/engine";

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="px-4 py-3 first:pl-0">
      <div className={`display text-3xl leading-none tabular-nums ${tone ?? "text-ink"}`}>{value}</div>
      <div className="label mt-2">{label}</div>
    </div>
  );
}

/** Swiss summary band: a meta line, then stat columns split by hairlines. */
export function SummaryBar({
  doc,
  report,
  fileName,
}: {
  doc: Document834;
  report: ValidationReport;
  fileName?: string;
}) {
  const findingTotal = report.counts.error + report.counts.warning + report.counts.info;
  return (
    <div className="animate-slide-up border border-ink">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-ink">{fileName ?? "834 file"}</span>
          <span className="border border-accent px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
            {doc.purpose || "Purpose not stated"}
          </span>
          {doc.action && (
            <span className="border border-line px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              {doc.action}
            </span>
          )}
        </div>
        {doc.fileEffectiveDate && <span className="label">Effective {doc.fileEffectiveDate}</span>}
      </div>
      <div className="grid grid-cols-3 divide-x divide-line sm:grid-cols-6 [&>*]:px-4">
        <Stat label="Members" value={doc.members.length} />
        <Stat label="Additions" value={doc.counts.additions} tone="text-emerald-600" />
        <Stat label="Terminations" value={doc.counts.terminations} tone="text-rose-600" />
        <Stat label="Changes" value={doc.counts.changes} tone="text-amber-600" />
        <Stat label="Other" value={doc.counts.other} />
        <Stat label="Findings" value={findingTotal} tone={findingTotal ? "text-accent" : "text-ink"} />
      </div>
    </div>
  );
}
