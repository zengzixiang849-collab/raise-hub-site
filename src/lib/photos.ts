import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const PHOTO_WIDTHS = [480, 800, 1200, 1600] as const;
export const PHOTO_RATIO = 10 / 16;

export function assertPhotoFiles(image: string, owner: string): void {
  for (const width of PHOTO_WIDTHS) {
    const file = join(process.cwd(), 'public', 'photos', `${image}-${width}.webp`);
    if (!existsSync(file)) {
      throw new Error(`${owner}: photo file missing: public/photos/${image}-${width}.webp (run node scripts/export-selected-photos.mjs)`);
    }
  }
}
