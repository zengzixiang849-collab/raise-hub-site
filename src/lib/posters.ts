// Poster images live in public/posters/<image>-<width>.webp (exported from the
// real A3 PDFs by scripts/export-posters.py). A missing file fails the build.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const POSTER_WIDTHS = [480, 800, 1200] as const;
export const POSTER_RATIO = 420 / 297; // A3 portrait

export function assertPosterFiles(image: string, owner: string): void {
  for (const w of POSTER_WIDTHS) {
    const file = join(process.cwd(), 'public', 'posters', `${image}-${w}.webp`);
    if (!existsSync(file)) {
      throw new Error(`${owner}: poster file missing: public/posters/${image}-${w}.webp (run scripts/export-posters.py)`);
    }
  }
}
