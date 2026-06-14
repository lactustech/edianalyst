"use client";

import type { MemberRow } from "../lib/transform/member834";
import type { RawSegment } from "../lib/x12/types";
import { MaintenanceBadge } from "./MaintenanceBadge";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

/**
 * Row detail (spec §5): the decoded fields AND the raw segments that produced
 * them. "Show me the bytes behind this row" is the trust-builder.
 */
export function MemberDrawer({
  row,
  segments,
  onClose,
}: {
  row: MemberRow;
  segments: RawSegment[];
  onClose: () => void;
}) {
  const sourceSegments = row.sourceSegmentIndices
    .map((i) => segments[i])
    .filter((s): s is RawSegment => Boolean(s));

  return (
    <div className="fixed inset-0 z-40 flex animate-fade-in justify-end bg-zinc-950/40 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="scroll-slim h-full w-full max-w-md animate-slide-in-right overflow-y-auto border-l border-line bg-surface p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink">
              {row.lastName}, {row.firstName} {row.middle ?? ""}
            </h3>
            <div className="mt-1">
              <MaintenanceBadge label={row.maintenanceType} tone={row.maintenanceTone} />
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted hover:bg-fill" aria-label="Close">
            ✕
          </button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4">
          <Field label="Subscriber ID" value={row.subscriberId} />
          <Field label="Member ID" value={row.memberId} />
          <Field label="Relationship" value={row.relationship} />
          <Field label="Benefit status" value={row.benefitStatus} />
          <Field label="Reason" value={row.maintenanceReason} />
          <Field label="Date of birth" value={row.dob} />
          <Field label="Gender" value={row.gender} />
          <Field label="Eligible from" value={row.eligibilityBegin} />
          <Field label="Eligible to" value={row.eligibilityEnd} />
        </dl>

        {row.address && (
          <div className="mt-4">
            <dt className="text-xs uppercase tracking-wide text-muted">Address</dt>
            <dd className="text-sm text-ink">
              {[row.address.street, [row.address.city, row.address.state].filter(Boolean).join(", "), row.address.zip]
                .filter(Boolean)
                .join(" · ") || "—"}
            </dd>
          </div>
        )}

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-ink">Coverage</h4>
          <ul className="mt-2 space-y-1">
            {row.coverages.length === 0 && <li className="text-sm text-muted">No coverage records.</li>}
            {row.coverages.map((c, i) => (
              <li key={i} className="flex items-center justify-between rounded bg-fill/60 px-3 py-1.5 text-sm">
                <span className="font-medium text-ink">{c.line}{c.level ? ` · ${c.level}` : ""}</span>
                <span className="tabular-nums text-muted">
                  {c.begin ?? "—"}{c.end ? ` → ${c.end}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-ink">The raw segments behind this row</h4>
          <pre className="scroll-slim mt-2 overflow-x-auto rounded-lg bg-zinc-950 p-3 font-mono text-xs leading-relaxed text-zinc-100 shadow-inner">
            {sourceSegments.map((s) => `${String(s.index).padStart(4, "0")}  ${s.raw}`).join("\n")}
          </pre>
        </div>
      </aside>
    </div>
  );
}
