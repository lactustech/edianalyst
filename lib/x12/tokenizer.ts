import type { Delimiters, RawSegment } from "./types";

/**
 * Tokenizer (spec §3.2).
 *
 * Input: raw file text + detected delimiters. Output: a flat array of segments.
 * Transaction-agnostic — it knows nothing about 834; that lives in the schema.
 *
 * Handles the three real-world file shapes by splitting on the detected segment
 * terminator and trimming each piece: (a) one segment per line, (b) everything
 * on one line, (c) terminator followed by CRLF.
 */
export function tokenize(input: string, delimiters: Delimiters): RawSegment[] {
  const { element, component, segment } = delimiters;

  const segments: RawSegment[] = [];
  let index = 0;

  for (const chunk of input.split(segment)) {
    // Trim surrounding whitespace/newlines that some systems add for readability.
    const text = chunk.trim();
    if (text.length === 0) continue;

    const parts = text.split(element);
    const tag = parts[0]!;
    const rawElements = parts.slice(1);

    // Preserve empty trailing elements only up to the last non-empty one.
    let lastNonEmpty = rawElements.length - 1;
    while (lastNonEmpty >= 0 && rawElements[lastNonEmpty] === "") lastNonEmpty--;
    const elements = rawElements.slice(0, lastNonEmpty + 1);

    // Split components only where an element actually contains the separator.
    let components: (string[] | undefined)[] | undefined;
    elements.forEach((value, i) => {
      if (value.includes(component)) {
        components ??= [];
        components[i] = value.split(component);
      }
    });

    segments.push({ tag, elements, components, index, raw: text });
    index++;
  }

  return segments;
}
