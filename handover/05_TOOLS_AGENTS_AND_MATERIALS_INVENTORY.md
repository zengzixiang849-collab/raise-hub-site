# Tools, Agents, and Materials Inventory

## 1. Handling rules

- Repository and ZIP contents must not include credentials, participant responses, raw identifiable photographs, or chat transcripts.
- Blank survey instruments and approved participant materials may be transferred.
- Raw photographs should be transferred separately through an approved school storage service.
- Owners listed below are operational owners or suggested custodians, not legal ownership determinations.

## 2. Digital systems and tools

| Item | Purpose | Location/access | Owner/custodian | Status | Sensitive? | Handover method |
|---|---|---|---|---|---|---|
| RAISE Hub Astro source | Website content, components, styles, checks | Private GitHub `raise-hub-site` | Repository owner / Annus | In progress; review draft | Low, except internal source paths | Private repository + ZIP snapshot |
| Vercel project | Online review deployment | `raise-hub-site.vercel.app` | Current Vercel account owner | Completed for review; not approved production | Deployment credentials are sensitive | Transfer project access separately; no credentials in ZIP |
| Git and GitHub | Version history and private collaboration | Local repository + private remote | Repository owner | Completed | Account credentials sensitive | Invite collaborator by GitHub username |
| Anthropic API | Model calls for experiments | Anthropic Console workspace | Professor/workspace owner | Tested; supplied key expired 7 Nov 2026 | Yes | Do not transfer key; issue a new scoped key if future work is approved |
| Claude Code CLI | Terminal coding harness | Installed locally | Future operator | Explored; direct billing/auth route unresolved | Local auth sensitive | Reinstall/configure under authorised account |
| DeepSeek Harness (DSH) | Desktop API harness | Local desktop application | Future operator | Connection demonstrated; intermittent timeout | API credentials sensitive | Reconfigure with a new authorised key |
| Codex | Code implementation, review, QA, and handover support | User’s Codex environment | User/account owner | Used successfully | Sessions may contain project context | Transfer outputs/reports, not full chats or credentials |
| ASU CreateAI | No-code course-assistant platform and workshop subject | ASU-authorised access | ASU/faculty owner | Workshop use case; deployment status not claimed | Account/course data may be sensitive | Access through ASU account and policy |

## 3. Project documents and materials

| Item | Purpose | Source location | Suggested owner | Status | Sensitive? | Handover method |
|---|---|---|---|---|---|---|
| `experiment-brief.md` | Original experiment goals and scope | Project root | Annus | Existing | Low | ZIP |
| Planning folder | Sitemap, content inventory, copy drafts, build playbook, review records | `planning/` | Annus / next maintainer | In progress | May include internal notes | Selected core files in ZIP |
| Codex review and response | Independent review findings and disposition | `planning/codex-review.md`, `planning/codex-review-response.md` | Next maintainer | Completed review record | Low | ZIP |
| Review checklist | Professor decisions and release gate | `planning/review-checklist.md` | Annus | In progress | Internal decisions | ZIP |
| RAISE five-dimensions framework | Evaluation structure | `RAISE_Five_Dimensions_Evaluation.docx` | Annus | Existing | Low | ZIP |
| Pre/post survey instruments | Blank workshop evaluation forms | `01 TSA Series Pre Survey.pdf`, `02 TSA Series Post Survey.pdf` | Annus | Existing blank instruments | Potentially sensitive when completed | Blank versions only in ZIP; no responses |
| Faculty hand-back worksheet | Session 3 evaluation and hand-back template | TSA participant-materials folder | Faculty lead | Existing template | Low until completed | Blank/template version in ZIP |
| Delivered workshop decks | Evidence and facilitation material | `Delivered Workshops PPT/` | Annus | Delivered materials | Review for internal details | ZIP where permitted |
| TSA participant materials | Study guides, prompt/output records, revision and hand-back templates | `TSA Series - Participant Materials/` | Annus / faculty lead | Existing materials | May become sensitive when completed | Transfer blank/distributable versions only |
| Brand assets | Logos, poster design, visual guidance | Website `public/brand/` and project brand folder | RAISE Hub | Existing | Low | Repository/ZIP |
| Processed website photos | Metadata-free WebP review assets | Website `public/photos/` | RAISE Hub | Completed for review | Faces/context may still identify people | Private repo/ZIP source snapshot; public use needs approval |
| Raw photo library | Original event evidence | `photo-review/` and original photo folders outside repository | Annus / approved school custodian | Existing; not packaged | Yes: identity and metadata | Separate approved school drive only |

## 4. Evaluation records

No completed participant survey-response dataset is included or claimed in this handover. The package includes blank instruments and templates only. Project evaluations shown as pending on the website remain pending until a responsible human reviewer completes and approves them.

## 5. Access actions for the next owner

1. Provide the professor’s GitHub username to the repository owner for private collaborator access.
2. Transfer or invite access to the Vercel project through Vercel’s team/project controls.
3. Store raw photographs in an approved institutional location and document permitted use.
4. If API experiments continue, create a new scoped key under the correct workspace and budget; do not reuse or transmit the expired key.
5. Confirm where editable source decks and participant templates should be maintained as the authoritative copies.

