#!/usr/bin/env python3
"""Favicon, Apple touch icon and share (Open Graph) images.

- app/favicon.ico, public/icon.png, public/apple-icon.png: the profile photo,
  cropped tight on the face — a photo reads at 16 px, the binary portrait doesn't.
- public/og-en.png, public/og-it.png (1200x630): the homepage hero — headline on
  the left, the binary portrait in its terminal panel on the right.

    python3 scripts/make_brand_assets.py
"""
import re

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PHOTO = "public/images/profile.jpg"
S = 2  # supersampling for the share images

# ─── Icons ───────────────────────────────────────────────────────────────────
photo = Image.open(PHOTO).convert("RGB")
w, h = photo.size
# face crop: centred a little above the middle, ~half the frame wide
side = int(min(w, h) * 0.62)
cx, cy = w // 2, int(h * 0.43)
face = photo.crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2))


def round_icon(size: int, radius: float) -> Image.Image:
    im = face.resize((size * 4, size * 4), Image.LANCZOS)
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.size[0] - 1, im.size[1] - 1), radius=int(radius * 4), fill=255)
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out.resize((size, size), Image.LANCZOS)


ico = round_icon(256, 128)  # round on browser tabs
ico.save("app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
round_icon(512, 256).save("public/icon.png")
# iOS rounds the corners itself and dislikes transparency: full square
face.resize((180, 180), Image.LANCZOS).save("public/apple-icon.png")

# ─── Share images ────────────────────────────────────────────────────────────
src = open("lib/portrait-data.ts").read()
cols = int(re.search(r"cols:\s*(\d+)", src).group(1))
rows = int(re.search(r"rows:\s*(\d+)", src).group(1))
data = re.search(r'data:\s*"([0-9]+)"', src).group(1)

ONE = (165, 180, 252)  # same colours as <BinaryPortrait>
ZERO = (201, 209, 217)


def hash01(i: int) -> float:
    x = ((i + 1) * 374761393) & 0xFFFFFFFF
    x = ((x ^ (x >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((x ^ (x >> 16)) & 0xFFFFFFFF) / 4294967295


def font(path: str, size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size * S, index=index)


HEAVY = "/System/Library/Fonts/HelveticaNeue.ttc"
MONO = "/System/Library/Fonts/Menlo.ttc"


def share_image(lead: str, word: str, sub: str, status: str, out: str):
    W, H = 1200 * S, 630 * S
    img = Image.new("RGB", (W, H), (5, 6, 9))
    # soft blue glow, like the site's ambient light
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((W * 0.45, -H * 0.3, W * 1.15, H * 0.9), fill=(10, 40, 110))
    gd.ellipse((-W * 0.25, H * 0.45, W * 0.45, H * 1.4), fill=(30, 20, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(160 * S))
    img = Image.fromarray(np.clip(np.asarray(img, np.int16) + np.asarray(glow, np.int16), 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)

    # left: status pill, headline, sub, footer
    x = 72 * S
    f_pill = font(MONO, 17)
    pill = status.upper()
    pw = d.textlength(pill, font=f_pill) + 62 * S
    d.rounded_rectangle((x, 92 * S, x + pw, 136 * S), radius=22 * S, outline=(48, 54, 61), width=2 * S, fill=(13, 17, 23))
    d.ellipse((x + 20 * S, 108 * S, x + 32 * S, 120 * S), fill=(48, 209, 88))
    d.text((x + 44 * S, 104 * S), pill, font=f_pill, fill=(160, 166, 175))

    f_head = font(HEAVY, 116, index=1)  # Helvetica Neue Bold
    d.text((x - 4 * S, 168 * S), lead, font=f_head, fill=(245, 245, 247))
    d.text((x - 4 * S, 290 * S), word, font=f_head, fill=(245, 245, 247))
    # sub, wrapped to the space left of the panel
    f_sub = font(HEAVY, 25)
    line, y = "", 428 * S
    for word_ in sub.split():
        if line and d.textlength(line + " " + word_, font=f_sub) > 560 * S:
            d.text((x, y), line, font=f_sub, fill=(150, 150, 158))
            line, y = word_, y + 34 * S
        else:
            line = (line + " " + word_).strip()
    d.text((x, y), line, font=f_sub, fill=(150, 150, 158))

    # footer: small round photo + name + domain
    av = round_icon(52 * S, 26 * S).convert("RGBA")
    img.paste(av, (x, 520 * S), av)
    d.text((x + 68 * S, 522 * S), "Alessio Sabatino", font=font(HEAVY, 22, index=1), fill=(235, 235, 240))
    d.text((x + 68 * S, 550 * S), "builtwithsabba.com", font=font(MONO, 17), fill=(120, 150, 255))

    # right: terminal panel with the binary portrait
    px0, py0, px1, py1 = 700 * S, 70 * S, 1136 * S, 566 * S
    d.rounded_rectangle((px0, py0, px1, py1), radius=16 * S, fill=(13, 17, 23), outline=(33, 38, 45), width=2 * S)
    d.rounded_rectangle((px0, py0, px1, py0 + 40 * S), radius=16 * S, fill=(22, 27, 34))
    d.rectangle((px0, py0 + 24 * S, px1, py0 + 40 * S), fill=(22, 27, 34))
    for k, c in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]):
        cx0 = px0 + (20 + k * 20) * S
        d.ellipse((cx0, py0 + 14 * S, cx0 + 12 * S, py0 + 26 * S), fill=c)
    tf = font(MONO, 13)
    title = "sabba@builtwithsabba: ~/whoami"
    d.text(((px0 + px1) / 2 - d.textlength(title, font=tf) / 2, py0 + 12 * S), title, font=tf, fill=(110, 118, 129))

    inner_w = (px1 - px0) - 40 * S
    inner_h = (py1 - py0) - 40 * S - 30 * S
    lh = inner_h / rows
    cw = min(lh * 0.62, inner_w / cols)
    lh = cw / 0.62
    ox = (px0 + px1) / 2 - cols * cw / 2
    oy = py0 + 40 * S + 15 * S + (inner_h - rows * lh) / 2
    gf = ImageFont.truetype(MONO, int(cw * 1.45), index=1)  # Menlo Bold
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    for i, ch in enumerate(data):
        level = ord(ch) - 48
        if level < 2:
            continue
        r, c = divmod(i, cols)
        bit = "1" if hash01(i) < level / 10 else "0"
        a = 0.22 + 0.78 * (level / 9) ** 0.6
        col = ONE if bit == "1" else ZERO
        ld.text((ox + c * cw, oy + r * lh), bit, font=gf, fill=(*col, int(255 * a)))
    img = Image.alpha_composite(img.convert("RGBA"), layer)
    img.convert("RGB").resize((1200, 630), Image.LANCZOS).save(out, optimize=True)


share_image("I build", "MVPs.", "From idea to launch in weeks. One person, no agency layers.", "Available for new projects", "public/og-en.png")
share_image("Creo", "MVP.", "Dall'idea al lancio in settimane. Nessun passaggio da agenzia.", "Disponibile per nuovi progetti", "public/og-it.png")
print("ok")
