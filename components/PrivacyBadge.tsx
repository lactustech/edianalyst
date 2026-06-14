"use client";

/** Flat, Swiss reassurance that parsing is local (spec §8) — a cobalt square
 *  and a tracked label, no pill, no emoji. */
export function PrivacyBadge() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-2 w-2 bg-accent" aria-hidden />
      <span className="label">Processed in your browser — nothing uploaded</span>
    </span>
  );
}
