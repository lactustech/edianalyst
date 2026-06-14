"use client";

import type { AckTransaction, SegmentError } from "../lib/transform/ack999";
import type { RawSegment } from "../lib/x12/types";
import { ackTone } from "./Ack999Summary";

function SegmentErrorBlock({ err }: { err: SegmentError }) {
  return (
    <li className="border border-line p-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-ink">
          {err.segmentId}
          <span className="text-muted"> @ position {err.position}</span>
          {err.loopId ? <span className="text-muted"> · loop {err.loopId}</span> : null}
        </span>
      </div>
      <p className="mt-1 text-sm text-rose-600">{err.error}</p>

      {err.elementErrors.length > 0 && (
        <ul className="mt-2 space-y-1 border-t border-line pt-2">
          {err.elementErrors.map((e, i) => (
            <li key={i} className="text-xs text-muted">
              <span className="font-medium text-ink">Element {e.position}</span>
              {e.elementRef ? ` (ref ${e.elementRef})` : ""} — {e.error}
              {e.badValue ? (
                <span className="ml-1 font-mono text-rose-600">“{e.badValue}”</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {err.context.length > 0 && (
        <p className="label mt-2 normal-case tracking-normal">Context: {err.context.join("  ·  ")}</p>
      )}
    </li>
  );
}

/** Acknowledgment detail: outcome, syntax errors, every flagged segment/element. */
export function Ack999Drawer({
  txn,
  segments,
  onClose,
}: {
  txn: AckTransaction;
  segments: RawSegment[];
  onClose: () => void;
}) {
  const sourceSegments = txn.sourceSegmentIndices
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
            <h3 className="display text-lg text-ink">{txn.setId} #{txn.controlNumber}</h3>
            <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold ${ackTone(txn.statusCode)}`}>
              {txn.status}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-ink" aria-label="Close">✕</button>
        </div>

        {txn.syntaxErrors.length > 0 && (
          <div className="mt-6">
            <h4 className="label">Why</h4>
            <ul className="mt-2 space-y-1 text-sm text-ink">
              {txn.syntaxErrors.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <h4 className="label">Flagged segments ({txn.segmentErrors.length})</h4>
          <ul className="mt-2 space-y-2">
            {txn.segmentErrors.length === 0 && <li className="text-sm text-muted">No segment-level errors.</li>}
            {txn.segmentErrors.map((err, i) => (
              <SegmentErrorBlock key={i} err={err} />
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h4 className="label">The raw acknowledgment segments</h4>
          <pre className="scroll-slim mt-2 overflow-x-auto bg-zinc-950 p-3 font-mono text-xs leading-relaxed text-zinc-100">
            {sourceSegments.map((s) => `${String(s.index).padStart(4, "0")}  ${s.raw}`).join("\n")}
          </pre>
        </div>
      </aside>
    </div>
  );
}
