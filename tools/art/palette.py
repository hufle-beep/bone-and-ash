"""Cut a generated picture to the game's palette (black, white, greys; red kept; gold kept only where asked) and size.
Usage: python3 -I palette.py OUT_DIR [--gold] FILE...  → OUT_DIR/<name>.webp (800×500) and OUT_DIR/<name>.png (preview)."""
import sys, os
import numpy as np
from PIL import Image

args = sys.argv[1:]
out_dir = args.pop(0)
gold = '--gold' in args
files = [a for a in args if a != '--gold']
os.makedirs(out_dir, exist_ok=True)


def to_palette(im, keep_gold):
    a = np.asarray(im.convert('RGB')).astype(float) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    d = np.maximum(mx - mn, 1e-6)
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    is_red = (sat > 0.55) & (mx > 0.3) & ((h < 18) | (h > 340))
    is_gold = keep_gold & (sat > 0.45) & (mx > 0.35) & (h > 30) & (h < 62)
    lo, hi = np.array([17, 16, 16]) / 255, np.array([251, 250, 247]) / 255
    grey = lo + (hi - lo) * lum[..., None]
    red = np.clip(np.array([160, 44, 44]) / 255 * (0.55 + 0.6 * lum[..., None]), 0, 1)
    out = np.where(is_red[..., None], red, np.where(is_gold[..., None], a, grey))
    return Image.fromarray((out * 255).astype('uint8'))


for f in files:
    name = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f)
    w, h = im.size
    ch = int(w * 10 / 16)  # 16:10 crop from the top third, where the faces are
    if ch < h:
        top = min(max(0, int((h - ch) * 0.25)), h - ch)
        im = im.crop((0, top, w, top + ch))
    else:
        cw = int(h * 16 / 10)
        left = (w - cw) // 2
        im = im.crop((left, 0, left + cw, h))
    im = im.resize((800, 500), Image.LANCZOS)
    p = to_palette(im, gold)
    p.save(os.path.join(out_dir, name + '.webp'), 'WEBP', quality=82)
    p.save(os.path.join(out_dir, name + '.png'))
    print(name, os.path.getsize(os.path.join(out_dir, name + '.webp')))
