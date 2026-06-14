# EDIAnalyst — Master Build Prompt (v1)

> **How to use this document.** This is the authoritative build spec for EDIAnalyst.com. Feed it to a coding agent (Claude Code / Cursor / etc.) section by section, not all at once. Build **Phase 1 only** until the free 834 viewer works end to end on a real synthetic file. Everything after Phase 1 is scoped here so the architecture doesn't have to be reworked later — do **not** build it yet.

---

## 0. Role & operating instructions for the build agent

You are a senior TypeScript/React engineer building a **client-side X12 EDI viewer** for healthcare business analysts. The defining product principle: **files are parsed entirely in the browser and never transmitted to any server.** This is the moat, the privacy story, and the reason there is zero HIPAA hosting burden. Any design that uploads a file to a backend is wrong and must be rejected.

Work in vertical slices. After each milestone, the app must run and do something demonstrable. Prefer clarity over cleverness — the maintainer reads X12 fluently but wants readable code. Commit after each working slice with a conventional-commit message.

When you hit a genuine ambiguity, make the smallest reasonable assumption, state it in a code comment prefixed `// ASSUMPTION:`, and keep moving. Do not stop to ask unless a decision is irreversible.

---

## 1. Product thesis & non-negotiables

**Who it's for:** EDI analysts, enrollment analysts, benefits-admin and TPA staff who stare at raw 834/837/835 files and need them readable — not developers, not integration engineers. Competitors (Stedi, EDI Notepad, edi-lens) serve developers or are discontinued. The gap is the *analyst* who just wants a member-level table and an Excel export.

**The product in one sentence:** Drop in an 834, get a clean member-level table in seconds, with plain-English validation and a diff against last week's file.

### Hard constraints (violating any of these is a defect)

1. **Client-side only.** Parsing, validation, diff, and export all run in-browser. No file bytes leave the device. A user must be able to open the Network tab, parse a file, and see zero upload requests.
2. **No PHI ever reaches a server.** The only network calls are: static asset loads, the Lemon Squeezy license-validation call (sends a license key, never file data), and analytics page events (never file contents).
3. **IP / copyright firewall.** The ASC X12 TR3 implementation guides are **licensed, copyrighted text.** Do **not** copy segment/element descriptions verbatim from any TR3, Washington Publishing, or vendor doc. All human-readable labels and help text in this app must be **originally authored plain-English** descriptions. Code values themselves (e.g., `021`, `HLT`) are facts and are fine; their prose definitions must be reworded in our own voice.
4. **No real EDI files in the repo, ever.** All test fixtures come from the synthetic generator (Section 12). Never commit, paste, or train on a real production file from anywhere.
5. **Free tier is genuinely useful; Pro gates the deliverables.** Viewing is free. Exporting, diffing, batch, and the full validation report are Pro. Never cripple viewing to force an upgrade — analysts must trust the free tool first.

---

## 2. Tech stack & repository structure

