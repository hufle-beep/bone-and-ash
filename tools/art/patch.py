"""Local patch step (v0.11.62, the second round of small fixes): build one picture from its source and the
inpaints made on that same source, plus plain copies of nearby pixels. Run on the 1280x800 originals, before palette.py.
Usage: patch.py SRC SPEC.json OUT --dir DIR   (DIR holds each layer's PNG and each mask's PNG, as ComfyUI and masks.py wrote them)
SPEC: {"layers": [{"file": "f5_x_s2_00001_", "mask": "f5_x"}, ...],
       "copies": [{"from": [x, y], "to": [x0, y0, x1, y1], "feather": 6}, ...],
       "discs": [{"center": [x, y], "r": 25, "fill": 250, "outline": 120, "width": 2}, ...],
       "lines": [{"from": [x, y], "to": [x, y], "width": 7, "fill": 85, "outline": 20}, ...],
       "figures": [{"poly": [[x, y], ...]} or {"ellipse": [x0, y0, x1, y1]}, "fill": 200 or [r, g, b], "outline": 20, "width": 2}, ...],
       "shutters": [{"box": [x0, y0, x1, y1], "fill": 78, "line": 28, "step": 6}, ...],
       "tails": [{"limits": [[[x, y], ...]], "seeds": [[x, y], ...], "thr": 40, "grow": 3, "rim": 3}, ...]}
 - a layer pastes an inpaint's result through its (already blurred) mask: out = out * (1 - m) + layer * m.
   Each inpaint ran on SRC itself and only changed its own mask, so the layers commute when the masks don't overlap.
 - a copy takes the same-sized block whose top-left corner is "from" and pastes it over "to", its edges faded over
   "feather" pixels (to cover a stray object with the wall or ground right beside it).
 - a disc paints a plain round moon: grey level "fill" inside radius r, a ring of grey "outline" "width" px wide
   at its edge, both antialiased over one pixel.
 - a line draws a straight stick (a spear shaft): grey "fill", "width" px wide, with a 1 px dark "outline", antialiased.
 - a figure paints a flat shape (a polygon or an ellipse) in one grey or colour with a dark outline: the rough
   layout a later inpaint at partial denoise turns into a drawn figure (v0.11.63: the people drawn small, push 5b).
 - a shutter covers a glass window with a closed shutter of dark wooden boards: grey "fill", a darker line every
   "step" px and a 2 px dark border, its edge softened over one pixel.
 - a tail turns a black cat tail white: the dark pixels (grey below "thr") connected to the seeds inside the limit
   polygons, grown by "grow" px (inside the limits), become white with a black rim "rim" px wide."""
import sys, json, pathlib
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

args = sys.argv[1:]
if len(args) != 5 or args[3] != '--dir': sys.exit(__doc__)
src, spec, out, _, d = args
d = pathlib.Path(d)
S = json.load(open(spec))
a = np.asarray(Image.open(src).convert('RGB')).astype(float)
h, w, _ = a.shape
for L in S.get('layers', []):
    lay = np.asarray(Image.open(d / f"{L['file']}.png").convert('RGB')).astype(float)
    m = np.asarray(Image.open(d / f"{L['mask']}.png").convert('L')).astype(float)[..., None] / 255
    if lay.shape != a.shape or m.shape[:2] != a.shape[:2]: sys.exit(f"layer {L['file']} or mask {L['mask']} is not {w}x{h}")
    a = a * (1 - m) + lay * m
for C in S.get('copies', []):
    fx, fy = C['from']; x0, y0, x1, y1 = C['to']; f = C.get('feather', 6)
    bw, bh = x1 - x0, y1 - y0
    if not (0 <= x0 < x1 <= w and 0 <= y0 < y1 <= h and 0 <= fx and fx + bw <= w and 0 <= fy and fy + bh <= h):
        sys.exit(f'copy {C} is outside the picture')
    blk = a[fy:fy + bh, fx:fx + bw].copy()
    yy, xx = np.mgrid[0:bh, 0:bw]
    edge = np.minimum(np.minimum(xx, bw - 1 - xx), np.minimum(yy, bh - 1 - yy)).astype(float)
    al = np.clip(edge / max(f, 1), 0, 1)[..., None] if f else np.ones((bh, bw, 1))
    a[y0:y1, x0:x1] = a[y0:y1, x0:x1] * (1 - al) + blk * al
for D in S.get('discs', []):
    cx, cy = D['center']; r = D['r']; wd = D.get('width', 2)
    if not (r <= cx <= w - r and r <= cy <= h - r): sys.exit(f'disc {D} is outside the picture')
    yy, xx = np.mgrid[0:h, 0:w]
    dist = np.hypot(xx - cx, yy - cy)
    inside = np.clip(r - dist + 0.5, 0, 1)[..., None]
    ring = (np.clip(r - dist + 0.5, 0, 1) * np.clip(dist - (r - wd) + 0.5, 0, 1))[..., None]
    a = a * (1 - inside) + D.get('fill', 250) * inside
    a = a * (1 - ring) + D.get('outline', 120) * ring
