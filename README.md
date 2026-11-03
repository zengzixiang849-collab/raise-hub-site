# RAISE Hub website

**RAISE Hub — Responsible AI Support in Education** · *Responsible AI for Teaching and Learning*
HNU–ASU Joint International College (HAIC)

Static website built with [Astro](https://astro.build). Version 1 is a **draft for review**: nothing is published until Annus Azhar, Ph.D. has approved it.

---

## Run it on your computer

You need **Node.js 22.23.4 or newer** (`node -v` to check; this matches `engines` in `package.json` and Astro 7's requirement).

```powershell
cd raise-hub-site
npm install        # first time only
npm run dev        # live preview at http://localhost:4321 (Ctrl+C to stop)
```

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Builds the finished site into `dist/` |
| `npm run preview` | Serves the built `dist/` at http://localhost:4321 (use this for demos) |
| `npm run check` | Type-checks pages, components and content |
| `npm run verify` | **Run before every commit.** Type check → build → link check → content/accessibility check → interactive test (rules from `../CLAUDE.md` §6) |
| `node scripts/check-copy.mjs` | After copy changes, both directions: every sentence of the `../planning/` drafts appears verbatim on its page, **and** every sentence on the site is traceable to `../planning/`. Exits non-zero on any miss |
| `npm run check:links` / `npm run check:content` | Run one checker on the current `dist/` (add a base path, e.g. `node scripts/check-links.mjs /raise-hub/`) |

> **Windows note:** if PowerShell says *"running scripts is disabled on this system"*, type `npm.cmd` instead of `npm` (for example `npm.cmd run dev`).

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `SITE_URL` | `http://localhost:4321` | Full site address, used for canonical links |
| `BASE_PATH` | `/` | Sub-path for GitHub Pages, e.g. `/raise-hub/` |
| `PUBLIC_DRAFT` | (unset = draft) | Set to `false` only for the approved public build; otherwise a "Draft for review" banner and review notes are shown. **A public build fails on purpose** while any entry has `reviewStatus: draft`, any project has `reviewNotes`, or any page still shows a "Review pending" note — see "Approval and release" below |

Example — test the GitHub Pages sub-path locally:

```powershell
$env:BASE_PATH="/raise-hub/"; npm run build; npm run preview
```

## Where the content lives

| What | Where |
|---|---|
| Workshops | `src/content/workshops/*.md` (one file per workshop; the TSA series is one file with three sessions) |
| Projects | `src/content/projects/*.md` |
| Field definitions (what each file must contain) | `src/content.config.ts` |
| Home, About, Resources pages | `src/pages/` |
| Colors, fonts, spacing | `src/styles/global.css` |
| Logos and favicon | `public/brand/` |

> Content files are read by a small custom loader (`src/lib/frontmatter-loader.ts`) instead of Astro's built-in `glob()` loader, because `glob()` fails when the project path contains non-ASCII characters (as it does on the current development machine). All content lives in the front matter (between the two `---` lines). Files starting with `_` are templates and are ignored. **While `npm run dev` is running, restart it (Ctrl+C, then `npm run dev`) after editing content files.**

### Before adding anything: where the words come from

All visible text must come from the approved planning documents (`../planning/content-inventory.md`, `../planning/homepage-about-draft.md`, `../planning/sitemap.md`). **Add the new entry to the content inventory first** (with its source, e.g. the deck and page), then copy it into the site word for word. If a decision is still open, add it to `reviewNotes` (projects) or a `ReviewPending` note instead of inventing text. `node scripts/check-copy.mjs` fails if any sentence on the site is not traceable to `planning/`.

### Add a workshop

1. **Copy `src/content/workshops/_template.md`** (not another workshop — that carries over its title, links and status) and rename it to the new slug, e.g. `verify-any-ai-output.md`. The file name becomes the URL: `/workshops/verify-any-ai-output/`. Use lowercase letters, digits and hyphens only.
2. Fill in the fields. Allowed values are checked by the build:
   - `audience`: `Faculty` · `Students` · `Freshmen` · `Teaching assistants`
   - `status`: `upcoming` (not yet held — shown under "Upcoming") or `delivered`
   - `formats`: one or more of `Observe` · `Define` · `Build` · `Test and revise`
   - `relatedProjects`: project file names without `.md` (e.g. `[syllabot]`); `relatedResources`: `decide` · `check` · `choose-a-task` · `instructions` · `before-sharing` · `five-dimensions` · `links`. **A misspelled id stops the build** and lists the valid ones.
   - `fictionalMaterials: true` only if the session used fictional course materials.
   - Optional `photo`: add `image`, descriptive `alt`, and the internal `source` path after selecting an authentic workshop image. The source is not rendered. Record the selection in `PHOTO-SOURCES.md`, then run `node scripts/export-selected-photos.mjs` to create metadata-free WebP variants.
   - `date`: leave it out unless Annus has confirmed it.
   - `reviewStatus: draft` until Annus approves.
3. **Quoting:** put every text value in double quotes. Inside the text, use curly quotes “like this” (straight `"` would end the value). An apostrophe (`'`) is fine.
4. Run `npm run verify`, then `node scripts/check-copy.mjs`, then the sub-path check: `$env:BASE_PATH="/raise-hub/"; npm run build; node scripts/check-links.mjs /raise-hub/`.
5. If `npm run dev` is running, restart it to see the change.
6. Send the change to Annus for review.

Filled example (upcoming session):

```yaml
---
title: "Pick the Right Way to Verify Any AI Output"
order: 7
audience: Faculty
status: upcoming
formats: [Observe, Test and revise]
summary: "One sentence copied from the content inventory."
keyIdeas:
  - "Key idea copied from the content inventory."
relatedProjects: []
relatedResources: [check]
fictionalMaterials: false
sourceDeck: "deck file name (internal reference, not shown)"
reviewStatus: draft
---
```

### Add a project

1. **Copy `src/content/projects/_template.md`** and rename it to the project slug (URL: `/projects/<slug>/`).
2. Fill in all six fields in the fixed order — `need`, `intendedUsers`, `whatWasBuilt`, `howTested`, `limitations`, `status` — none may be empty.
3. **`status` must contain "not deployed"** (the build rejects anything else) and may say "fictional course materials" only when that is true (`../CLAUDE.md` §3.4).
4. `relatedWorkshops`: workshop file names without `.md`; a misspelled id stops the build.
5. Leave `evaluation` **out** until Annus has reviewed it. The page then shows "Evaluation review pending". Even when filled in, the evaluation is only displayed once `reviewStatus: approved`; every field (including `reviewedBy` and a `reviewedOn` date like `2026-11-02`) must be non-empty.
6. Put open questions in `reviewNotes` — they show as "Review pending" in draft mode and **block a public build**.
7. Run the same checks as for a workshop (step 4 above) and send the change to Annus.

## Approval and release

1. Annus records his decisions in `../planning/review-checklist.md`.
2. Apply each decision; then remove the matching `ReviewPending` note or `reviewNotes` entry.
3. Set `reviewStatus: approved` on each approved entry (only after his approval).
4. Build the public version with `$env:PUBLIC_DRAFT="false"; npm run build`. If anything is still unapproved, **the build stops and lists what is open** — this is intentional.

## Rules

The project rules for anyone editing this site, human or AI, are in `../CLAUDE.md` (the same content is in `../AGENTS.md`). In short:

- Use the five evaluation dimensions word for word.
- No attendance, impact or deployment claims.
- The local draft may use selected authentic workshop photos; public release still requires Annus's approval. No AI-generated or AI-edited workshop photos.
- No downloads or tool links until they have been approved.
- No external fonts, scripts or trackers.
- Follow the RAISE Brand Guide.

## Deployment

Planned for GitHub Pages, **after Annus approves the content**. Steps are in `../planning/build-playbook.md` ("周一之后：部署").
