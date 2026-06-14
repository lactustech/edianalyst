"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState } from "react";
import type { AckTransaction } from "../lib/transform/ack999";
import { ackTone } from "./Ack999Summary";

const ROW_HEIGHT = 48;

/** Stable label/key for an acknowledged transaction (matches finding refs). */
export function ackKey(t: AckTransaction): string {
  return `${t.setId} #${t.controlNumber}`;
}

export function Ack999Table({
  transactions,
  acksWithFindings,
  onSelect,
}: {
  transactions: AckTransaction[];
  acksWithFindings: Set<string>;
  onSelect: (t: AckTransaction) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusOptions = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.status).filter(Boolean))).sort(),
    [transactions],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!q) return true;
      return t.controlNumber.toLowerCase().includes(q) || t.setId.toLowerCase().includes(q);
    });
  }, [transactions, search, statusFilter]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const cols = "grid grid-cols-[0.8fr_1fr_1.6fr_1fr] gap-2";

  return (
    <div className="border border-ink">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-fill/40 p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search control number…"
          className="w-56 border border-line bg-canvas px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
        />
        <label className="flex items-center gap-1.5 text-sm text-muted">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-line bg-canvas px-2 py-1 text-sm focus:border-accent focus:outline-none"
          >
            <option value="all">All</option>
            {statusOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
        <span className="ml-auto label">{rows.length} of {transactions.length} transactions</span>
      </div>

      <div className={`${cols} border-b border-line px-4 py-2`}>
        <span className="label">Set</span>
        <span className="label">Control #</span>
        <span className="label">Status</span>
        <span className="label text-right">Segment errors</span>
      </div>

      <div ref={scrollRef} className="scroll-slim h-[560px] overflow-auto">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
          {virtualizer.getVirtualItems().map((vi) => {
            const t = rows[vi.index]!;
            return (
              <button
                key={vi.key}
                onClick={() => onSelect(t)}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: ROW_HEIGHT, transform: `translateY(${vi.start}px)` }}
                className={`${cols} items-center border-b border-line px-4 text-left text-sm transition-colors hover:bg-fill`}
              >
                <span className="font-medium text-ink">{t.setId}</span>
                <span className="tabular-nums text-muted">
                  {t.controlNumber}
                  {acksWithFindings.has(ackKey(t)) && (
                    <span className="ml-1.5 text-amber-600" title="Has a finding">⚠</span>
                  )}
                </span>
                <span>
                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold ${ackTone(t.statusCode)}`}>
                    {t.status}
                  </span>
                </span>
                <span className="text-right tabular-nums text-muted">{t.segmentErrors.length || "—"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
