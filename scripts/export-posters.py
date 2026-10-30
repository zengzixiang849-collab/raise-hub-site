"""Export the real A3 workshop poster PDFs to web images.

Reads the PDFs from the folder above this repository (they are source material
and are not committed) and writes public/posters/<slug>-{480,800,1200}.webp.
No EXIF is written. Run from the RAISE Hub folder (the parent of raise-hub-site):

    python raise-hub-site/scripts/export-posters.py

Needs PyMuPDF (pymupdf) and Pillow. To add a poster: add its PDF here, give it a
slug equal to the workshop's file name, then add `poster:` to that workshop's
front matter (see README).
"""
import os

import pymupdf as fitz
from PIL import Image

SOURCES = {
    'tsa-series': 'TSA_Workshop_Poster_2026-10-21_A3.pdf',
    'ai-learning-assistant': 'StudentCreateAI_Poster_2026-10-23_A3.pdf',
    'using-ai-responsibly-freshmen': 'FreshmanUsingAIResponsibly_Poster_2026-10-26_A3.pdf',
    'ai-course-assistant': 'FacultyCreateAI_Poster_2026-10-26_A3.pdf',
}
OUT = os.path.join('raise-hub-site', 'public', 'posters')
WIDTHS = (480, 800, 1200)
RATIO = 420 / 297  # A3 portrait

os.makedirs(OUT, exist_ok=True)
for slug, pdf in SOURCES.items():
    page = fitz.open(pdf)[0]
    pix = page.get_pixmap(matrix=fitz.Matrix(2.2, 2.2), alpha=False)
    im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    height = round(im.width * RATIO)
    if abs(height - im.height) > 1:  # normalise tiny A3 rounding differences
        im = im.resize((im.width, height), Image.LANCZOS)
    for w in WIDTHS:
        path = os.path.join(OUT, f'{slug}-{w}.webp')
        im.resize((w, round(w * RATIO)), Image.LANCZOS).save(path, 'WEBP', quality=82, method=6)
        print(f'{path}  {os.path.getsize(path) // 1024} KB')