for Ln in S.get('lines', []):
    (fx, fy), (tx, ty) = Ln['from'], Ln['to']
    if not all(0 <= v <= lim for v, lim in ((fx, w), (tx, w), (fy, h), (ty, h))): sys.exit(f'line {Ln} is outside the picture')
    k = 4; wd = Ln.get('width', 7)
    def stroke(width):
        im = Image.new('L', (w * k, h * k), 0)
        ImageDraw.Draw(im).line([(fx * k, fy * k), (tx * k, ty * k)], fill=255, width=int(width * k))
        return np.asarray(im.resize((w, h), Image.LANCZOS)).astype(float)[..., None] / 255
    outer, inner = stroke(wd), stroke(max(wd - 2, 1))
    a = a * (1 - outer) + Ln.get('outline', 20) * outer
    a = a * (1 - inner) + Ln.get('fill', 85) * inner
for F in S.get('figures', []):
    k = 4
    def shape(grow):
        im = Image.new('L', (w * k, h * k), 0); dr = ImageDraw.Draw(im)
        if 'poly' in F:
            pts = [(x * k, y * k) for x, y in F['poly']]
            if not all(0 <= x <= w * k and 0 <= y <= h * k for x, y in pts): sys.exit(f'figure {F} is outside the picture')
            dr.polygon(pts, fill=255)
            if grow: dr.line(pts + [pts[0]], fill=255, width=int(grow * 2 * k), joint='curve')
        else:
            x0, y0, x1, y1 = F['ellipse']
            if not (0 <= x0 < x1 <= w and 0 <= y0 < y1 <= h): sys.exit(f'figure {F} is outside the picture')
            dr.ellipse([x0 * k - grow * k, y0 * k - grow * k, x1 * k + grow * k, y1 * k + grow * k], fill=255)
        return np.asarray(im.resize((w, h), Image.LANCZOS)).astype(float)[..., None] / 255
    wd = F.get('width', 2)
    outer, inner = shape(wd), shape(0)
    fill = np.array(F.get('fill', 200), dtype=float).reshape(-1)[:3] if isinstance(F.get('fill', 200), list) else float(F.get('fill', 200))
    if wd: a = a * (1 - outer) + F.get('outline', 20) * outer
    a = a * (1 - inner) + fill * inner
for B in S.get('shutters', []):
    x0, y0, x1, y1 = B['box']
    if not (0 <= x0 < x1 <= w and 0 <= y0 < y1 <= h): sys.exit(f'shutter {B} is outside the picture')
    blk = np.full((y1 - y0, x1 - x0), float(B.get('fill', 78)))
    blk[:, ::B.get('step', 6)] = B.get('line', 28)
    blk[:2, :] = blk[-2:, :] = B.get('line', 28); blk[:, :2] = blk[:, -2:] = B.get('line', 28)
    m = np.zeros((h, w)); m[y0:y1, x0:x1] = 1
    m = ndimage.gaussian_filter(m, 0.6)[..., None]
    full = a.copy(); full[y0:y1, x0:x1] = blk[..., None]
    a = a * (1 - m) + full * m
for T in S.get('tails', []):
    lim = Image.new('L', (w, h), 0); dr = ImageDraw.Draw(lim)
    for p in T['limits']: dr.polygon([tuple(x) for x in p], fill=255)
    lim = np.asarray(lim) > 0
    dark = (a.mean(-1) < T.get('thr', 40)) & lim
    lab, _ = ndimage.label(dark)
    tail = np.zeros(dark.shape, bool)
    for x, y in T['seeds']:
        if not (0 <= x < w and 0 <= y < h) or lab[y, x] == 0: sys.exit(f'tail seed {x},{y} is not on a dark pixel inside the limits')
        tail |= lab == lab[y, x]
    tail = ndimage.binary_closing(tail, iterations=2)
    if T.get('grow', 0): tail = ndimage.binary_dilation(tail, iterations=T['grow']) & lim
    core = ndimage.binary_erosion(tail, iterations=T.get('rim', 3))
    t = ndimage.gaussian_filter(tail.astype(float), 0.8)[..., None]   # soft edges, as an ink line
    c = ndimage.gaussian_filter(core.astype(float), 0.8)[..., None]
    a = a * (1 - t) + 18 * t
    a = a * (1 - c) + 246 * c
Image.fromarray(np.clip(a + 0.5, 0, 255).astype('uint8')).save(out)
print(', '.join(f'{k} {len(S.get(k, []))}' for k in ('layers', 'copies', 'discs', 'lines', 'figures', 'shutters', 'tails')))
