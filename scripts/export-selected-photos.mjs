/**
 * Export the selected authentic RAISE Hub workshop photographs.
 *
 * The originals remain in ../photo-review/raw and are never modified. Sharp
 * applies only auto-rotation, a 16:10 crop and WebP compression. Metadata,
 * including EXIF/GPS, is omitted from every output file.
 */
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const widths = [480, 800, 1200, 1600];
const output = resolve('public/photos');
const sources = {
  'hero-workshop': resolve(
    '..',
    'photo-review/raw/2026.9.18-The second workshop-Pick the Right Job for AI/2026.9.18-7.jpg',
  ),
  'canvas-page-workshop': resolve(
    '..',
    'photo-review/raw/2026.9.11-The first workshop-Build a Canvas Page Students Actually Read/2026.9.11-20.jpg',
  ),
  'pick-the-right-job-workshop': resolve(
    '..',
    'photo-review/raw/2026.9.18-The second workshop-Pick the Right Job for AI/2026.9.18-9.jpg',
  ),
  'tsa-series-workshop': resolve(
    '..',
    'photo-review/raw/2026.10.21-The third workshop/2026.10.21-9.jpg',
  ),
  'ai-learning-assistant-workshop': resolve(
    '..',
    'photo-review/converted/2026.10.23/2026.10.23-5.jpg',
  ),
  'responsible-ai-workshop': resolve(
    '..',
    'photo-review/raw/2026.9.18-The second workshop-Pick the Right Job for AI/2026.9.18-6.jpg',
  ),
  'ai-course-assistant-workshop': resolve(
    '..',
    'photo-review/raw/2026.9.11-The first workshop-Build a Canvas Page Students Actually Read/2026.9.11-18.jpg',
  ),
};

await mkdir(output, { recursive: true });

for (const [name, source] of Object.entries(sources)) {
  for (const width of widths) {
    const height = Math.round(width * 10 / 16);
    const destination = resolve(output, `${name}-${width}.webp`);
    await sharp(source)
      .rotate()
      .resize(width, height, { fit: 'cover', position: 'attention' })
      .webp({ quality: 82, effort: 6 })
      .toFile(destination);
    console.log(destination);
  }
}
