# Selected workshop photographs

These files are authentic RAISE Hub workshop photographs selected from the internal `photo-review` library. They are not AI-generated or AI-edited. The export script performs only auto-rotation, crop, resizing and WebP compression, and strips source metadata from the public files.

| Public image | Internal source | Use |
|---|---|---|
| `hero-workshop-*` | `2026.9.18-The second workshop-Pick the Right Job for AI/2026.9.18-7.jpg` | Homepage hero; wide view of students working on laptops |
| `canvas-page-workshop-*` | `2026.9.11-The first workshop-Build a Canvas Page Students Actually Read/2026.9.11-20.jpg` | Faculty workshop feature and detail page |
| `pick-the-right-job-workshop-*` | `2026.9.18-The second workshop-Pick the Right Job for AI/2026.9.18-9.jpg` | Student workshop feature and detail page |

The original files remain outside the website repository. Run `node scripts/export-selected-photos.mjs` from `raise-hub-site/` to recreate the public variants when the internal photo library is available.
