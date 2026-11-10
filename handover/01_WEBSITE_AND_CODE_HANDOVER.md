# Website and Code Handover

## 1. Status

**In progress — technically functional review draft.** The site is suitable for content and design review. It is not an approved public release.

Review URL: https://raise-hub-site.vercel.app

## 2. Technical overview

- Framework: Astro 7 static site
- Language/tooling: TypeScript 6, Node.js 22.23.4 or newer
- Output: static HTML, CSS, images, and local JavaScript
- Default language route: `/`
- Chinese entry route: `/zh/`
- Content model: Astro content collections with Zod validation
- Hosting: Vercel review deployment
- Source control: private GitHub repository
- External runtime dependencies: none; fonts, scripts, and assets are served locally

The project uses `src/lib/frontmatter-loader.ts` instead of Astro’s standard glob loader because the development path contains non-ASCII characters. Workshop and project data are stored in Markdown front matter and validated at build time.

## 3. Important directories

| Location | Purpose |
|---|---|
| `src/pages/` | Page routes and the main one-page website |
| `src/components/` | Reusable navigation, workshop, project, and interface components |
| `src/content/workshops/` | One source file per workshop or series |
| `src/content/projects/` | One source file per demonstration project |
| `src/content.config.ts` | Allowed fields and validation rules |
| `src/styles/global.css` | Brand variables, typography, layout, focus, and responsive rules |
| `public/photos/` | Processed metadata-free workshop photo variants |
| `public/posters/` | Processed poster variants used in the carousel |
| `public/brand/` | RAISE brand assets |
| `scripts/` | Verification, copy-traceability, link, interaction, and image-export tools |
| `PHOTO-SOURCES.md` | Internal provenance record for selected website photographs |
| `handover/` | Internship handover reports and status note |

## 4. Local operation

```powershell
npm install
npm run dev
```

The local review site is normally available at `http://localhost:4321`.

Required checks before every commit:

```powershell
npm run verify
node scripts/check-copy.mjs
git diff --check
```

GitHub Pages compatibility check:

```powershell
$env:BASE_PATH="/raise-hub-site/"
npm run build
node scripts/check-links.mjs /raise-hub-site/
Remove-Item Env:BASE_PATH
```

## 5. Editing content

### Add or revise a workshop

1. Record the source and approved wording in the content inventory before changing visible copy.
2. Copy `src/content/workshops/_template.md` and use a lowercase hyphenated filename.
3. Complete the required audience, status, format, summary, source-deck, and related-item fields.
4. Keep `reviewStatus: draft` until Annus approves the entry.
5. If a real photo is used, add the internal source reference, record it in `PHOTO-SOURCES.md`, and run `node scripts/export-selected-photos.mjs`.
6. Restart the development server after changing content collection files.
7. Run all verification commands.

### Add or revise a project

1. Copy `src/content/projects/_template.md`.
2. Complete need, intended users, build, testing, limitations, and status fields.
3. The status must state that the item is **not deployed**.
4. Leave evaluation data absent until it has been reviewed; open decisions belong in `reviewNotes`.
5. Keep `reviewStatus: draft` until formal approval.

### Add a photograph

- Use an authentic event image only; do not generate or alter people with AI.
- Crop, rotate, adjust exposure/white balance if necessary, and export responsive WebP variants.
- The export workflow removes embedded metadata from the delivered WebP files.
- Write useful alternative text that describes the activity, not the identity of participants.
- Public release still requires permission and approval even when faces are not visible.

## 6. Deployment and update workflow

The current Vercel project is `raise-hub-site`. Its local `.vercel` link is ignored by Git and must not be copied into a handover archive.

Recommended update sequence:

1. Make and verify changes locally.
2. Commit and push to the private GitHub repository.
3. Deploy a review build to Vercel using the authenticated project owner’s Vercel account.
4. Confirm the banner and `noindex` remain present for review builds.
5. Obtain Annus’s approval and resolve all review notes.
6. Run `$env:PUBLIC_DRAFT="false"; npm run build`. The build must fail if any unapproved content remains.
7. Only then deploy a formal public version.

GitHub Pages remains technically possible through `BASE_PATH`, but it is not the current host.

## 7. Rollback

- Review the history with `git log --oneline --decorate`.
- The pre-handover website review state is tagged `v1-review-2026-11-10`.
- Prefer creating a new revert commit rather than rewriting shared history.
- Vercel also retains deployment history, but a rollback should be coordinated with the repository state so code and deployment do not diverge.

## 8. Known limitations and open decisions

**Needs approval:**

- All content collection entries remain drafts.
- Project evaluations are pending and must not be inferred from tool output or AI self-assessment.
- Photograph permission and release suitability remain to be confirmed.
- Dates, contact wording, and founder/leadership wording require review.

**In progress:**

- Chinese detailed workshop and project pages are not complete.
- The current online version is discoverability-protected but accessible to anyone who has the link.
- The repository depends on planning and evidence documents supplied in the separate handover package; these are not all part of the website repository.

