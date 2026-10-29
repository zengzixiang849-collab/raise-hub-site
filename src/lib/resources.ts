// Resource guides on /resources/ — ids are the page anchors.
// Source: planning/content-inventory.md §C. `workshops` = where each guide comes from.
export const RESOURCES = [
  { id: 'decide', title: 'Decide what to hand AI', workshops: ['using-ai-responsibly-freshmen', 'pick-the-right-job-for-ai'] },
  { id: 'check', title: 'Check an AI answer in four steps', workshops: ['using-ai-responsibly-freshmen'] },
  { id: 'choose-a-task', title: 'Choose a task worth building', workshops: ['tsa-series'] },
  { id: 'instructions', title: 'Four questions for a usable bot instruction', workshops: ['tsa-series'] },
  { id: 'before-sharing', title: 'Before sharing a tool: five checks', workshops: ['ai-course-assistant'] },
  { id: 'five-dimensions', title: 'The five dimensions', workshops: [] },
  { id: 'links', title: 'ASU links', workshops: [] },
] as const;

export type ResourceId = (typeof RESOURCES)[number]['id'];

export const resourceById = (id: string) => RESOURCES.find((r) => r.id === id);
