"use client";

import type { ClaimRow837, ServiceLine837 } from "../lib/transform/claim837";
import type { RawSegment } from "../lib/x12/types";
import { usd } from "../lib/util/format";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

function ServiceBlock({ line }: { line: ServiceLine837 }) {
  const title = line.procedure || line.revenueDescription || `Line ${line.lineNumber}`;
  return (
    <li className="border border-line p-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-ink">
          {title}
          {line.modifiers.length > 0 ? ` · ${line.modifiers.join(", ")}` : ""}
          {line.units > 1 ? ` ×${line.units}` : ""}
        </span>
        <span className="tabular-nums font-medium text-ink">{usd(line.charge)}</span>
      </div>
      <div className="label mt-1 flex flex-wrap gap-x-4">
        {line.revenueCode && (
          <span>
            Rev {line.revenueCode}
            {line.procedure && line.revenueDescription ? ` · ${line.revenueDescription}` : ""}
          </span>
        )}
        {line.serviceDate && <span>Service {line.serviceDate}</span>}
        {line.diagnosisPointers.length > 0 && <span>Dx pointer {line.diagnosisPointers.join(", ")}</span>}
      </div>
    </li>
  );
}

/** Claim detail: hierarchy context, diagnoses, every service line, raw segments. */
export function Claim837Drawer({
  claim,
  segments,
  onClose,
}: {
  claim: ClaimRow837;
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
            <span className="label mt-1 normal-case tracking-normal">{claim.setting} · {claim.frequency}</span>
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-ink" aria-label="Close">✕</button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4">
          <Field label="Patient" value={claim.patientName} />
          <Field label="Subscriber" value={claim.subscriberName} />
          <Field label="Payer" value={claim.payerName} />
          <Field label="Filing" value={claim.filing} />
          <Field label={claim.settingType} value={claim.setting} />
          <Field label="Billing provider" value={claim.billingProviderName} />
          <Field label="Billing NPI" value={claim.billingProviderNpi} />
          <Field label="Total charge" value={usd(claim.totalCharge)} />
        </dl>

        <div className="mt-6">
          <h4 className="label">Diagnoses ({claim.diagnoses.length})</h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {claim.diagnoses.length === 0 && <li className="text-sm text-muted">None on the claim.</li>}
            {claim.diagnoses.map((d, i) => (
              <li key={i} className="flex items-center gap-1.5 border border-line px-2 py-1 text-xs">
                <span className="font-mono font-medium text-ink">{d.code}</span>
                {d.primary && <span className="bg-accent-soft px-1 text-[10px] font-semibold uppercase text-accent">Primary</span>}
              </li>
            ))}
          </ul>
        </div>

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
