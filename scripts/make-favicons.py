"""Generates the favicon set: maroon tile, white "R", gold "AI" raised by 30% of the letter height
(the wordmark's own proportion). Run from the workspace root:  python raise-hub-site/scripts/make-favicons.py"""
from PIL import Image, ImageDraw, ImageFont
import os
OUT = os.path.join("raise-hub-site", "public")
FONT = "C:/Windows/Fonts/arialbd.ttf"
MAROON, WHITE, GOLD = (140, 29, 64), (255, 255, 255), (242, 165, 22)
S = 1024

def render():
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * 0.2), fill=MAROON)
    big = ImageFont.truetype(FONT, 640)
    small = ImageFont.truetype(FONT, 384)
    cap = big.getbbox("R")[3] - big.getbbox("R")[1]
    rw = big.getlength("R"); aw = small.getlength("AI")
    gap = 8
    total = rw + gap + aw
    x = (S - total) / 2
    base = S * 0.5 + cap / 2 + cap * 0.15   # shift down a little: the raised AI adds height on top
    raise_px = cap * 0.30
    d.text((x, base), "R", font=big, fill=WHITE, anchor="ls")
    d.text((x + rw + gap, base - raise_px), "AI", font=small, fill=GOLD, anchor="ls")
    return im

im = render()
im.resize((32, 32), Image.LANCZOS).save(os.path.join(OUT, "favicon-32.png"))
bg = Image.new("RGBA", (S, S), MAROON)  # apple touch icon: full-bleed, OS rounds it
bg.alpha_composite(render().resize((S, S)))
ap = Image.new("RGB", (S, S), MAROON); ap.paste(im, (0, 0), im)
ap.resize((180, 180), Image.LANCZOS).save(os.path.join(OUT, "apple-touch-icon.png"))
im.save(os.path.join(OUT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
im.resize((512, 512), Image.LANCZOS).save(os.path.join("raise-hub-site", ".preview-icon.png"))
print("ok")