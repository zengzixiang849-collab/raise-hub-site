// Content collections for the RAISE Hub site.
// Field definitions mirror planning/content-inventory.md. Every entry starts as
// reviewStatus: draft and only becomes "approved" after Annus has reviewed it.
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { frontmatterLoader } from './lib/frontmatter-loader';

const format = z.enum(['Observe', 'Define', 'Build', 'Test and revise']);
const audience = z.enum(['Faculty', 'Students', 'Freshmen', 'Teaching assistants']);
const review = z.enum(['draft', 'approved']).default('draft');
const text = z.string().trim().min(1, 'must not be empty');

const workshops = defineCollection({
  // Files starting with "_" (e.g. _template.md) are ignored.
  loader: frontmatterLoader('src/content/workshops'),
  schema: z.object({
    title: text, // exactly as in START_HERE.md
    order: z.number(),
    audience,
    status: z.enum(['delivered', 'upcoming']),
    date: z.string().optional(), // only when confirmed by Annus
    formats: z.array(format).min(1),
    summary: text,
    keyIdeas: z.array(text).default([]),
    practise: text.optional(),
    leaveWith: text.optional(),
    seriesPurpose: text.optional(),
    sessions: z
      .array(
        z.object({
          number: z.number(),
          title: text,
          formats: z.array(format).min(1),
          keyIdeas: z.array(text),
          leaveWith: text,
        }),
      )
      .optional(),
    relatedProjects: z.array(z.string()).default([]),
    relatedResources: z.array(z.string()).default([]),
    // Real A3 poster, exported to public/posters/<image>-{480,800,1200}.webp.
    // `alt` must carry everything the poster says (title, audience, tool, date, place, what to bring).
    poster: z.object({ image: text, alt: text }).optional(),
    // Authentic workshop photograph exported to public/photos/<image>-<width>.webp.
    // `source` records the internal original; it is not rendered on the public site.
    photo: z.object({ image: text, alt: text, source: text }).optional(),
    fictionalMaterials: z.boolean().default(true),
    sourceDeck: z.string(), // internal reference, not rendered
    reviewStatus: review,
  }),
});

const projects = defineCollection({
  loader: frontmatterLoader('src/content/projects'),
  schema: z.object({
    title: text,
    order: z.number(),
    need: text,
    intendedUsers: text,
    whatWasBuilt: text,
    howTested: text,
    limitations: text,
    // CLAUDE.md §3.4: every project status must say "not deployed".
    status: text.refine((s) => /\bnot deployed\b/.test(s), {
      message: 'status must state "not deployed" (CLAUDE.md §3.4)',
    }),
    // Shown only when reviewStatus is "approved"; otherwise "Evaluation review pending".
    evaluation: z
      .object({
        accuracy: text,
        biasFairness: text,
        limitsUncertainty: text,
        powerPublicValue: text,
        responsibleUseDecision: text,
        reviewedBy: text,
        reviewedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'reviewedOn must be a date like 2026-11-02'),
      })
      .optional(),
    relatedWorkshops: z.array(z.string()).default([]),
    reviewNotes: z.array(z.string()).default([]), // rendered as ReviewPending
    reviewStatus: review,
  }),
});

export const collections = { workshops, projects };
