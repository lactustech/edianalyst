"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState } from "react";
import type { PremiumLine } from "../lib/transform/premium820";
import { usd } from "../lib/util/format";

const ROW_HEIGHT = 48;

export function Premium820Table({
  lines,
  onSelect,
}: {
  lines: PremiumLine[];
  onSelect: (line: PremiumLine) => void;
}) {
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [sortByAmount, setSortByAmount] = useState(true);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = lines.filter(
      (l) => !q || l.reference.toLowerCase().includes(q) || l.name.toLowerCase().includes(q),
    );
    const dir = sortAsc ? 1 : -1;
    return [...out].sort((a, b) => {
      if (sortByAmount) return (a.amountPaid - b.amountPaid) * dir;
      return a.reference < b.reference ? -dir : a.reference > b.reference ? dir : 0;
    });
  }, [lines, search, sortAsc, sortByAmount]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const cols = "grid grid-cols-[1.2fr_1.6fr_1.3fr_1fr] gap-2";
  const sortMark = (active: boolean) => (active ? (sortAsc ? " ▲" : " ▼") : "");

  return (
    <div className="border border-ink">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-fill/40 p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search policy or name…"
          className="w-64 border border-line bg-canvas px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
        />
        <span className="ml-auto label">{rows.length} of {lines.length} lines</span>
      </div>

      <div className={`${cols} border-b border-line px-4 py-2`}>
        <button onClick={() => { setSortByAmount(false); setSortAsc((s) => !s); }} className="label text-left hover:text-ink">
          Reference{sortMark(!sortByAmount)}
        </button>
        <span className="label">Name</span>
        <span className="label">Type</span>
        <button onClick={() => { setSortByAmount(true); setSortAsc((s) => !s); }} className="label text-right hover:text-ink">
          Amount{sortMark(sortByAmount)}
        </button>
      </div>

      <div ref={scrollRef} className="scroll-slim h-[560px] overflow-auto">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
          {virtualizer.getVirtualItems().map((vi) => {
            const l = rows[vi.index]!;
            return (
              <button
                key={vi.key}
                onClick={() => onSelect(l)}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: ROW_HEIGHT, transform: `translateY(${vi.start}px)` }}
                className={`${cols} items-center border-b border-line px-4 text-left text-sm transition-colors hover:bg-fill`}
              >
                <span className="truncate font-medium tabular-nums text-ink">{l.reference || "—"}</span>
                <span className="truncate text-muted">{l.name || "—"}</span>
                <span className="truncate text-muted">{l.referenceType}</span>
                <span className="text-right font-medium tabular-nums text-ink">{usd(l.amountPaid)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
