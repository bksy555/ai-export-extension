#!/usr/bin/env python3
"""Generate Gumroad cover image for AI Export Assistant (1600x900)."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

W, H = 1600, 900
BG = (15, 23, 42)      # dark navy
ACCENT = (99, 102, 241)  # indigo
ACCENT2 = (52, 211, 153) # emerald
WHITE = (255, 255, 255)
GRAY = (148, 163, 184)
LIGHT = (226, 232, 240)

FONT_EN_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_EN = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_CN = "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"

def load_font(path, size):
    return ImageFont.truetype(path, size)

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# ---------- background decor: soft gradient blobs ----------
blob = Image.new("RGB", (W, H), BG)
bd = ImageDraw.Draw(blob)
bd.ellipse([-300, -250, 700, 400], fill=(30, 41, 82, 255))       # big dark-blue blob
bd.ellipse([1050, 450, 1750, 1100], fill=(30, 41, 82, 255))
bd.ellipse([1250, -180, 1750, 350], fill=(49, 46, 129, 255))     # indigo glow
bd.ellipse([-150, 550, 350, 1000], fill=(49, 46, 129, 255))
blob = blob.filter(ImageFilter.GaussianBlur(120))
img = Image.blend(img, blob, 0.85)
draw = ImageDraw.Draw(img)

# subtle grid dots (top-left area)
for x in range(60, 700, 70):
    for y in range(60, 400, 70):
        draw.ellipse([x-2, y-2, x+2, y+2], fill=(51, 65, 85))

# ---------- fonts ----------
f_title = load_font(FONT_EN_BOLD, 88)
f_sub   = load_font(FONT_EN, 42)
f_cn    = load_font(FONT_CN, 40)
f_tag   = load_font(FONT_EN_BOLD, 32)
f_small = load_font(FONT_EN, 28)
f_plat  = load_font(FONT_EN_BOLD, 30)
f_foot  = load_font(FONT_CN, 26)

# ---------- top-left: logo ----------
icon = Image.open("/run/csi/mount-root/nas/4079184d856ecc166ed19d4887083405/workspaces/default/ai-export-extension/icons/icon128.png").convert("RGBA")
icon = icon.resize((110, 110), Image.LANCZOS)
img.paste(icon, (70, 60), icon)
draw.text((205, 80), "AI Export Assistant", font=f_tag, fill=WHITE)
draw.text((205, 122), "Chrome Extension", font=f_small, fill=GRAY)

# ---------- headline ----------
draw.text((70, 230), "Export AI Conversations", font=f_title, fill=WHITE)
draw.text((70, 340), "in One Click", font=f_title, fill=ACCENT2)
draw.text((70, 470), "ChatGPT  ·  Claude  ·  DeepSeek  ·  Gemini  ·  and 6+ more", font=f_sub, fill=LIGHT)

# ---------- feature bullets ----------
bullets = [
    ("Markdown", "  .md"),
    ("Word", "  .doc"),
    ("PDF", "  print-ready"),
]
bx = 70
by = 590
for name, ext in bullets:
    # rounded chip
    chip_w = 210
    draw.rounded_rectangle([bx, by, bx+chip_w, by+74], radius=37, fill=(30, 41, 82, 255), outline=(71, 85, 105))
    draw.text((bx+42, by+16), name, font=f_tag, fill=WHITE)
    draw.text((bx+42+len(name)*24+20, by+22), ext, font=f_plat, fill=ACCENT)
    bx += chip_w + 30

# ---------- platform chips (right side) ----------
platforms = ["ChatGPT", "Claude", "DeepSeek", "Gemini", "Perplexity", "Kimi"]
px0, py0 = 1060, 240
for i, name in enumerate(platforms):
    col = i % 2
    row = i // 2
    cw = 210
    x = px0 + col * 230
    y = py0 + row * 92
    draw.rounded_rectangle([x, y, x+cw, y+64], radius=16, fill=(30, 41, 82, 255), outline=(71, 85, 105))
    dot_color = [ACCENT, ACCENT2, (245, 158, 11), (59, 130, 246), (236, 72, 153), (56, 189, 248)][i]
    draw.ellipse([x+22, y+22, x+42, y+42], fill=dot_color)
    draw.text((x+58, y+14), name, font=f_plat, fill=LIGHT)

# "Privacy" badge bottom right
draw.rounded_rectangle([1060, 610, 1420, 690], radius=20, fill=(16, 185, 129, 60), outline=(16, 185, 129))
draw.text((1090, 632), "🔒 100% Local · No Upload", font=f_small, fill=ACCENT2)

# ---------- bottom bar ----------
draw.rounded_rectangle([70, 760, 1530, 826], radius=33, fill=(99, 102, 241), outline=(99, 102, 241))
draw.text((150, 774), "9.9 USD one-time", font=f_tag, fill=WHITE)
draw.text((700, 780), "Unlimited exports · Lifetime updates", font=f_plat, fill=LIGHT)

img.save("/run/csi/mount-root/nas/4079184d856ecc166ed19d4887083405/workspaces/default/ai-export-extension/gumroad-cover.png", dpi=(72, 72))
print("Saved: gumroad-cover.png", img.size)