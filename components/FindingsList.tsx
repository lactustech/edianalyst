"use client";

import type { Finding } from "../lib/validate/types";
import type { ValidationReport } from "../lib/validate/engine";

const SEVERITY_STYLE: Record<Finding["severity"], { dot: string; label: string }> = {
  error: { dot: "bg-rose-500", label: "Error" },
  warning: { dot: "bg-amber-500", label: "Warning" },
  info: { dot: "bg-sky-500", label: "Note" },
};

const ORDER: Finding["severity"][] = ["error", "warning", "info"];

/**
 * The findings tab (spec §6). Phase 1 free tier shows every envelope-level
 * finding; the placeholder notes where the Pro full-report gate will sit.
 */
export function FindingsList({
  report,
  onJump,
}: {
  report: ValidationReport;
  onJump?: (segmentIndex: number) => void;
}) {
  if (report.findings.length === 0) {
    return (
      <div className="surface flex flex-col items-center p-10 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
          ✓
        </div>
        <p className="text-muted">Nothing to flag — this file passed every Phase-1 check cleanly.</p>
      </div>
    );
  }

  const sorted = [...report.findings].sort(
    (a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity),
  );

  return (
    <div className="surface overflow-hidden">
      <div className="flex gap-4 border-b border-line/70 bg-fill/30 p-4 text-sm">
        <span className="font-semibold text-rose-600">{report.counts.error} errors</span>
        <span className="font-semibold text-amber-600">{report.counts.warning} warnings</span>
        <span className="font-semibold text-sky-600">{report.counts.info} notes</span>
      </div>
      <ul className="divide-y divide-line">
        {sorted.map((f, i) => {
          const style = SEVERITY_STYLE[f.severity];
          return (
            <li key={i} className="flex items-start gap-3 p-4">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} aria-hidden />
              <div className="flex-1">
                <p className="text-sm text-ink">{f.message}</p>
                <div className="mt-1 flex gap-3 text-xs text-muted">
                  <span>{style.label}</span>
                  {f.memberRef && <span>Member {f.memberRef}</span>}
                  {f.segmentIndex !== undefined && onJump && (
                    <button onClick={() => onJump(f.segmentIndex!)} className="text-accent hover:underline">
                      View segment {f.segmentIndex}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
