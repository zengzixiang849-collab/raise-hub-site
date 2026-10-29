---
title: "Canvas Page workflow: draft → check → publish"
order: 4
need: "Students often scan rather than read closely, so key information such as deadlines, requirements and late policy gets lost in walls of text. The content is fine; the format fails."
intendedUsers: "Faculty and staff preparing Canvas pages."
whatWasBuilt: "A reusable prompt-based workflow, not a bot. A starter prompt turns the instructor's own text into Canvas-safe, accessible HTML. The instructor verifies every date and requirement, then publishes. Prompts and final HTML are saved for reuse."
howTested: "A worked audit compares each draft against the original. In the staged example the reply deadline had moved by a week, delivered with the same confidence as everything correct. The Accuracy check caught it, which triggered “correct and recheck the complete page”. If errors are widespread, the draft is discarded."
limitations: "Safe only for content the instructor already knows and can verify fully. Canvas strips scripts and complex layouts. Announcements can notify students immediately, so practise on an unpublished page."
status: "Workshop demonstration; not deployed. A workflow for faculty to apply to their own pages."
relatedWorkshops: [canvas-page-students-read]
reviewNotes:
  - "B4 · Status wording, since this workflow uses faculty's own text rather than fictional course materials."
reviewStatus: draft
---
