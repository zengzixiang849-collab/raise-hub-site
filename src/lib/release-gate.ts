// Release gate: a public build (PUBLIC_DRAFT=false) must fail while any content
// is unapproved. In draft mode (the default) this does nothing.
// Approval is recorded by Annus's decision → set reviewStatus: approved in the
// entry and clear its reviewNotes. Open ReviewPending notes on a page also block
// a public build (see components/ReviewPending.astro).
import { getCollection } from 'astro:content';
import { IS_DRAFT } from './site';

let result: Promise<void> | null = null;

export function assertReleasable(): Promise<void> {
  if (IS_DRAFT) return Promise.resolve();
  result ??= (async () => {
    const problems: string[] = [];
    for (const entry of await getCollection('workshops')) {
      if (entry.data.reviewStatus !== 'approved') {
        problems.push(`src/content/workshops/${entry.id}.md: reviewStatus is "${entry.data.reviewStatus}"`);
      }
    }
    for (const entry of await getCollection('projects')) {
      if (entry.data.reviewStatus !== 'approved') {
        problems.push(`src/content/projects/${entry.id}.md: reviewStatus is "${entry.data.reviewStatus}"`);
      }
      if (entry.data.reviewNotes.length > 0) {
        problems.push(`src/content/projects/${entry.id}.md: ${entry.data.reviewNotes.length} open reviewNotes`);
      }
    }
    if (problems.length) {
      throw new Error(
        `Public build blocked (PUBLIC_DRAFT=false): content has not been approved by Annus.\n- ${problems.join('\n- ')}\n` +
          'Record his decision, set reviewStatus: approved, clear reviewNotes — or build in draft mode.',
      );
    }
  })();
  return result;
}
