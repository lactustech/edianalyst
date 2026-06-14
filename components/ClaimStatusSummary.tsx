"use client";

import type { ClaimStatus } from "../lib/transform/claimStatus";
import type { StatusOutcome } from "../lib/codelists/claimStatus";
import type { ValidationReport } from "../lib/validate/engine";

export function outcomeTone(outcome: StatusOutcome): string {
  if (outcome === "accepted" || outcome === "finalized") return "bg-emerald-100 text-emerald-800";
  if (outcome === "rejected" || outcome === "denied") return "bg-rose-100 text-rose-800";
  if (outcome === "pending") return "bg-amber-100 text-amber-900";
  return "bg-slate-100 text-slate-600";
}

const VARIANT_LABEL = {
  request: "Claim status request",
  response: "Claim status response",
  acknowledgment: "Claim acknowledgment (277CA)",
} as const;

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="px-4 py-3 first:pl-0">
      <div className={`display text-2xl leading-none tabular-nums ${tone ?? "text-ink"}`}>{value}</div>
      <div className="label mt-2">{label}</div>
    </div>
  );
}

/** Swiss summary band for a 276/277/277CA. */
export function ClaimStatusSummary({
  doc,
  report,
  fileName,
}: {
  doc: ClaimStatus;
  report: ValidationReport;
  fileName?: string;
}) {
  const findingTotal = report.counts.error + report.counts.warning + report.counts.info;
  const isRequest = doc.variant === "request";
  return (
    <div className="animate-slide-up border border-ink">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-2.5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-ink">{fileName ?? "Claim status file"}</span>
          <span className="border border-accent px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
            {VARIANT_LABEL[doc.variant]}
          </span>
          {doc.payerName && (
            <span className="label normal-case tracking-normal text-muted">
              {doc.providerName ?? "provider"} → {doc.payerName}
            </span>
          )}
        </div>
      </div>
      <div className={`grid ${isRequest ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-5"} divide-x divide-line [&>*]:px-4`}>
        <Stat label="Claims" value={doc.totals.claims} />
        {!isRequest && <Stat label="Accepted / paid" value={doc.totals.accepted} tone="text-emerald-600" />}
        {!isRequest && <Stat label="Rejected / denied" value={doc.totals.rejected} tone={doc.totals.rejected ? "text-rose-600" : "text-ink"} />}
        {!isRequest && <Stat label="Pending" value={doc.totals.pending} tone={doc.totals.pending ? "text-amber-600" : "text-ink"} />}
        <Stat label="Findings" value={findingTotal} tone={findingTotal ? "text-accent" : "text-ink"} />
      </div>
    </div>
  );
}
