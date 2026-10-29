---
title: "Syllabot — syllabus question helper"
order: 1
need: "Students ask the same course-logistics questions repeatedly: deadlines, weights, policies. Faculty and TAs spend time answering them, and students need accurate answers with a clear next step when faculty input is required."
intendedUsers: "Students in a course, prepared and maintained by teaching assistants, with faculty approving the source and the release."
whatWasBuilt: "A CreateAI Builder project grounded in one approved (fictional) course syllabus. It answers from the syllabus, cites the supporting section, corrects false premises, does not invent missing rules or make faculty decisions, and offers permitted help."
howTested: "Evaluation-page questions with expected answers, each read against the syllabus and the five RAISE dimensions. Example: asked about a different course's late policy, it named the course it did have, referred the student to that course's instructor, and cited its source. The review then recorded what that single answer cannot establish. A prompt change turned a general “no outside knowledge” rule into a concrete next step and made every answer end with its source section."
limitations: "One answer supports only a narrow finding, not broad fairness or reliability. The platform score measures expected-answer match, not the wider responsible-use questions."
status: "Workshop demonstration using fictional course materials; not deployed."
relatedWorkshops: [tsa-series]
reviewNotes:
  - "B5 · Optionally add the Syllabot check record (four instruction versions; one missed syllabus fact persisted; conclusion: TSA-internal use only with manual cross-checking) as a worked evaluation example? Internal document — needs approval."
reviewStatus: draft
---
