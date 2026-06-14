"use client";

import type { Remittance835 } from "../lib/transform/remittance835";
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

/** Swiss summary band for an 835 remittance: payment meta + stat columns. */
export function RemittanceSummary({
  doc,
  report,
  fileName,
}: {
  doc: Remittance835;
  report: ValidationReport;
  fileName?: string;
}) {
  const findingTotal = report.counts.error + report.counts.warning + report.counts.info;
  return (
    <div className="animate-slide-up border border-ink">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-2.5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-ink">{fileName ?? "835 file"}</span>
          <span className="border border-accent px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
            {doc.paymentMethod || "Payment"}
          </span>
          {doc.payerName && (
            <span className="label normal-case tracking-normal text-muted">
              {doc.payerName} → {doc.payeeName ?? "payee"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {doc.traceNumber && <span className="label">#{doc.traceNumber}</span>}
          {doc.paymentDate && <span className="label">Paid {doc.paymentDate}</span>}
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-line sm:grid-cols-6 [&>*]:px-4">
        <Stat label="Total paid" value={usd(doc.totalPaid)} tone="text-accent" />
        <Stat label="Claims" value={doc.totals.claims} />
        <Stat label="Charged" value={usd(doc.totals.charged)} />
        <Stat label="Patient resp" value={usd(doc.totals.patientResponsibility)} />
        <Stat label="Denied" value={doc.totals.denied} tone={doc.totals.denied ? "text-rose-600" : "text-ink"} />
        <Stat label="Findings" value={findingTotal} tone={findingTotal ? "text-accent" : "text-ink"} />
      </div>
    </div>
  );
}
