"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState } from "react";
import { diffMembers, type MemberChangeKind, type MemberDiff } from "../lib/diff/member-diff";
import { exportDiffCsv, exportDiffXlsx } from "../lib/export";
import type { MemberRow } from "../lib/transform/member834";
import { DropZone } from "./DropZone";
import { ExportMenu } from "./ExportMenu";
import { useAnalyzer } from "./useAnalyzer";

const ROW_HEIGHT = 48;

const KIND: Record<MemberChangeKind, { label: string; badge: string }> = {
  added: { label: "Added", badge: "bg-emerald-100 text-emerald-800" },
  terminated: { label: "Removed", badge: "bg-rose-100 text-rose-800" },
  changed: { label: "Changed", badge: "bg-amber-100 text-amber-900" },
  unchanged: { label: "Unchanged", badge: "bg-slate-100 text-slate-600" },
};

const FILTERS: ("all" | MemberChangeKind)[] = ["all", "added", "terminated", "changed", "unchanged"];

/**
 * Compare the open file (treated as the newer "after") against an earlier file
 * the analyst loads here (the "before"). This is the Pro diff feature (spec §9).
 */
export function DiffPanel({ baseMembers, baseName }: { baseMembers: MemberRow[]; baseName?: string }) {
  const { state, analyzeFile, reset } = useAnalyzer();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [selected, setSelected] = useState<MemberDiff | null>(null);

  const earlier = state.result?.enrollment?.members;
  const result = useMemo(
    () => (earlier ? diffMembers(earlier, baseMembers) : null),
    [earlier, baseMembers],
  );

  const loadSample = async (path: string, name: string) => {
    const res = await fetch(path);
    await analyzeFile(new File([await res.text()], name, { type: "text/plain" }));
  };

  // --- empty / loading / error states for the second file ---
  if (!result) {
    return (
      <div className="surface p-6">
        <h3 className="text-base font-semibold text-ink">Compare against an earlier file</h3>
        <p className="mt-1 text-sm text-muted">
          Load last week&apos;s 834 to see who was added, removed, or changed since then. The file you
          already opened{baseName ? ` (${baseName})` : ""} is treated as the newer one.
        </p>

        {state.status === "error" ? (
          <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800">
            {state.error}
            <button onClick={reset} className="ml-2 font-medium underline">Try again</button>
          </div>
        ) : state.status === "reading" || state.status === "working" ? (
          <div className="mt-5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-fill">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${state.progress}%` }} />
            </div>
            <p className="mt-2 text-xs uppercase tracking-wide text-muted/70">{state.phase}…</p>
          </div>
        ) : (
          <div className="mt-4">
            <DropZone onFile={analyzeFile} />
            <p className="mt-3 text-sm text-muted">
              No earlier file handy? Load a synthetic{" "}
              <button onClick={() => loadSample("/samples/earlier-834.edi", "earlier-834.edi")} className="font-medium text-accent hover:underline">
                earlier sample
              </button>
              {" "}— it pairs with the &ldquo;newer&rdquo; sample on the landing page.
            </p>
          </div>
        )}
      </div>
    );
  }

  const { summary, diffs } = result;
  const filtered = filter === "all" ? diffs : diffs.filter((d) => d.kind === filter);

  return (
    <div className="space-y-4">
      <div className="surface flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="text-sm text-muted">
          Comparing <span className="font-medium text-ink">{state.fileName}</span> →{" "}
          <span className="font-medium text-ink">{baseName ?? "open file"}</span>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu
            label="Export diff"
            items={[
              { label: "Download CSV", onClick: () => exportDiffCsv(diffs) },
              { label: "Download Excel", onClick: () => exportDiffXlsx(diffs) },
            ]}
          />
          <button onClick={reset} className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted hover:bg-fill">
            Choose a different file
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Added" value={summary.added} tone="text-emerald-700" />
        <SummaryCard label="Removed" value={summary.terminated} tone="text-rose-700" />
        <SummaryCard label="Changed" value={summary.changed} tone="text-amber-700" />
        <SummaryCard label="Unchanged" value={summary.unchanged} tone="text-slate-600" />
      </div>

      {/* Filter + list */}
      <div className="surface overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-line bg-fill/30 p-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1 text-sm font-medium capitalize transition-colors ${
                filter === f ? "bg-ink text-canvas" : "text-muted hover:bg-fill"
              }`}
            >
              {f === "terminated" ? "removed" : f}
            </button>
          ))}
          <span className="ml-auto self-center pr-2 text-xs text-muted">{filtered.length} members</span>
        </div>

        <VirtualList diffs={filtered} onSelect={setSelected} />
      </div>

      {selected && <DiffDrawer diff={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="surface p-4">
      <div className={`text-2xl font-bold tabular-nums ${tone}`}>{value}</div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

function VirtualList({ diffs, onSelect }: { diffs: MemberDiff[]; onSelect: (d: MemberDiff) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const v = useVirtualizer({
    count: diffs.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  if (diffs.length === 0) {
    return <div className="p-8 text-center text-sm text-muted">No members in this category.</div>;
  }

  return (
    <div ref={scrollRef} className="scroll-slim h-[480px] overflow-auto">
      <div style={{ height: v.getTotalSize(), position: "relative", width: "100%" }}>
        {v.getVirtualItems().map((vi) => {
          const d = diffs[vi.index]!;
          const meta = KIND[d.kind];
          return (
            <button
              key={vi.key}
              onClick={() => onSelect(d)}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: ROW_HEIGHT, transform: `translateY(${vi.start}px)` }}
              className="flex items-center gap-3 border-b border-line px-4 text-left text-sm transition-colors hover:bg-fill"
            >
              <span className={`w-24 shrink-0 rounded px-2 py-0.5 text-center text-xs font-semibold ${meta.badge}`}>
                {meta.label}
              </span>
              <span className="flex-1 truncate font-medium text-ink">{d.display}</span>
              {d.kind === "changed" && (
                <span className="shrink-0 text-xs text-muted">
                  {d.changes.length} field{d.changes.length === 1 ? "" : "s"} →
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DiffDrawer({ diff, onClose }: { diff: MemberDiff; onClose: () => void }) {
  const meta = KIND[diff.kind];
  return (
    <div className="fixed inset-0 z-40 flex animate-fade-in justify-end bg-zinc-950/40 backdrop-blur-sm" onClick={onClose}>
      <aside className="scroll-slim h-full w-full max-w-md animate-slide-in-right overflow-y-auto border-l border-line bg-surface p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink">{diff.display}</h3>
            <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold ${meta.badge}`}>{meta.label}</span>
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted hover:bg-fill" aria-label="Close">✕</button>
        </div>

        {diff.kind === "changed" ? (
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 font-medium">Field</th>
                <th className="pb-2 font-medium">Before</th>
                <th className="pb-2 font-medium">After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {diff.changes.map((c) => (
                <tr key={c.field} className="align-top">
                  <td className="py-2 pr-3 text-muted">{c.label}</td>
                  <td className="py-2 pr-3 text-rose-600 line-through decoration-rose-300">{c.before || "—"}</td>
                  <td className="py-2 font-medium text-emerald-700">{c.after || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-6 text-sm text-muted">
            {diff.kind === "added"
              ? "This member appears in the newer file but not the earlier one."
              : diff.kind === "terminated"
                ? "This member was in the earlier file but is gone from the newer one."
                : "No field-level changes between the two files."}
          </p>
        )}
      </aside>
    </div>
  );
}
