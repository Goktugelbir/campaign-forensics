# Campaign Forensics

> See why your launch backfired. With evidence.

A campaign-diagnosis SaaS built for the 10X Your Brand Hackathon (Istanbul, 12 Oct 2026).
The spec — the single source of truth — is [`CAMPAIGN_FORENSICS.md`](CAMPAIGN_FORENSICS.md).

Two layers:

1. **Investigation engine** (Manus task + MCP connectors) writes JSON files:
   `case.json → evidence.json (Apify) → diagnosis.json (Manus) → creative.json + media (fal.ai)`.
2. **Web app** (this Next.js project) only reads `data/cases/<slug>/*.json`. It never calls Apify or fal.ai.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm test` | Unit, component and data-contract tests (Vitest) |
| `npm run typecheck` | TypeScript, including tests |
| `npm run check:links [url]` | Crawls a running server from `/` and fails on any broken internal link |

## Pages

| Route | Page |
|---|---|
| `/` | Landing (hero, problem, how it works, sample report, pricing, FAQ, waitlist) |
| `/cases` | Case list with type/status filters |
| `/cases/[slug]` | Report — Case · Evidence · Diagnosis · Relaunch. Tab lives in the URL: `?tab=evidence#ev_014` |
| `/cases/[slug]/print` | All four tabs on one page; browser "Save as PDF" exports it |
| `/new` | New Case form → "Investigation queued" + downloadable `case.json` draft |
| `/how-it-works`, `/pricing`, `/faq`, `/about`, `/contact` | Product & company |
| `/legal/[page]` | privacy · kvkk (Turkish) · cookies · terms · data-sources · disclaimer · data-request — one `LegalPage` template + `content/legal/*.md` |

Clicking any evidence ID (`ev_014`) switches to the Evidence tab, scrolls to the card and flashes it for 2 s.
A missing step file (no `diagnosis.json` yet) shows that tab as "in progress" instead of crashing; corrupt JSON goes to `error.tsx`.

## Data

```
data/cases/<slug>/case.json · evidence.json · diagnosis.json · creative.json   # contracts: lib/types.ts
data/cases/<slug>/raw/<source>.json                                           # raw Apify output (engine only)
public/cases/<slug>/                                                          # downloaded images / video
```

- `instagram-wordmark-2026` is the **real case**: 70 evidence items collected on 2026-10-12 with the Apify MCP connector (Google Search, Reddit, YouTube, Instagram comments, web-fetch), diagnosis in `diagnosis.json`, creative generated with fal.ai. Raw actor output (usernames removed) and every run ID are in `data/cases/instagram-wordmark-2026/raw/`.
- `demo-mock` is a **fictional brand** (Northwind Coffee) with obviously fake `example.com` URLs, kept for rehearsals; every screen showing it carries a **MOCK DATA** badge. It is hidden from `/cases` (`SHOW_MOCK_CASES = false`) but still reachable at `/cases/demo-mock`.
- `tests/data.test.ts` validates **every** case folder against the contract (6 hypotheses, ≥2 known evidence IDs each, no usernames or profile links, `sources_summary` matches, local media exists, no API keys in `creative.json`). Run `npm test` after each engine step.
- Case pages are pre-rendered from the folders present at build time: **rebuild after adding a case** (unknown slugs return a real 404).

### Switches (`lib/site.ts`)

- `FEATURED_CASE_SLUG` — the case behind the landing previews and "See a sample report" (now `instagram-wordmark-2026`).
- `SHOW_MOCK_CASES` — `false` hides demo-mock from `/cases`.
- `SITE.contactEmail` is a placeholder on the reserved `.example` domain — replace it. Fill in `TEAM` for `/about`.

### Generating creative (step 3)

```bash
node scripts/fal-generate.mjs <slug> <name> <fal-model-id> prompts/<slug>/<name>.json
```

Reads `FAL_KEY` from the environment, uploads local `start_image_url` files, downloads the result to
`public/cases/<slug>/` immediately (fal URLs expire) and logs model, request ID and input to `raw/fal-<name>.json`.
Models used (verified on fal.ai on 2026-10-12): `fal-ai/ideogram/v3` (wordmark + key visual, $0.06 each) and
`fal-ai/kling-video/v3/standard/image-to-video` (multi-shot, audio off, $0.084/s). Kling 2.1 is deprecated on fal.

## Engine commands (Manus)

- `Run step 1 for <slug>` — evidence via Apify (show the source plan first, `maxItems` 50–100 per call, 30–80 items total).
- `Run step 2 for <slug>` — diagnosis, including the generic-diagnosis test.
- `Run step 3 for <slug>` — creative via fal.ai using [`prompts/fal_from_brief.md`](prompts/fal_from_brief.md); 1 image first, max 2 video attempts; download outputs to `public/cases/<slug>/` immediately.
- `Run full investigation for <slug>` — all three with a short summary between steps.

`FAL_KEY` lives only in the engine's environment (see `.env.example`) — never in the repo or the web app.

## Design

Dark "digital forensic case file": black background, `#0e0e0e` cards with 1px `#222` borders, a single amber accent (`#f5a623`),
Instrument Serif headings, Inter body, JetBrains Mono labels. Tokens: `tailwind.config.ts`. Visual reference: `docs/`.
No brand logos, no watermarks, no framework badges.
