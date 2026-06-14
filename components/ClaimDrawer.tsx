"use client";

import type { Adjustment, ClaimRow, ServiceLine } from "../lib/transform/remittance835";
import type { RawSegment } from "../lib/x12/types";
import { usd } from "../lib/util/format";
import { statusTone } from "./ClaimsTable";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

function AdjustmentRows({ adjustments }: { adjustments: Adjustment[] }) {
  if (adjustments.length === 0) return null;
  return (
    <ul className="mt-1 space-y-0.5">
      {adjustments.map((a, i) => (
        <li key={i} className="flex items-baseline justify-between gap-3 text-xs">
          <span className="text-muted">
            <span className="font-medium text-ink">{a.group}</span> · {a.reason}
          </span>
          <span className="shrink-0 tabular-nums text-rose-600">−{usd(a.amount)}</span>
        </li>
      ))}
    </ul>
  );
}

function ServiceBlock({ line }: { line: ServiceLine }) {
  return (
    <li className="border border-line p-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-ink">{line.procedure}{line.units > 1 ? ` ×${line.units}` : ""}</span>
        <span className="tabular-nums text-muted">
          {usd(line.charge)} → <span className="font-medium text-ink">{usd(line.paid)}</span>
        </span>
      </div>
      {line.date && <div className="label mt-1">Service date {line.date}</div>}
      <AdjustmentRows adjustments={line.adjustments} />
      {line.remarks.length > 0 && (
        <ul className="mt-2 space-y-0.5 border-t border-line pt-2">
          {line.remarks.map((r, i) => (
            <li key={i} className="text-xs text-muted">
              <span className="font-medium text-accent">{r.code}</span> — {r.text}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** Claim detail (mirrors the 834 drawer): decoded fields, every service line
 *  with its adjustments and remark codes, plus the raw segments behind it. */
export function ClaimDrawer({
  claim,
  segments,
  onClose,
}: {
  claim: ClaimRow;
  segments: RawSegment[];
  onClose: () => void;
}) {
  const sourceSegments = claim.sourceSegmentIndices
    .map((i) => segments[i])
    .filter((s): s is RawSegment => Boolean(s));

  return (
    <div className="fixed inset-0 z-40 flex animate-fade-in justify-end bg-zinc-950/40 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="scroll-slim h-full w-full max-w-md animate-slide-in-right overflow-y-auto border-l border-line bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="display text-lg text-ink">{claim.claimId}</h3>
            <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold ${statusTone(claim.statusCode)}`}>
              {claim.status}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-ink" aria-label="Close">✕</button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4">
          <Field label="Patient" value={claim.patientName} />
          <Field label="Member ID" value={claim.memberId} />
          <Field label="Charged" value={usd(claim.totalCharge)} />
          <Field label="Paid" value={usd(claim.totalPaid)} />
          <Field label="Patient responsibility" value={usd(claim.patientResponsibility)} />
          <Field label="Coverage" value={claim.filing} />
          <Field label="Payer claim #" value={claim.payerClaimControlNumber} />
        </dl>

        {claim.adjustments.length > 0 && (
          <div className="mt-6">
            <h4 className="label">Claim-level adjustments</h4>
            <AdjustmentRows adjustments={claim.adjustments} />
          </div>
        )}

        <div className="mt-6">
          <h4 className="label">Service lines ({claim.serviceLines.length})</h4>
          <ul className="mt-2 space-y-2">
            {claim.serviceLines.length === 0 && <li className="text-sm text-muted">No service lines.</li>}
            {claim.serviceLines.map((line, i) => (
              <ServiceBlock key={i} line={line} />
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h4 className="label">The raw segments behind this claim</h4>
          <pre className="scroll-slim mt-2 overflow-x-auto bg-zinc-950 p-3 font-mono text-xs leading-relaxed text-zinc-100">
            {sourceSegments.map((s) => `${String(s.index).padStart(4, "0")}  ${s.raw}`).join("\n")}
          </pre>
        </div>
      </aside>
    </div>
  );
}
