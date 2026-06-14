"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";
import type { Interchange, RawSegment } from "../lib/x12/types";

const ROW_HEIGHT = 28;

/**
 * The developer view (spec §5/§8): detected delimiters and the full segment
 * stream, virtualized so even 200k-segment files render. The minority who want
 * the bytes get them; analysts get the readable table by default.
 */
export function DeveloperView({
  interchange,
  segments,
  highlightIndex,
}: {
  interchange: Interchange;
  segments: RawSegment[];
  highlightIndex?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: segments.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  useEffect(() => {
    if (highlightIndex !== undefined) {
      virtualizer.scrollToIndex(highlightIndex, { align: "center" });
    }
  }, [highlightIndex, virtualizer]);

  const d = interchange.delimiters;
  const show = (c: string) => (c === "\n" ? "\\n" : c === "\r" ? "\\r" : c);

  return (
    <div className="surface overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line/70 bg-fill/30 p-4 text-xs text-muted">
        <span className="font-semibold uppercase tracking-wide">Detected delimiters</span>
        {([
          ["element", d.element],
          ["component", d.component],
          ["repetition", d.repetition],
          ["segment", d.segment],
        ] as const).map(([name, ch]) => (
          <span key={name} className="inline-flex items-center gap-1.5 rounded-md bg-surface px-2 py-1 font-mono shadow-card">
            <span className="text-muted/70">{name}</span>
            <span className="font-semibold text-accent">{show(ch)}</span>
          </span>
        ))}
        <span className="ml-auto font-medium">{segments.length} segments</span>
      </div>
      <div ref={scrollRef} className="scroll-slim h-[560px] overflow-auto font-mono text-xs">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
          {virtualizer.getVirtualItems().map((vi) => {
            const s = segments[vi.index]!;
            const highlighted = vi.index === highlightIndex;
            return (
              <div
                key={vi.key}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: ROW_HEIGHT, transform: `translateY(${vi.start}px)` }}
                className={`flex items-center gap-3 px-4 ${highlighted ? "bg-amber-100" : "hover:bg-fill/50"}`}
              >
                <span className="w-12 shrink-0 text-right text-muted">{s.index}</span>
                <span className="w-12 shrink-0 font-semibold text-accent">{s.tag}</span>
                <span className="truncate text-ink">{s.raw}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
