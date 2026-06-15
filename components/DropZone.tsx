"use client";

import { useCallback, useRef, useState } from "react";

/** Swiss drop target: a hard-bordered band, flush-left content, cobalt on drag.
 *  No dashed-pill, no gradient, no glow. */
export function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={`group flex cursor-pointer items-center gap-5 border px-6 py-7 transition-colors ${
        dragging ? "border-accent bg-accent-soft" : "border-ink hover:bg-fill"
      }`}
    >
      {/* No accept filter — EDI files have no extension convention (.edi, .x12,
          .txt, .dat, .835, bare numbers, or none). We detect X12 by content
          (the file must start with ISA), never by file name. */}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Square accent glyph */}
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center border transition-colors ${
          dragging ? "border-accent text-accent" : "border-ink text-ink group-hover:border-accent group-hover:text-accent"
        }`}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path d="M12 3v13m0 0l-5-5m5 5l5-5" strokeLinecap="square" />
          <path d="M4 21h16" strokeLinecap="square" />
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        <p className="display text-balance text-lg text-ink">Drop any X12 file — we&apos;ll detect the type</p>
        <p className="mt-1 text-sm text-muted">
          Parsed entirely in your browser — nothing is uploaded.
        </p>
        <p className="label mt-3">Any X12 file · .edi .x12 .txt .dat · or no extension</p>
      </div>
    </div>
  );
}
