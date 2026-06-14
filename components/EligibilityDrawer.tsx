"use client";

import type { BenefitLine, EligibilityMember } from "../lib/transform/eligibility";
import type { RawSegment } from "../lib/x12/types";
import { usd } from "../lib/util/format";
import { coverageTone } from "./EligibilitySummary";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

function BenefitRow({ line, isResponse }: { line: BenefitLine; isResponse: boolean }) {
  return (
    <li className="border border-line p-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-ink">{line.serviceType}</span>
        {isResponse && line.status && (
          <span className="label normal-case tracking-normal text-muted">{line.status}</span>
        )}
      </div>
      {isResponse && (
        <div className="label mt-1 flex flex-wrap gap-x-4 normal-case tracking-normal">
          {line.coverageLevel && <span>{line.coverageLevel}</span>}
          {line.planDescription && <span>{line.planDescription}</span>}
          {line.amount !== undefined && <span>{usd(line.amount)}</span>}
          {line.percent && <span>{line.percent}%</span>}
        </div>
      )}
    </li>
  );
}

/** Member eligibility detail with the raw segments behind it. */
export function EligibilityDrawer({
  member,
  isResponse,
  segments,
  onClose,
}: {
  member: EligibilityMember;
  isResponse: boolean;
  segments: RawSegment[];
  onClose: () => void;
}) {
  const sourceSegments = member.sourceSegmentIndices
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
            <h3 className="display text-lg text-ink">{member.name || member.memberId}</h3>
            {isResponse && (
              <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold ${coverageTone(member.coverageStatus)}`}>
                {member.coverageStatus}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-ink" aria-label="Close">✕</button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4">
          <Field label="Member ID" value={member.memberId} />
          <Field label="Relationship" value={member.relationship} />
          <Field label="Date of birth" value={member.dob} />
          <Field label="Gender" value={member.gender} />
        </dl>

        <div className="mt-6">
          <h4 className="label">{isResponse ? `Benefits (${member.lines.length})` : `Requested services (${member.lines.length})`}</h4>
          <ul className="mt-2 space-y-2">
            {member.lines.length === 0 && <li className="text-sm text-muted">None.</li>}
            {member.lines.map((line, i) => (
              <BenefitRow key={i} line={line} isResponse={isResponse} />
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h4 className="label">The raw segments behind this member</h4>
          <pre className="scroll-slim mt-2 overflow-x-auto bg-zinc-950 p-3 font-mono text-xs leading-relaxed text-zinc-100">
            {sourceSegments.map((s) => `${String(s.index).padStart(4, "0")}  ${s.raw}`).join("\n")}
          </pre>
        </div>
      </aside>
    </div>
  );
}
