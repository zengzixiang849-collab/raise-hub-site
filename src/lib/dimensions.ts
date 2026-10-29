// The five RAISE evaluation dimensions — the single source of truth on the site.
// Wording copied exactly from RAISE_Five_Dimensions_Evaluation.docx.
// Do not edit without Annus's approval (only Annus updates that document).
export const DIMENSIONS = [
  {
    name: 'Accuracy',
    question: 'did you test outputs for errors? Where did it get things wrong?',
  },
  {
    name: 'Bias & fairness',
    question: 'who does it work well for, and who might it fail or disadvantage?',
  },
  {
    name: 'Limits & uncertainty',
    question: 'what can this tool not do? When should it not be used?',
  },
  {
    name: 'Power & public value',
    question:
      'who benefits, who bears the cost? Governance implication if a community/public body used it?',
  },
  {
    name: 'Responsible-use decision',
    question:
      'given all the above, should it be used, by whom, under what conditions, or not deployed at all?',
  },
] as const;
