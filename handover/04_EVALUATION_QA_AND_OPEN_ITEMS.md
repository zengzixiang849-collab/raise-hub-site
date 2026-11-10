# Evaluation, QA, and Open Items

## 1. Verification record — 10 November 2026

**Completed:**

| Check | Result |
|---|---|
| Astro/TypeScript diagnostics | 44 files checked; 0 errors, 0 warnings, 0 hints |
| Static build | 17 pages generated successfully |
| Internal-link check | 669 internal references passed |
| Content/accessibility rules | Passed |
| Interactive test | Workshop filter and poster carousel passed, including no-JavaScript fallback |
| Copy traceability | 237/237 forward checks passed; 0 unsourced reverse checks |
| Git whitespace check | Passed; line-ending warning only |
| GitHub Pages sub-path build | Passed with `/raise-hub-site/` base path |

The automated suite checks structure and defined rules. It does not prove that all content is correct, approved, or effective.

## 2. Browser and responsive review

**Completed during the website iteration:**

- Reviewed representative pages at 320, 375, 768, and 1280 pixel widths.
- Checked for horizontal overflow and corrected narrow-column text failures.
- Checked keyboard navigation and visible focus states.
- Checked workshop filtering, poster navigation, touch/drag interaction, direct poster links, and no-JavaScript workshop visibility.
- Verified that the compact one-page layout remains readable on desktop and stacks into a logical mobile order.

Historical browser-review records in the planning material report eight pages checked at the four widths, six workshop items visible without JavaScript, and 24 keyboard tab stops with visible focus. These are test records, not user-study results.

## 3. Content and brand controls

**Completed:**

- RAISE maroon/gold palette and local Arial-compatible font stack applied.
- Gold is not used as low-contrast body text on a light background.
- Demonstration projects are explicitly described as not deployed.
- Draft and review states are visible and enforced by the release build.
- Website copy is checked against the planning source documents.
- No external font, analytics, or runtime script dependency is required.

## 4. Photograph handling

**Completed for the review build:**

- Authentic workshop photographs selected for the workshop listing.
- Source locations recorded in `PHOTO-SOURCES.md`.
- Responsive WebP variants exported at 480, 800, 1200, and 1600 pixels where available.
- Delivered WebP variants contain no source EXIF/GPS metadata.
- Images were cropped/rotated/tonally adjusted only; people were not generated or altered with AI.

**Needs approval:**

- Confirm consent, identifiable-person risk, and public-release suitability for every image.
- Confirm the approved storage and retention policy for the raw originals.

## 5. Evaluation principles

The website and project records use five evaluation dimensions:

1. Accuracy
2. Bias and fairness
3. Limits and uncertainty
4. Power and public value
5. Responsible-use decision

A platform rating, successful API response, automated test result, or AI self-evaluation must not be treated as proof of educational quality. Project evaluation records require evidence and a named human reviewer.

## 6. Open items

### Needs approval

- Six workshop content records remain in draft state.
- Four demonstration-project records remain in draft state and not deployed.
- Project evaluation records are pending.
- Two project review-note decisions remain to be resolved.
- Founder/leadership wording, dates, contact details, and public calls to action require confirmation.
- Photograph release decisions remain pending.

### In progress

- Detailed Chinese workshop/project coverage.
- Assignment of an evaluation owner and repeatable review schedule.
- Decision on final production hosting and institutional domain.

### Proposed

- Conduct short task-based usability sessions with representative faculty, students, and teaching assistants.
- Define success measures before launch, such as comprehension of purpose, ability to find a relevant workshop, and correct understanding that demonstrations are not deployed products.
- Add a documented content-review interval after launch.

## 7. Release acceptance checklist

Before a formal public release:

- [ ] All required copy approved by Annus.
- [ ] All relevant `reviewStatus` values changed only after approval.
- [ ] All `reviewNotes` and visible pending notes resolved or deliberately retained.
- [ ] Project evaluations reviewed by a named person.
- [ ] Photo permissions recorded.
- [ ] `npm run verify` and `node scripts/check-copy.mjs` pass.
- [ ] `$env:PUBLIC_DRAFT="false"; npm run build` passes.
- [ ] Mobile, desktop, keyboard, no-JavaScript, and link checks repeated on the release build.
- [ ] Final host, contact route, privacy notice, and ownership confirmed.

