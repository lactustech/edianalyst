"use client";

import { useState } from "react";

interface Item {
  label: string;
  onClick: () => void;
}

/** A flat dropdown of export actions. Tagged Pro (the license gate is a later
 *  phase); functional today, like Compare. */
export function ExportMenu({ items, label = "Export" }: { items: Item[]; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 border border-ink px-3 py-1 text-[13px] font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-canvas"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="square" />
        </svg>
        {label}
        <span className="border border-accent px-1 py-0.5 text-[9px] font-bold leading-none tracking-wide text-accent">Pro</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-52 border border-ink bg-surface">
            {items.map((it) => (
              <button
                key={it.label}
                onClick={() => {
                  it.onClick();
                  setOpen(false);
                }}
                className="block w-full border-b border-line px-4 py-2.5 text-left text-sm text-ink transition-colors last:border-b-0 hover:bg-fill hover:text-accent"
              >
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
