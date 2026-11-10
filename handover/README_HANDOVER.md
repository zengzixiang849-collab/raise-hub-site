# RAISE Hub — Short Handover and Status Note

**Prepared by:** Zixiang Zeng, Technical Assistant  
**Handover date:** 10 November 2026  
**Review site:** https://raise-hub-site.vercel.app  
**Source repository:** Private GitHub repository `raise-hub-site` (access must be granted by the repository owner)

## Current status

**In progress — review draft, not an approved public release.**

The RAISE Hub website is a working bilingual Astro site with 17 generated pages. It is available on Vercel for review, but it intentionally retains the “Draft for review” notice and `noindex` protection. GitHub is used for private source control, not for public hosting.

## Completed

- Implemented the one-page RAISE Hub narrative, workshop, project, resource, About, and Chinese entry pages.
- Added six workshop records and four demonstration-project records with explicit draft and not-deployed states.
- Added authentic workshop photography to the review build, with responsive metadata-free WebP exports and provenance records.
- Implemented poster-carousel, keyboard, touch, drag, and no-JavaScript fallbacks.
- Added automated checks for TypeScript/Astro diagnostics, internal links, content rules, source traceability, and interactive behaviour.
- Deployed a review build to Vercel and preserved the release approval gate.
- Recorded the AI/API/harness experiments, website workflow, QA evidence, tools, and open items in this handover folder.

## Needs approval or completion

- Annus Azhar’s approval of all website copy, workshop and project entries, dates, contact details, and founder wording.
- Approval and consent review for every photograph before a public release.
- Completion and approval of project evaluations and assignment of an evaluation reviewer.
- Completion of detailed Chinese workshop and project pages if they remain in scope.
- Removal of review notes and change of `reviewStatus` only after approval.
- A successful `PUBLIC_DRAFT=false` build before any formal launch.

## Recommended next steps

1. Review the website using the Vercel link and record decisions in `planning/review-checklist.md` in the handover package.
2. Confirm which photos may be released publicly and replace or remove any image without documented permission.
3. Complete project evaluation records using the five RAISE dimensions.
4. Apply approved edits, run `npm run verify` and `node scripts/check-copy.mjs`, and test the public release gate.
5. Decide whether to keep Vercel as the host or migrate the approved static build to an institutional or GitHub Pages location.

## Security and privacy

No API keys, account credentials, participant responses, raw photographs, chat transcripts, `.vercel` credentials, or local environment files are included. The professor-provided Anthropic API key expired on 7 November 2026 and is not part of this handover. Raw photographs should be transferred separately only through an approved school storage location.

