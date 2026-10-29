// Content collections for the RAISE Hub site.
// Field definitions mirror planning/content-inventory.md. Every entry starts as
// reviewStatus: draft and only becomes "approved" after Annus has reviewed it.
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { frontmatterLoader } from './lib/frontmatter-loader';

const format = z.enum(['Observe', 'Define', 'Build', 'Test and revise']);
const audience = z.enum(['Faculty', 'Students', 'Freshmen', 'Teaching assistants']);
const review = z.enum(['draft', 'approved']).default('draft');

const workshops = defineCollection({
  // Files starting with "_" (e.g. _template.md) are ignored.
  loader: frontmatterLoader('src/content/workshops'),
  schema: z.object({
    title: z.string(), // exactly as in START_HERE.md
    order: z.number(),
    audience,
    status: z.enum(['delivered', 'upcoming']),
    date: z.string().optional(), // only when confirmed by Annus
    formats: z.array(format),
    summary: z.string(),
    keyIdeas: z.array(z.string()).default([]),
    practise: z.string().optional(),
    leaveWith: z.string().optional(),
    seriesPurpose: z.string().optional(),
    sessions: z
      .array(
        z.object({
          number: z.number(),
          title: z.string(),
          formats: z.array(format),
          keyIdeas: z.array(z.string()),
          leaveWith: z.string(),
        }),
      )
      .optional(),
    relatedProjects: z.array(z.string()).default([]),
    relatedResources: z.array(z.string()).default([]),
    fictionalMaterials: z.boolean().default(true),
    sourceDeck: z.string(), // internal reference, not rendered
    reviewStatus: review,
  }),
});

const projects = defineCollection({
  loader: frontmatterLoader('src/content/projects'),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    need: z.string(),
    intendedUsers: z.string(),
    whatWasBuilt: z.string(),
    howTested: z.string(),
    limitations: z.string(),
    status: z.string(),
    evaluation: z
      .object({
        accuracy: z.string(),
        biasFairness: z.string(),
        limitsUncertainty: z.string(),
        powerPublicValue: z.string(),
        responsibleUseDecision: z.string(),
        reviewedBy: z.string(),
        reviewedOn: z.string(),
      })
      .optional(), // omitted → "Evaluation review pending"
    relatedWorkshops: z.array(z.string()).default([]),
    reviewNotes: z.array(z.string()).default([]), // rendered as ReviewPending
    reviewStatus: review,
  }),
});

export const collections = { workshops, projects };
