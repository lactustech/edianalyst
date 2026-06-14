"use client";

import type { PremiumLine } from "../lib/transform/premium820";
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

/** Premium-line detail with the raw segments behind it. */
export function Premium820Drawer({
  line,
  segments,
  onClose,
}: {
  line: PremiumLine;
  segments: RawSegment[];
  onClose: () => void;
}) {
  const sourceSegments = line.sourceSegmentIndices
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
            <h3 className="display text-lg text-ink">{line.reference || "Premium line"}</h3>
            <span className="label mt-1 normal-case tracking-normal">{line.referenceType}</span>
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-ink" aria-label="Close">✕</button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4">
          <Field label="Name" value={line.name} />
          <Field label="Reference" value={line.reference} />
          <Field label="Amount paid" value={usd(line.amountPaid)} />
          {line.premiumAmount !== undefined && <Field label="Premium amount" value={usd(line.premiumAmount)} />}
        </dl>

        <div className="mt-6">
          <h4 className="label">The raw segments behind this line</h4>
          <pre className="scroll-slim mt-2 overflow-x-auto bg-zinc-950 p-3 font-mono text-xs leading-relaxed text-zinc-100">
            {sourceSegments.map((s) => `${String(s.index).padStart(4, "0")}  ${s.raw}`).join("\n")}
          </pre>
        </div>
      </aside>
    </div>
  );
}
