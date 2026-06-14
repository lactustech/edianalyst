"use client";

import type { ClaimStatusRow } from "../lib/transform/claimStatus";
import type { RawSegment } from "../lib/x12/types";
import { usd } from "../lib/util/format";
import { outcomeTone } from "./ClaimStatusSummary";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

/** Claim-status detail: every STC status line plus the raw segments. */
export function ClaimStatusDrawer({
  claim,
  isRequest,
  segments,
  onClose,
}: {
  claim: ClaimStatusRow;
  isRequest: boolean;
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
            <h3 className="display text-lg text-ink">{claim.claimId || "Claim"}</h3>
            {!isRequest && (
              <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold ${outcomeTone(claim.outcome)}`}>
                {claim.primaryStatus}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-ink" aria-label="Close">✕</button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4">
          <Field label="Patient" value={claim.patientName} />
          <Field label="Member ID" value={claim.memberId} />
          <Field label="Payer claim #" value={claim.payerClaimId} />
          {claim.totalCharge !== undefined && <Field label="Charge" value={usd(claim.totalCharge)} />}
        </dl>

        {!isRequest && (
          <div className="mt-6">
            <h4 className="label">Status history ({claim.statuses.length})</h4>
            <ul className="mt-2 space-y-2">
              {claim.statuses.length === 0 && <li className="text-sm text-muted">No status lines.</li>}
              {claim.statuses.map((s, i) => (
                <li key={i} className="border border-line p-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium text-ink">{s.category}</span>
                    {s.date && <span className="label normal-case tracking-normal">{s.date}</span>}
                  </div>
                  {s.statusText && <p className="mt-1 text-sm text-muted">{s.statusText}</p>}
                  {s.amount !== undefined && <p className="label mt-1 normal-case tracking-normal">{usd(s.amount)}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

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
