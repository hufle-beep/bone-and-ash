# Bone and Ash, v0.11.236 drafts, run Q (owner pick P9-A: QW, the talks' quiet walk; YW, "your world")

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p9/talk-texts.txt` (the two talk scenes as they stand, as template code), `/tmp/p9/packet-talk_mei.txt` and `/tmp/p9/packet-talk_ya.txt` (the context packets: when the talks show, their choices and what follows) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, and checks who heard: an Ashfall herb girl, 26, raised on propriety and sick of it); Ya (27, a feral huntress raised by wolves and a hunter, spear, barefoot, necklace of teeth, red scar under one eye; jokes and flirts aggressively, easily offended, can't read; calls James "scholar"). Second person ("you" = James, 40, a mycologist from another world). British spelling.

## Part 1: QW, the quiet walk (two new texts)
Act 1, the journey through the Blackroot (the Root Road, the Drowned Wood, the Ashen Hills; any of the three, by day or at dusk). "Talk to Mei Lin." and "Talk to Ya." are offered once a day each. Each talk counts beats: beats 0, 1, 3, 4 are fixed scenes; beat 2 is the **quiet walk** (the text that ends the function: "For a while you walk and neither of you talks…" / "Ya is in a good mood, and Ya's good moods are loud."). From beat 5 a cycle of six runs: beat 5 the quiet walk again, then five settled texts (the array). So players on the long calendar read the quiet walk two and three times. You write a NEW text for beat 5 (and 11, 17…) of each talk; beat 2 keeps the old quiet walk.

Shape: as the settled texts in the array. One main paragraph (60–90 words), then a branch: one paragraph if James and she are close (`likes`), another if not (`not`), 20–40 words each. Ya's may add an optional short line for when both women like him (as her quiet walk does: `both`); leave it empty if nothing fits.

Closeness in the `likes` branch: no more than the settled texts already show (Mei Lin: a hand left on his pocket, her sleeve against his, her fingers straightening his glasses, a finger on his chin, her arm taken for a sore foot, her hand kept after a fallen trunk; Ya: a hip knocked against his, her fingers threaded through his). It must hold whether or not a romance scene has happened. The `not` branch: friendly, a joke, no touch beyond a punch on the arm.

**Ya away (Mei Lin's talk only):** in the Ashen Hills, by day, Ya can be off on her own (offended, out in the haze) while Mei Lin talks with you. Any paragraph of Mei Lin's text that names Ya or has her nearby needs a Ya-away version (key `…:ya`), as `AW.talk_mei` at the top of the file does: the same moment, Ya out in the haze instead. If none of Mei Lin's paragraphs names Ya, write no `:ya` key. (Ya's own talk is not offered while she is away.)

Write (keys):
- `talk_mei:q`, `talk_mei:q:likes`, `talk_mei:q:not` (and `talk_mei:q:ya` / `talk_mei:q:not:ya` where needed).
- `talk_ya:q`, `talk_ya:q:likes`, `talk_ya:q:not`, `talk_ya:q:both` (may be empty).

A new small moment on the road: something said or done while walking, in her character; a quiet one, as befits the slot (the quiet walk is about the ease of not talking). Not a retelling of any moment in `talk-texts.txt` (the herb and the fungus, the humming, the trunk, the bear tale, the root's name, the glasses, the bows, the limp, the noise at the trees, the temple talk, the wolf den, forms, walking too loudly, the mint, and the rest there).

## Part 2: YW, "your world" (two rewordings)
Two village walks (before the journey) open with Mei Lin saying "your world". For some players she has not yet heard that James is from another world. Reword ONLY these two first sentences so they hold either way (she knows he is from very far away; "where you come from" or similar), changing as few words as possible:
- `mei_walk:5:4`: "Mei Lin wants to know whether your world has collectors."
- `mei_walk:6:4`: "\"Tell me the dullest thing about your world,\" Mei Lin says, her arm hooked through yours and the barley gone grey at your elbow."
(Context: collectors = the Sect's men who take tribute; James answers "We have them. They send letters." / he describes a committee.)

## Rules
- **No day counts**, no time words that fix morning or evening (the talks show both), and nothing that needs a particular region's ground (any of the three).
- **The fold:** a text read before shows its first paragraph with the rest folded; the main paragraph must stand alone.
- No romance beyond the level above.

## Don't reuse
"sleeves brush", "under her breath", "hard enough to", "smells of mint", "has ruled", "like a snare", "verdict", "apropos of nothing", "the matter goes unmentioned", "a real one". Avoid the canon card's tics and any phrase the given texts already use; don't reuse a five-word run between drafts. No song lyrics, no real names.

## Output
Write `/tmp/p9/drafts-q.txt`: one draft per line, `key | text`, paragraphs separated by ` ¶ ` (no line breaks inside a draft). Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB).
