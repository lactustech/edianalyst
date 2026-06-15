# EDIAnalyst

Turn unreadable healthcare EDI files into clean, exportable tables for business
analysts. Drop in an **834** (Benefit Enrollment and Maintenance) file and get a
member-level table in seconds, with plain-English validation.

**The defining principle: files are parsed entirely in the browser and never
transmitted to any server.** Open the Network tab, parse a file, and you'll see
zero upload requests. That's the privacy story and the reason there's no HIPAA
hosting burden.

This repository is **Phase 1** of the [master build prompt](./MASTER-PROMPT.MD):
the free 834 viewer, working end to end on synthetic files.

## What works today

- **Client-side X12 parser** — delimiter auto-detection, a transaction-agnostic
  tokenizer, and an ISA→IEA envelope parser that verifies control totals.
- **Readable 834 member table** — one row per member, with the maintenance type
  (addition / termination / change…) as a colored badge. Search, filter, sort,
  group by subscriber, and click any row to see *the raw segments behind it*.
- **Plain-English validation** — envelope integrity, structural checks, code and
  date sanity, and a control-total cross-check, all originally worded.
- **Developer view** — detected delimiters plus the full, virtualized segment
  stream for the minority who want the bytes.
- **Off-main-thread parsing** — a Web Worker runs parse → transform → validate so
  the UI never blocks; the member table and segment list are virtualized.

## Project layout

```
app/                 Next.js routes (the viewer IS the home page)
components/          React UI + the worker hook
lib/
  x12/               delimiters, tokenizer, envelope (transaction-agnostic)
  schemas/           the 834 structure modeled as data
  codelists/         originally-authored plain-English label maps
  transform/         AST -> readable member model (the differentiator)
  validate/          rule engine + 834 rules -> plain-English findings
  diff/              member-diff INTERFACE only (later phase)
  util/              D8 date parsing
workers/             parse.worker.ts (runs the pipeline off-thread)
tools/gen-834.ts     synthetic 834 generator — the ONLY source of fixtures
fixtures/            generated clean / corrupt / v1 / v2 files (safe to commit)
public/samples/      downloadable synthetic samples (lead magnets)
tests/               vitest unit + golden-fixture tests
```

## Commands

```bash
npm install
npm run dev          # local dev server
npm run build        # static export to ./out (output: 'export')
npm test             # vitest — parser, transform, rules, fixtures
npm run typecheck
npm run gen:834      # regenerate the synthetic fixture set
npm run gen:834 -- --members 100 --corrupt   # one-off file to stdout
```

## Deploy (Cloudflare Pages)

The app is a static export (`output: 'export'` → `out/`), so Pages just serves
static files — no server runtime. [public/_headers](public/_headers) ships a
strict CSP whose `connect-src 'self'` enforces the privacy promise at the browser
level: the page literally cannot send a file anywhere.

**Option A — Git integration (recommended, auto-deploys on push):** in the
Cloudflare dashboard, create a Pages project from the `lactustech/edianalyst`
repo with build command `npx next build` and output directory `out`.

**Option B — CLI:**

```bash
npx wrangler login            # one-time browser auth
npm run deploy                # next build && wrangler pages deploy (uses wrangler.toml)
```

**Option C — CI / token:** set `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`
and run `npm run deploy` (no browser needed).

## Guardrails (spec §15)

- No file bytes leave the browser — parsing is local, the worker has no `fetch`.
- No TR3 / Washington Publishing text is copied; every label is original wording.
- No real EDI files anywhere — all fixtures come from `tools/gen-834.ts`.
- Delimiters are always detected from the ISA, never hardcoded.

## Member diff (Pro)

The **Compare** tab diffs the open file against an earlier 834: members are keyed
on subscriber + member id and classified as added / removed / changed / unchanged,
with field-level before→after for every change. The earlier file is parsed in its
own Web Worker; nothing is uploaded. Marked **Pro** in the UI — the actual license
gate arrives with the licensing phase.

## Export (Pro)

The **Export** menu downloads the readable tables — CSV (the primary table) or a
multi-sheet **Excel** workbook (every table plus findings; service-line and
error-detail sheets where they apply). The diff has its own export. Everything is
generated client-side ([lib/export/](lib/export/)); SheetJS is code-split and
loaded only on first use, so no bytes leave the device. Marked **Pro** in the UI —
the license gate arrives with the licensing phase.

## Not built yet (later phases, scoped in the master prompt)

The Lemon Squeezy **Pro gate** (license key in `localStorage`, validated through a
single Cloudflare Worker) that will actually gate Export, Compare, and batch.
