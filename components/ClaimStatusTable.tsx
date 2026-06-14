"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState } from "react";
import type { ClaimStatus, ClaimStatusRow } from "../lib/transform/claimStatus";
import { usd } from "../lib/util/format";
import { outcomeTone } from "./ClaimStatusSummary";

const ROW_HEIGHT = 48;

export function ClaimStatusTable({
  doc,
  claimsWithFindings,
  onSelect,
}: {
  doc: ClaimStatus;
  claimsWithFindings: Set<string>;
  onSelect: (c: ClaimStatusRow) => void;
}) {
  const isRequest = doc.variant === "request";
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doc.claims.filter(
      (c) => !q || c.claimId.toLowerCase().includes(q) || c.patientName.toLowerCase().includes(q),
    );
  }, [doc.claims, search]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const cols = "grid grid-cols-[1.1fr_1.4fr_1.8fr_1fr] gap-2";
  const ref = (c: ClaimStatusRow) => c.claimId || c.payerClaimId || c.patientName;

  return (
    <div className="border border-ink">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-fill/40 p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search claim or patient…"
          className="w-64 border border-line bg-canvas px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
        />
        <span className="ml-auto label">{rows.length} of {doc.claims.length} claims</span>
      </div>

      <div className={`${cols} border-b border-line px-4 py-2`}>
        <span className="label">Claim</span>
        <span className="label">Patient</span>
        <span className="label">{isRequest ? "Asking" : "Status"}</span>
        <span className="label text-right">Charge</span>
      </div>

      <div ref={scrollRef} className="scroll-slim h-[560px] overflow-auto">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
          {virtualizer.getVirtualItems().map((vi) => {
            const c = rows[vi.index]!;
            return (
              <button
                key={vi.key}
                onClick={() => onSelect(c)}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: ROW_HEIGHT, transform: `translateY(${vi.start}px)` }}
                className={`${cols} items-center border-b border-line px-4 text-left text-sm transition-colors hover:bg-fill`}
              >
                <span className="truncate font-medium tabular-nums text-ink">
                  {c.claimId || "—"}
                  {claimsWithFindings.has(ref(c)) && (
                    <span className="ml-1.5 text-amber-600" title="Has a finding">⚠</span>
                  )}
                </span>
                <span className="truncate text-muted">{c.patientName || "—"}</span>
                <span>
                  {isRequest ? (
                    <span className="text-muted">Status requested</span>
                  ) : (
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold ${outcomeTone(c.outcome)}`}>
                      {c.primaryStatus}
                    </span>
                  )}
                </span>
                <span className="text-right tabular-nums text-muted">{c.totalCharge !== undefined ? usd(c.totalCharge) : "—"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
