"""Turn the portrait's bare arms into black sleeves with a thin white rim (a local edit, v0.11.50).
The arm is the bright region connected to a seed point inside each arm, bounded by the ink outline, inside a loose limit polygon.
Usage: sleeves.py SRC SPEC.json OUT"""
import sys, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
src, spec, out = sys.argv[1:4]
S = json.load(open(spec))
im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(int)
lim = Image.new('L', im.size, 0); d = ImageDraw.Draw(lim)
for p in S['limits']: d.polygon([tuple(x) for x in p], fill=255)
bright = (a.mean(-1) > S.get('thr', 120)) & (np.asarray(lim) > 0)
lab, n = ndimage.label(bright)
arm = np.zeros(bright.shape, bool)
h, w = bright.shape
for x, y in S['seeds']:
    # v0.11.50 cold review: a seed outside the picture or on a dark pixel (label 0) would select the whole background
    if not (0 <= x < w and 0 <= y < h) or lab[y, x] == 0: sys.exit(f'seed {x},{y} is not on a bright pixel inside the limits')
    arm |= lab == lab[y, x]
arm = ndimage.binary_closing(arm, iterations=2)
core = ndimage.binary_erosion(arm, iterations=S.get('rim', 3))
b = a.copy(); b[core] = [17, 16, 16]
Image.fromarray(b.astype('uint8')).save(out)
print('arm px', int(arm.sum()), 'core px', int(core.sum()))
