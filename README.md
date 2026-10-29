# RAISE Hub website

**RAISE Hub — Responsible AI Support in Education** · *Responsible AI for Teaching and Learning*
HNU–ASU Joint International College (HAIC)

Static website built with [Astro](https://astro.build). Version 1 is a **draft for review**: nothing is published until Annus Azhar, Ph.D. has approved it.

---

## Run it on your computer

You need Node.js 22.23 or newer (`node -v` to check).

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

> **Windows note:** if PowerShell says *"running scripts is disabled on this system"*, type `npm.cmd` instead of `npm` (for example `npm.cmd run dev`).

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `SITE_URL` | `http://localhost:4321` | Full site address, used for canonical links |
| `BASE_PATH` | `/` | Sub-path for GitHub Pages, e.g. `/raise-hub/` |
| `PUBLIC_DRAFT` | (unset = draft) | Set to `false` only for the approved public build; otherwise a "Draft for review" banner and review notes are shown |

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

### Add a workshop

1. Copy any file in `src/content/workshops/` and rename it to the new slug (for example `my-new-workshop.md`).
2. Edit the fields. Use `status: upcoming` before the session and `status: delivered` after it.
3. Run `npm run build` and check for errors.
4. Send the change to Annus for review before publishing.

## Rules

The project rules for anyone editing this site, human or AI, are in `../CLAUDE.md` (the same content is in `../AGENTS.md`). In short:

- Use the five evaluation dimensions word for word.
- No attendance, impact or deployment claims.
- No photos, downloads or tool links until they have been approved.
- No external fonts, scripts or trackers.
- Follow the RAISE Brand Guide.

## Deployment

Planned for GitHub Pages, **after Annus approves the content**. Steps are in `../planning/build-playbook.md` ("周一之后：部署").
