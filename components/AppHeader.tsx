"use client";

import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

/** Swiss header: hard bottom rule, tight uppercase wordmark, a flat LOCAL tag.
 *  No pill, no pulse, no shadow — structure does the work. */
export function AppHeader({ onReset, showReset }: { onReset?: () => void; showReset?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink bg-canvas">
      <div className="mx-auto flex max-w-6xl items-stretch justify-between px-6">
        <button
          onClick={showReset ? onReset : undefined}
          className="flex items-center gap-3 border-r border-line py-3 pr-6 text-left"
        >
          <Logo />
          <span className="display text-[15px] uppercase leading-none tracking-[-0.01em] text-ink">
            EDIAnalyst
          </span>
          <span className="label hidden sm:inline">X12 · 5010</span>
        </button>

        <div className="flex items-stretch">
          <span className="hidden items-center gap-2 border-l border-line px-5 sm:flex">
            <span className="h-2 w-2 bg-accent" aria-hidden />
            <span className="label">Runs locally</span>
          </span>
          <span className="flex items-center border-l border-line px-3">
            <ThemeToggle />
          </span>
          {showReset && (
            <button
              onClick={onReset}
              className="flex items-center border-l border-line px-5 text-[13px] font-medium uppercase tracking-wide text-muted transition-colors hover:bg-accent hover:text-accent-fg"
            >
              New file
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
