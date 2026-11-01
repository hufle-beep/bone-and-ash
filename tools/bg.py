# Crops public-domain paintings into 16:10 scene backgrounds and tones them to the game's ink and paper.
# Usage: put the source images where A points, edit the save(...) lines, run: python3 tools/bg.py
from PIL import Image, ImageOps, ImageEnhance, ImageFilter
import numpy as np, sys
A='/mnt/user-data/attachments/33b61dc4-e914-5434-bedf-f244c50fa5b6/'
OUT='/home/claude/james-rpg-test/art/bg/'
PAPER=np.array([236,232,223],float)
def ink(im, keep_red=False, gamma=1.0, contrast=1.15):
    a=np.asarray(im.convert('RGB')).astype(float)
    r,g,b=a[...,0],a[...,1],a[...,2]
    L=0.3*r+0.59*g+0.11*b
    lo,hi=np.percentile(L,1),np.percentile(L,97)
    t=np.clip((L-lo)/(hi-lo),0,1)**gamma
    t=np.clip(0.5+(t-0.5)*contrast,0,1)
    inkc=np.array([35,33,30],float)
    out=inkc+(PAPER-inkc)*t[...,None]
    if keep_red:
        red=np.clip(((r-np.maximum(g,b))-25)/50,0,1)*np.clip((1-t)*1.6,0,1)
        redc=np.array([160,44,44],float)
        out=out*(1-red[...,None]*0.75)+redc*red[...,None]*0.75
    return Image.fromarray(out.clip(0,255).astype('uint8'))
def save(im, name, box, w=1200, pre=None, **kw):
    c=im.crop(box)
    if pre: c=pre(c)
    c=c.resize((w, round(w*10/16)), Image.LANCZOS)
    c=ink(c, **kw).filter(ImageFilter.UnsharpMask(1.2, 60, 2))
    c.save(OUT+name+'.jpg', quality=82, optimize=True, progressive=True)
q=Image.open(A+'2611eaef-image.jpg'); p=Image.open(A+'279214ff-image.jpg'); m=Image.open(A+'faf51a3e-image.jpg')
save(q,'peaks',(55,650,812,1123))
save(q,'cliffs',(55,1150,812,1623))
save(q,'forest',(55,1790,812,2263))
save(p,'pine',(560,14,1400,539))
den=lambda c: c.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(0.6))
save(m,'village',(100,575,575,872), keep_red=True, gamma=0.55, contrast=0.95, pre=den)
save(m,'mountain',(100,150,575,447), keep_red=True, gamma=0.55, contrast=0.95, pre=den)
