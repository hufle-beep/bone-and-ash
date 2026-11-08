"""Turn red eyes grey (a local edit, v0.11.54): inside each box, a pixel whose red stands out (r > g + 30 and r > b + 30)
becomes the grey of its own brightness, so the ink keeps its shape. Run on the 1280×800 original, before palette.py.
Usage: eyes.py SRC SPEC.json OUT   (SPEC: {"boxes": [[x0, y0, x1, y1], ...]})"""
import sys, json
import numpy as np
from PIL import Image
src, spec, out = sys.argv[1:4]
S = json.load(open(spec))
a = np.asarray(Image.open(src).convert('RGB')).astype(int)
h, w, _ = a.shape
b = a.copy(); n = 0
for x0, y0, x1, y1 in S['boxes']:
    if not (0 <= x0 < x1 <= w and 0 <= y0 < y1 <= h): sys.exit(f'box {x0},{y0},{x1},{y1} is outside the picture')
    p = a[y0:y1, x0:x1]
    red = (p[..., 0] > p[..., 1] + 30) & (p[..., 0] > p[..., 2] + 30)
    grey = (0.3 * p[..., 0] + 0.59 * p[..., 1] + 0.11 * p[..., 2]).astype(int)
    b[y0:y1, x0:x1][red] = np.stack([grey] * 3, -1)[red]
    n += int(red.sum())
Image.fromarray(b.astype('uint8')).save(out)
print('red px turned grey', n)