- **Framework:** Next.js (App Router) with **static export** (`output: 'export'`). No server runtime.
- **Styling:** Tailwind CSS. B2B-trust aesthetic — white background, navy (#0F2A4A) primary, teal (#0E9D8E) accent, Inter or IBM Plex Sans. Function over flourish.
- **Hosting:** Cloudflare Pages.
- **Parsing:** Pure TypeScript, zero parsing dependencies. The tokenizer is hand-rolled.
- **Heavy work:** Web Worker (Comlink for ergonomics is fine).
- **Big-table rendering:** `@tanstack/react-virtual` (or react-window).
- **Excel export:** SheetJS (`xlsx`), invoked client-side only.
- **License/payments:** Lemon Squeezy license-key API via a single Cloudflare Worker (Phase 5 — do not build yet).
- **Testing:** Vitest for unit, Playwright for one end-to-end happy path.

```
/edianalyst
  /app                      # Next.js routes (UI)
    /page.tsx               # the viewer (home = the product)
    /reference/[segment]    # SEO segment pages (Phase 4)
  /lib
    /x12
      tokenizer.ts          # raw bytes -> segments/elements
      envelope.ts           # ISA/GS/ST/SE/GE/IEA parsing + control totals
      delimiters.ts         # delimiter auto-detection
      types.ts              # shared X12 AST types
    /schemas
      types.ts              # schema definition types (loop/segment/element)
      x834.ts               # the 834 schema (Phase 1)
      // x837p.ts, x837i.ts, x835.ts  -> Phase later, do not build
    /transform
      member834.ts          # AST -> member-level readable model (the differentiator)
    /validate
      engine.ts             # runs rule sets, returns plain-English findings
      rules834.ts           # 834-specific rules
    /diff
      member-diff.ts        # Phase later, stub the interface now
    /export
      to-xlsx.ts            # Phase later (Pro)
      to-csv.ts
    /codelists              # ORIGINAL plain-English label maps (see §1.3)
      relationship.ts
      maintenanceType.ts
      dtpQualifiers.ts
      insuranceLine.ts
  /workers
    parse.worker.ts         # runs tokenizer+transform+validate off main thread
  /tools
    gen-834.ts              # synthetic file generator (Section 12)
  /fixtures                 # ONLY generated files land here
  /tests
```

---

## 3. PHASE 1 — Parser engine

### 3.1 Delimiter auto-detection (`lib/x12/delimiters.ts`)

X12 delimiters are not fixed; they are declared positionally in the ISA segment. Detect them from the raw text, do not hardcode:

- The first 3 characters must be `ISA`. If not, reject with a friendly error ("This doesn't look like an X12 file — it should start with ISA").
- **Element separator:** the 4th character (index 3). Commonly `*` but never assume.
- **Component (sub-element) separator:** ISA element 16 — the single character at the fixed offset just before the segment terminator of the ISA. Commonly `:`.
- **Repetition separator:** ISA element 11 (position-fixed in 5010). Commonly `^` or `U` (U meaning "not used" in older files).
- **Segment terminator:** the character immediately following the ISA's element-16 component separator. Commonly `~`, sometimes `~` followed by `\r\n`.

The ISA segment is **fixed-width** (105 chars + terminator in 5010) — exploit that to read separators reliably even before you know the segment terminator. Handle three real-world shapes: (a) one segment per line, (b) all segments on one line with no line breaks, (c) segments separated by terminator *and* CRLF. Normalize by splitting on the detected segment terminator and trimming whitespace/newlines from each segment.

Return a `Delimiters` object and never reference a raw `*`/`~`/`:` anywhere else in the codebase.

### 3.2 Tokenizer (`lib/x12/tokenizer.ts`)

Input: raw file text + detected delimiters. Output: a flat array of segments, each:

```ts
interface RawSegment {
  tag: string;           // e.g. "INS", "NM1"
  elements: string[];    // elements[0] is element 01 (NOT the tag)
  components?: string[][]; // sub-elements where present
  index: number;         // ordinal position in file (for error locations)
  raw: string;           // original segment text, for the developer view
}
```

Rules: split file on segment terminator → for each, split on element separator → element 0 is the tag, the rest are elements. Where an element contains the component separator, also split into `components`. Preserve empty trailing elements only up to the last non-empty one. Keep `raw` for the secondary developer view. The tokenizer is transaction-agnostic — it knows nothing about 834. That knowledge lives in the schema.

### 3.3 Envelope & control structure (`lib/x12/envelope.ts`)

Parse the interchange/group/transaction hierarchy and **verify control totals** — this is free, high-signal validation analysts love:

- `ISA` ↔ `IEA`: IEA02 interchange control number must equal ISA13. IEA01 = count of functional groups.
- `GS` ↔ `GE`: GE02 group control number must equal GS06. GE01 = count of transaction sets in the group.
- `ST` ↔ `SE`: SE02 control number must equal ST02. **SE01 = segment count** including ST and SE — compute the actual count and compare.

Produce an `Interchange` tree: `Interchange → FunctionalGroup[] → TransactionSet[]`, each TransactionSet carrying its slice of raw segments. Mismatches become validation findings (Section 6), not crashes.

---

## 4. PHASE 1 — The 834 schema (`lib/schemas/x834.ts`)

Model the 834 005010X220A1 (Benefit Enrollment and Maintenance) loop structure as **data**, so future transaction sets are added as new schema files, not new code paths. Authoring note: write all `label`/`description` strings yourself in plain English — do not copy TR3 text.

### 4.1 Schema type (`lib/schemas/types.ts`)

```ts
interface ElementDef { ref: string; name: string; codes?: Record<string,string>; format?: 'date8'|'date6'|'text'|'num'; }
interface SegmentDef { tag: string; name: string; max?: number; required?: boolean; elements: ElementDef[]; }
interface LoopDef { id: string; name: string; trigger: string; repeat: boolean; segments: SegmentDef[]; loops?: LoopDef[]; }
interface TransactionSchema { code: '834'; version: string; loops: LoopDef[]; header: SegmentDef[]; }
```

### 4.2 834 structure to encode

Header / control:
- `ST` (834), `BGN` — beginning segment, **BGN08 transaction set purpose** (`00`=original, `15`=re-submission, `22`=info copy, `RX`=reverse the prior). Surface this prominently; it tells the analyst what kind of file they're holding.
- `REF*38` master policy, `DTP*007` file effective date, `QTY` control totals (DT=total, ET=eligible, RT=received — compare to actual member count for a validation check).

Sponsor / payer loops:
- **1000A** Sponsor (`N1*P5`), **1000B** Payer (`N1*IN`), **1000C** TPA/Broker (`N1*BO`/`N1*TV`).

**Loop 2000 — Member Level Detail** (the heart; repeats per member):
- `INS` — decode these, they drive everything:
  - INS01 (Y/N): subscriber indicator.
  - **INS02 relationship** — 18=self, 01=spouse, 19=child, 53=life partner, 17=stepchild, etc.
  - **INS03 maintenance type** — 001=change, 021=addition, 024=termination, 025=reinstatement, 030=audit/compare. *This is the single most important field for an analyst — make it a colored badge in the table.*
  - INS04 maintenance reason (e.g., 07=termination of benefits, 41=re-enrollment).
  - INS05 benefit status (A=active, C=COBRA, S=surviving insured, T=tax-equity).
  - INS08 employment status, INS09–10 student/handicap where present.
- `REF*0F` subscriber identifier, `REF*1L` group/policy number, `REF*23` member ID (carrier-assigned).
- `DTP` member-level dates — 356=eligibility begin, 357=eligibility end, 336=employment begin, 337=employment end, 286=retirement, 303=maintenance effective. Decode the qualifier to a readable label; parse `D8` (CCYYMMDD) dates to ISO.

  **Loop 2100A — Member Name** (`NM1*IL`): last/first/middle (NM103–05), member ID (NM108=`34` SSN or `ZZ`, NM109=value).
  - `PER` communication numbers, `N3` street, `N4` city/state/zip, **`DMG`** demographics — DMG02 birth date (D8), DMG03 gender (M/F/U), DMG05 marital/ethnicity where present.
  - 2100B incorrect member name, 2100C member mailing address, 2100D member employer, 2100F custodial parent, 2100G responsible person — model but render compactly.

  **Loop 2200 — Disability Info** (`DSB`, `DTP`) — optional, low priority for v1 table.

  **Loop 2300 — Health Coverage** (repeats per coverage):
  - `HD` — HD01 maintenance type (mirrors INS03 at the coverage level), **HD03 insurance line code** — HLT=health, DEN=dental, VIS=vision, PDG=pharmacy, MM=major medical, etc. HD04 plan coverage description, HD05 coverage level (EMP=employee only, ESP=employee+spouse, FAM=family, ECH=employee+children).
  - `DTP*348`/`349` coverage begin/end, `REF*1L` group, `AMT` premium amounts, `IDC` identification card.

Trailer: `SE`. (GE/IEA handled by the envelope parser.)

Encode each `ElementDef.codes` map using the codelist files in `/lib/codelists` so the same maps power both the readable view and the future SEO reference pages.

---

## 5. PHASE 1 — Readable member view (`lib/transform/member834.ts`) — THE DIFFERENTIATOR

This is the reason the product exists. Transform the parsed 834 AST into a flat, analyst-friendly model and render it as a sortable, filterable table. **Lead with this view; the segment tree is secondary.**

```ts
interface MemberRow {
  subscriberId: string;          // REF*0F
  memberId: string;              // REF*23 / NM109
  lastName: string; firstName: string; middle?: string;
  relationship: string;          // decoded INS02 ("Self", "Spouse", "Child")
  maintenanceType: string;       // decoded INS03 ("Addition","Termination","Change"...)
  maintenanceTypeCode: string;   // raw, for power users
  benefitStatus: string;         // decoded INS05
  dob?: string;                  // ISO
  gender?: string;
  eligibilityBegin?: string;     // DTP*356 ISO
  eligibilityEnd?: string;       // DTP*357 ISO
  coverages: { line: string; level?: string; begin?: string; end?: string }[]; // from 2300 HD/DTP
  address?: { street?: string; city?: string; state?: string; zip?: string };
  sourceSegmentIndices: number[]; // click a row -> highlight raw segments
}
```

Table requirements:
- **Maintenance type as a colored badge** (green=addition, red=termination, amber=change, blue=reinstatement, grey=audit). This is what an analyst scans for first.
- Column-level filters: maintenance type, relationship, coverage line, has-error.
- Global search across name / member ID / subscriber ID.
- Sort by any column.
- Subscriber grouping toggle: collapse dependents under their subscriber.
- Click a row → open a detail drawer showing the decoded fields **and** the raw segments that produced them (`sourceSegmentIndices`). This "show me the bytes behind this row" feature is a trust-builder; analysts will verify it against their own files.
- A "Developer view" tab: the full segment tree with raw segments, loop nesting, and detected delimiters — for the minority who want it.

---

## 6. PHASE 1 — Validation layer (`lib/validate/`)

The validation **voice** is the product's personality: plain-English, specific, actionable — never raw codes. Each finding:

```ts
interface Finding {
  severity: 'error' | 'warning' | 'info';
  message: string;              // plain English, original wording
  segmentIndex?: number;        // jump-to in developer view
  memberRef?: string;           // which member, if applicable
}
```

Phase-1 rule set (`rules834.ts`), all originally worded:
- **Envelope integrity:** control-number mismatches (ISA13/IEA02, GS06/GE02, ST02/SE02), SE01 segment-count mismatch, GE01/IEA01 count mismatch.
- **Structural:** missing required BGN; member loop (2000) with no NM1; HD coverage with no begin date; INS present but no maintenance type.
- **Code sanity:** unknown relationship/maintenance/insurance-line code (flag, don't fail — list it so the analyst sees the unexpected value).
- **Date sanity:** non-`D8` date in a date qualifier; eligibility end before begin; DOB in the future.
- **Control-total cross-check:** QTY DT/eligible vs actual member count parsed.

Free tier shows the **count** of findings and the envelope-level errors. **Full per-member validation report is Pro** — this is one of the upgrade levers.

---

## 7. Performance (`workers/parse.worker.ts`)

- Run tokenize → envelope → transform → validate **inside a Web Worker**. The UI thread only renders. 837I files exceed 50 MB and 200k+ segments; never block the main thread.
- Stream progress back to the UI (`% segments parsed`) for a progress bar.
- Render the member table with **virtualization** — never mount 200k DOM rows.
- Read the file with `File.text()` / `FileReader`; for very large files prefer streaming reads. Cap nothing artificially in free tier for *viewing* — but **batch (multi-file) processing is Pro.**

---

## 8. UI / UX (Phase 1 surface)

Single page = the product. No marketing chrome on the tool itself.
- Big drop zone: "Drop an 834 file here — it never leaves your browser." Reinforce privacy at the point of action.
- After parse: summary bar (file purpose from BGN08, member count, # additions/terminations/changes, # findings), then the member table, then tabs for Developer view and Findings.
- Persistent "🔒 Processed entirely in your browser — nothing was uploaded" indicator with a link to a one-line explanation.
- Empty/error states written in the same plain, calm analyst voice as the validation messages.

---

## 9–11. LATER PHASES — scope only, DO NOT BUILD YET

**Phase (Diff) — the Pro killer feature (`lib/diff/member-diff.ts`):** key members on `REF*0F` + member ID across two 834s; classify each as added / terminated / changed / unchanged; for changed, show field-level before→after. Stub the interface now so the transform model already carries stable keys.

**Phase (Export, Pro):** `to-xlsx.ts` (SheetJS) and `to-csv.ts`, client-side, gated behind a valid license. Export the readable member model, the findings report, and the diff result.

**Phase (837P/837I/835 schemas):** new files under `/lib/schemas` reusing the same `TransactionSchema` shape and transform pattern. 837 = claims (10× the audience of enrollment); prioritize after 834 is solid. 835 = remittance, decode CARC/RARC (freely published) into original plain-English text.

**Phase (Licensing & Pro gate):** Lemon Squeezy license-key validation via one Cloudflare Worker; key in `localStorage`; **no user accounts in v1.** Free vs Pro split: viewing/parsing/envelope-validation free; export, diff, batch, full per-member report = Pro ($19/mo or $190/yr; founding annual $99 locked). MoR handles sales tax. Verify LS new-merchant onboarding is open at build time; Paddle is the fallback.

---

## 12. Synthetic data generator (`tools/gen-834.ts`) — BUILD IN PHASE 1, BEFORE THE PARSER IS "DONE"

You cannot test on real files (Section 1.4). Build a generator that emits **valid, fully fake** 834 files:

- Use `@faker-js/faker` for names, addresses, DOBs, IDs — **fake everything**, no real PII patterns.
- Parameters: member count, mix of maintenance types (additions/terms/changes/audit), dependent ratio, coverage lines, and a `--corrupt` flag that injects deliberate errors (broken control totals, bad dates, unknown codes) to exercise the validator.
- Emit correct envelope math (SE01 counts, control numbers) so "clean" files pass and corrupt files fail predictably.
- Also emit a "v1" and "v2" pair of the same population with deltas, to test the future diff engine.
- These generated files are the **only** fixtures committed to `/fixtures`. Also offer the cleanest ones as **free downloadable sample files** on the site — a lead magnet that doubles as proof the tool works without anyone risking a real file.

---

## 13. Testing

- **Unit:** delimiter detection across the three file shapes; tokenizer round-trips; envelope control-total checks; 834 transform produces correct `MemberRow`s; each validation rule fires on a crafted corrupt fixture and stays silent on a clean one.
- **E2E (Playwright):** load a generated 834 → table renders → filter by "Termination" → open a member drawer → confirm raw segments shown. **Assert zero network requests carry file content.**
- Golden-file tests: generated-input → expected-readable-model JSON.

---

## 14. Phase-1 build order (do in this sequence)

1. Repo + Next.js static export + Tailwind + worker scaffold; deploy an empty page to Cloudflare Pages so the pipeline is proven on day one.
2. **`tools/gen-834.ts`** — generate clean + corrupt fixtures first, so everything downstream has real input.
3. `delimiters.ts` → `tokenizer.ts` → `envelope.ts` with unit tests.
4. `schemas/x834.ts` + `codelists/*` (original wording).
5. `transform/member834.ts` → render the member table (this is the demo-able moment — celebrate it).
6. `validate/engine.ts` + `rules834.ts` → findings tab.
7. Move parse+transform+validate into the Web Worker; add virtualization + progress bar.
8. Polish UI, privacy indicators, empty/error states. Ship the free 834 viewer.

Phase 1 is **done** when an analyst can drop a generated 834, see a colored, filterable member table, open a row to the raw segments, read plain-English findings, and confirm in DevTools that nothing was uploaded.

---

## 15. Guardrail recap (re-read before every commit)

- [ ] No file bytes leave the browser. Verify in Network tab.
- [ ] No TR3 / Washington Publishing / vendor description text copied — all labels original.
- [ ] No real EDI file anywhere in the repo or tests.
- [ ] Delimiters are always detected, never hardcoded.
- [ ] Free tier views fully; Pro gates export/diff/batch/full-report.
- [ ] Heavy parsing is off the main thread; tables are virtualized.

*End of Phase-1 master build prompt. Stop after Section 14 step 8 and ship before touching later phases.*