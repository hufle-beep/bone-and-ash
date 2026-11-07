# Pictures (art/pic) and how to remake them

v0.11.24 (owner picks A, R1, F1, K1, 2026-11-07). The game's art keys show a generated picture when `PICTURES` in `js/art/art.js` lists them; every other key keeps its code art until the last art push.

**Style:** the blended CLAMP (xxxHolic: elongated figures, sleepy almond eyes under heavy lids, hair in long locks, cloud curls, hatching) and Monogatari (flat two-tone, title-card look) prompt; the exact text is in `recipes.json`. Palette after the cut: black, white, greys, red; gold only for Yuki's eyes.

**Where they are made:** the owner's PC, Comfy Desktop (ComfyUI 0.44, port 8188), RTX 3080 10 GB, Z-Image-Turbo bf16 (`z_image_turbo_bf16`, `qwen_3_4b` as lumina2, `ae`), 8 steps, cfg 1, res_multistep / simple, ModelSamplingAuraFlow shift 3, 1280×800, about 10 s a picture. The originals (PNG, about 1.3 MB) stay in ComfyUI's output folder under `boneash/`, with a zip backup there.

| File | What |
|---|---|
| `recipes.json` | Every picture: its steps in order (generate, inpaint, detail inpaint, local edits), prompts, seeds, strengths, masks, the rename and the palette step |
| `workflow.json` | The three ComfyUI API graphs (`generate`, `inpaint`, `detail_inpaint` = crop, scale up, repaint, scale down, paste) |
| `masks.py` | Draws the masks of `recipes.json` as PNGs to upload |
| `palette.py` | Cuts a picture to the palette at 800×500 WebP (`--gold` keeps gold, Yuki only) |
| `ouroboros.py` | Inks James's ouroboros (a ring biting its tail) onto the left forearm |
| `palette_check.py` | The full check's palette step: fails on colours outside the palette, or gold outside Yuki's pictures |

**Remaking or changing a picture:** run its steps from `recipes.json` in ComfyUI (the same seed gives the same picture), then `python3 -I tools/art/palette.py OUT [--gold] LAST.png`, rename to the `art/pic` name, run the full check. A new picture: add its steps here, its key to `PICTURES`, its file to `sw.js` FILES.

**Rules learnt (2026-11-07):** Z-Image-Turbo ignores negative prompts; say everything in the prompt. Don't ask it for "black and white only" in plain anime prompts (posterized results); the style text above works. A leftover reference image in NanoGPT gave pixelated pictures. Small parts (eyes, tattoos) repaint far better as a detail inpaint (crop scaled up 3–4×). The Blood Ravens emblem (Games Workshop) is not drawn; James's raven is his own.
