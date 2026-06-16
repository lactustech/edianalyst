"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The file drop zone (spec §8). One centered, single-target control with three
 * states (default / drag-over / error). Accepts both drag-and-drop and
 * click-to-browse, never filters by extension, and validates by CONTENT — a file
 * is X12 only if its first three non-whitespace characters are "ISA". 100%
 * client-side; the file is never uploaded.
 *
 * Uses the site's existing tokens only: `accent` (#1F3AFF), `ink`, `muted`,
 * `.display`/`.label`, the OPEN A SAMPLE button style, rose for errors, and
 * square corners.
 */

/** Read the first bytes and confirm the file is X12 (starts with "ISA"). */
async function isX12(file: File): Promise<boolean> {
  const head = (await file.slice(0, 512).text()).replace(/^﻿/, "").replace(/^\s+/, "");
  return head.slice(0, 3) === "ISA";
}

interface DropZoneProps {
  onFile: (file: File) => void;
  /** When provided, renders a "Try a sample" text link below the zone. */
  onTrySample?: () => void;
  trySampleLabel?: string;
}

export function DropZone({
  onFile,
  onTrySample,
  trySampleLabel = "No file handy? Try a sample 835 →",
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (await isX12(file)) {
        setError(false);
        onFile(file);
      } else {
        setError(true);
      }
    },
    [onFile],
  );

  // One visual state derived from the two flags.
  const state: "drag" | "error" | "idle" = dragging ? "drag" : error ? "error" : "idle";

  const zoneTone =
    state === "drag"
      ? "border-accent bg-accent-soft"
      : state === "error"
        ? "border-rose-500 bg-rose-50"
        : "border-ink hover:bg-fill";

  const tone = state === "drag" ? "text-accent" : state === "error" ? "text-rose-600" : "text-ink";
  const iconBorder = state === "drag" ? "border-accent" : state === "error" ? "border-rose-500" : "border-ink";

  const headline =
    state === "drag"
      ? "Drop to parse"
      : state === "error"
        ? "That doesn't look like an X12 file"
        : isTouch
          ? "Tap to choose a file"
          : "Drop a file here";

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload an X12 EDI file, parsed locally in your browser"
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`group flex w-full cursor-pointer flex-col items-center gap-4 border-2 border-dashed px-6 py-12 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${zoneTone}`}
      >
        {/* No `accept` filter — EDI files have any extension or none; we validate
            by content (the file must start with ISA), never by name. */}
        <input ref={inputRef} type="file" className="hidden" onChange={(e) => void handleFiles(e.target.files)} />

        {/* Icon in a small square outline. Up-arrow by default; alert on error. */}
        <span className={`flex h-12 w-12 items-center justify-center border-2 ${iconBorder} ${tone}`} aria-hidden>
          {state === "error" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          )}
        </span>

        <p className={`display text-xl ${tone}`} aria-live="polite">
          {headline}
        </p>

        {state === "error" && (
          <p className="text-sm text-muted">X12 files start with ISA — try another, or load a sample.</p>
        )}

        {/* CHOOSE A FILE — styled exactly like OPEN A SAMPLE. Hidden while dragging.
            It's a visual affordance; the whole zone already opens the picker. */}
        {state !== "drag" && (
          <span className="inline-block bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-fg transition-colors group-hover:bg-ink">
            {state === "error" ? "Choose a different file" : "Choose a file"}
          </span>
        )}

        {state === "idle" && (
          <div className="flex flex-col items-center gap-1.5">
            <p className="label">We&apos;ll auto-detect the type — 834, 835, 837, 999 and more</p>
            <p className="label">Parsed in your browser · Never uploaded</p>
            <p className="label">Any X12 file · Any extension, or none</p>
          </div>
        )}
      </div>

      {/* Sample link — a sibling of the zone (not nested) to keep it a separate,
          valid interactive control. */}
      {onTrySample && state !== "drag" && (
        <button
          type="button"
          onClick={onTrySample}
          className="text-sm font-medium text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {trySampleLabel}
        </button>
      )}
    </div>
  );
}
