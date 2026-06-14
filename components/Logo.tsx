"use client";

/** A stark cobalt mark: a solid square cut by two ledger rules of unequal
 *  length — raw rows resolving into a table. Sharp corners, no gradient. */
export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} role="img" aria-label="EDIAnalyst">
      <rect width="28" height="28" className="fill-accent" />
      <rect x="6" y="9" width="16" height="2.4" className="fill-accent-fg" />
      <rect x="6" y="14" width="10" height="2.4" className="fill-accent-fg" />
      <rect x="6" y="19" width="13" height="2.4" className="fill-accent-fg" />
    </svg>
  );
}
