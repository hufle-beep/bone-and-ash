"""v0.11.24: draw the repair masks of tools/art/recipes.json (white = repaint, blurred edges) as PNGs.
v0.11.63: a mask can also be a stored 1-bit PNG in tools/art/masks/ ('bitmap'), for the masks cut from a layout's outline.
Usage: python3 -I tools/art/masks.py OUT_DIR"""
import sys, json, pathlib
from PIL import Image, ImageDraw, ImageFilter

out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
recipes = json.loads((pathlib.Path(__file__).parent / 'recipes.json').read_text())
for name, m in recipes['masks'].items():
    im = Image.new('L', tuple(m['size']), 0)
    d = ImageDraw.Draw(im)
    for p in m.get('polys', []): d.polygon([tuple(x) for x in p], fill=255)
    for p in m.get('holes', []): d.polygon([tuple(x) for x in p], fill=0)
    for e in m.get('ellipses', []): d.ellipse(tuple(e), fill=255)  # v0.11.49 (Y3)
    if 'bitmap' in m:  # v0.11.63: a stored 1-bit mask (tools/art/masks/), scaled up (nearest) and blurred by 'gauss'
        im = Image.open(pathlib.Path(__file__).parent / 'masks' / m['bitmap']).convert('L').resize(tuple(m['size']), Image.NEAREST)
        im = im.filter(ImageFilter.GaussianBlur(m['gauss']))
    if m['blur']: im = im.filter(ImageFilter.GaussianBlur(m['blur'] / 2))
    im.convert('RGB').save(out / f'{name}.png')
    print(name, m['size'])
