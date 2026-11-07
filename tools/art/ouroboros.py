"""Ink an ouroboros tattoo (a ring of scales, the head biting the tail at the top) onto a picture.
Usage: python3 -I ouroboros.py IN.png OUT.png CX CY RX RY ANGLE_DEG [preview.png]"""
import sys, math
from PIL import Image, ImageDraw, ImageFilter, ImageChops

src, out, cx, cy, rx, ry, ang = sys.argv[1], sys.argv[2], *map(float, sys.argv[3:8])
S = 8  # draw large, then shrink (clean anti-aliased ink)
R = int(max(rx, ry) * 2.6)
W = R * 2 * S
ink = Image.new('L', (W, W), 0)
d = ImageDraw.Draw(ink)
C = W / 2
rr = (max(rx, ry)) * S
th = rr * 0.32  # body thickness

def pt(a, r):
    return (C + math.cos(a) * r, C + math.sin(a) * r)

# body: a ring from just after the head (top) all the way round to the tail tip, tapering at the tail
start, end = -math.pi / 2 + 0.42, -math.pi / 2 + 2 * math.pi - 0.18
n = 90
for i in range(n):
    a0 = start + (end - start) * i / n
    a1 = start + (end - start) * (i + 1) / n
    t = i / n
    w = th * (1.0 - 0.75 * max(0, (t - 0.72) / 0.28))  # taper over the last quarter
    poly = [pt(a0, rr - w / 2), pt(a1, rr - w / 2), pt(a1, rr + w / 2), pt(a0, rr + w / 2)]
    d.polygon(poly, fill=255)
# scales: little chevrons cut back into the body, in rows
for i in range(1, n, 2):
    a = start + (end - start) * i / n
    t = i / n
    w = th * (1.0 - 0.75 * max(0, (t - 0.72) / 0.28))
    for k in (-0.22, 0.22):
        r0 = rr + k * w
        p1, p2, p3 = pt(a - 0.03, r0 - w * 0.12), pt(a + 0.012, r0), pt(a - 0.03, r0 + w * 0.12)
        d.line([p1, p2, p3], fill=0, width=max(1, int(w * 0.07)))
# head at the top, jaws open around the tail tip
ha = -math.pi / 2 + 0.3
hx, hy = pt(ha, rr)
dirx, diry = -math.sin(ha), math.cos(ha)  # the ring's direction at the head (counter-clockwise)
dirx, diry = -dirx, -diry  # facing back towards the tail
nx, ny = -diry, dirx
L = th * 1.9
head = [
    (hx - dirx * L * 0.2 + nx * th * 0.62, hy - diry * L * 0.2 + ny * th * 0.62),
    (hx + dirx * L * 0.55 + nx * th * 0.7, hy + diry * L * 0.55 + ny * th * 0.7),
    (hx + dirx * L * 1.05 + nx * th * 0.32, hy + diry * L * 1.05 + ny * th * 0.32),  # upper jaw tip
    (hx + dirx * L * 0.62 + nx * th * 0.02, hy + diry * L * 0.62 + ny * th * 0.02),  # mouth corner
    (hx + dirx * L * 0.98 - nx * th * 0.36, hy + diry * L * 0.98 - ny * th * 0.36),  # lower jaw tip
    (hx + dirx * L * 0.45 - nx * th * 0.62, hy + diry * L * 0.45 - ny * th * 0.62),
    (hx - dirx * L * 0.2 - nx * th * 0.55, hy - diry * L * 0.2 - ny * th * 0.55),
]
d.polygon(head, fill=255)
# a horn / crest and the eye (cut out)
d.polygon([(hx + nx * th * 0.55, hy + ny * th * 0.55), (hx - dirx * L * 0.5 + nx * th * 1.15, hy - diry * L * 0.5 + ny * th * 1.15), (hx + dirx * L * 0.2 + nx * th * 0.6, hy + diry * L * 0.2 + ny * th * 0.6)], fill=255)
ex, ey = hx + dirx * L * 0.45 + nx * th * 0.3, hy + diry * L * 0.45 + ny * th * 0.3
e = th * 0.13
d.ellipse([ex - e, ey - e, ex + e, ey + e], fill=0)

# squash to the forearm's ellipse and rotate along it
ink = ink.resize((int(W * rx / max(rx, ry)), int(W * ry / max(rx, ry))), Image.LANCZOS)
ink = ink.rotate(-ang, resample=Image.BICUBIC, expand=True)
ink = ink.resize((max(1, ink.width // S), max(1, ink.height // S)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.35))
base = Image.open(src).convert('RGB')
layer = Image.new('L', base.size, 0)
layer.paste(ink, (int(cx - ink.width / 2), int(cy - ink.height / 2)))
inkcol = Image.new('RGB', base.size, (28, 26, 30))
blend = Image.composite(inkcol, base, layer.point(lambda v: int(v * 0.92)))
blend.save(out)
if len(sys.argv) > 8:
    blend.crop((int(cx - 140), int(cy - 110), int(cx + 140), int(cy + 110))).resize((560, 440), Image.LANCZOS).save(sys.argv[8])
