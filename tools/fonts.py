#!/usr/bin/env python3
"""v0.11.149 (owner pick FN1): the game's two fonts, trimmed to what it uses, shipped in css/fonts/ (the Android app works
offline in its own type; the browser no longer asks Google Fonts).

    python3 -I tools/fonts.py <google/fonts checkout> [out dir]   rebuild the four .woff files and the two licence texts
    python3 -I tools/fonts.py --report [dir]                      JSON: each .woff's characters, axes and names (tests/fonts.test.mjs)

The source: https://github.com/google/fonts at SOURCE_COMMIT (ofl/literata, ofl/shipporimincho), fetched for example with
    git clone --depth 1 --filter=blob:none --sparse https://github.com/google/fonts gf
    git -C gf sparse-checkout set ofl/literata ofl/shipporimincho
What it makes is what the game asked Google Fonts for until v0.11.149 (index.html): Literata upright, weights 400-600, with
its optical sizes; Literata italic 400 with its optical sizes; Shippori Mincho 600 and 800. Each trimmed to Latin, Latin-1,
the punctuation block, the few symbols the game's text uses, and the seal's 骨 (Shippori only). WOFF (zlib): WOFF2 needs the
brotli package. Both fonts are SIL OFL 1.1 with no Reserved Font Name, so the trimmed files keep their names; every name
record (copyright, licence) is kept in each file, and the OFL text is written beside them.
"""
import json, os, shutil, sys

SOURCE_COMMIT = '2e5fa2e951237b6ae65f705693d12ca76a7f78c8'
# Latin, Latin-1, the punctuation block, and the symbols the game's text uses (± · ½ × ÷ ō − ≈ ≤ ≥ ← → and the like)
UNICODES = 'U+0020-007E,U+00A0-00FF,U+0131,U+014D,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2195,U+2212,U+2248,U+2264-2265,U+FFFD'
BONE = 0x9AA8  # 骨, the seal (Shippori Mincho)
OUT = [  # (output, source, axis limits)
    ('Literata.woff', 'literata/Literata[opsz,wght].ttf', {'wght': (400, 600)}),
    ('Literata-Italic.woff', 'literata/Literata-Italic[opsz,wght].ttf', {'wght': 400}),
    ('ShipporiMincho-SemiBold.woff', 'shipporimincho/ShipporiMincho-SemiBold.ttf', None),
    ('ShipporiMincho-ExtraBold.woff', 'shipporimincho/ShipporiMincho-ExtraBold.ttf', None),
]
LICENCES = [('OFL-Literata.txt', 'literata/OFL.txt'), ('OFL-ShipporiMincho.txt', 'shipporimincho/OFL.txt')]


def unicodes(spec):
    out = []
    for part in spec.split(','):
        a = part[2:]
        if '-' in a:
            x, y = a.split('-'); out += range(int(x, 16), int(y, 16) + 1)
        else:
            out.append(int(a, 16))
    return out


def settle(font):
    """fontTools 4.67 reads a variable font's gvar lazily and loses glyphs once glyf is trimmed: read every glyph's variations first."""
    if 'gvar' in font:
        v, d = font['gvar'].variations, {}
        for g in font.getGlyphOrder():
            try:
                d[g] = v[g]
            except KeyError:
                d[g] = []
        font['gvar'].variations = d


def build(src_root, out_dir):
    from fontTools import subset
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer
    os.makedirs(out_dir, exist_ok=True)
    for name, src, limits in OUT:
        f = TTFont(os.path.join(src_root, 'ofl', src), lazy=False)
        settle(f)
        if limits:
            f = instancer.instantiateVariableFont(f, limits)
            settle(f)
        opts = subset.Options()
        opts.flavor = 'woff'
        opts.layout_features = ['*']
        opts.name_IDs = ['*']
        opts.name_languages = ['*']
        keep = unicodes(UNICODES) + ([BONE] if 'Shippori' in name else [])
        s = subset.Subsetter(opts)
        s.populate(unicodes=keep)
        s.subset(f)
        f.flavor = 'woff'
        f.save(os.path.join(out_dir, name))
        print(f'{name}: {os.path.getsize(os.path.join(out_dir, name)) / 1024:.1f} KB')
    for name, src in LICENCES:
        shutil.copyfile(os.path.join(src_root, 'ofl', src), os.path.join(out_dir, name))


def report(out_dir):
    from fontTools.ttLib import TTFont
    res = {}
    for name, _, _ in OUT:
        p = os.path.join(out_dir, name)
        f = TTFont(p)
        nm = f['name']
        res[name] = {
            'bytes': os.path.getsize(p),
            'flavor': f.flavor,
            'chars': sorted(f.getBestCmap()),
            'axes': {a.axisTag: [a.minValue, a.maxValue] for a in f['fvar'].axes} if 'fvar' in f else {},
            'weight': f['OS/2'].usWeightClass,
            'italic': bool(f['OS/2'].fsSelection & 1),
            'family': nm.getDebugName(1),
            'copyright': nm.getDebugName(0) or '',
            'licence': nm.getDebugName(13) or '',
        }
    print(json.dumps(res))


if __name__ == '__main__':
    a = sys.argv[1:]
    if a and a[0] == '--report':
        report(a[1] if len(a) > 1 else 'css/fonts')
    elif a:
        build(a[0], a[1] if len(a) > 1 else 'css/fonts')
    else:
        print(__doc__)
        sys.exit(2)
