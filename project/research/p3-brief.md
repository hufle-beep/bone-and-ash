# Bone and Ash, v0.11.230 drafts (owner pick P3-2: FT + SF)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p3/packet-ft.txt` (the context packet for far_hunt, far_won, village_night) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals (the hunters, the villagers) overly serious; Mei Lin looser; Ya blunt. Second person ("you" = James). James has a bottomless hammerspace (an inventory with no limit), so he never needs several trips or "loads". Yuki has three forms: the cat (speaks only through the bond, italics `*like this*`), the great root-kin (a tiger-sized white cat, also bond only), the woman (speaks aloud). Where a text names Yuki's look or her speech, give all three forms.

Context the packet doesn't show: on the long calendar (the game's default now) the prologue's stay at Ashfall runs about 40 days, so the hunt past the oak hollow and the quiet night in the herb loft come back many times. Each list below plays in order, one text per day the scene shows, then round again; a text already read folds to its FIRST SENTENCE with a "Read it all again" link. So: every text must have at least two sentences, and its first sentence must work alone as a reminder of the scene.

## FT, the four one-paragraph scenes in threes

1. `far_hunt` (the text when the hunt finds its quarry; three kinds, picked at random): each kind gets a 3rd text. The bull's two texts are now one sentence each and so can't fold: REWRITE both as two sentences (keep their images: twice the size of the camp's one, the hedge of sharpened spines; big as a hay cart, spines like a rack of spears, standing square in the path). Write: `far_hunt:wolves:3`, `far_hunt:bull:1` (rewrite), `far_hunt:bull:2` (rewrite), `far_hunt:bull:3`, `far_hunt:deer:3`. Each 1 paragraph, 2–3 sentences. The 3rd text is a later day: the quarry is familiar now. Don't decide the fight's outcome (the player picks Fight / Back off; the deer gets a dart or is let go).
2. `far_won` (after a won fight, wolves or the thornback bull; one text for both kinds, no kind named unless you name both neutrally): a 3rd text. Also REWRITE the 1st (`far_won:1`, now "It comes back to Ashfall a piece at a time. The hunters take each load from you…"): the hammerspace means no loads and no pieces; keep the hunters' bow to the kill and then, with equal gravity, to him (the 2nd text, kept, has the hunters meeting him at the oak hollow and the eldest's finger-width nod: don't reuse those). 1 paragraph each, 2–4 sentences.
3. `village_night` (the quiet night in Mei Lin's herb loft, before "Sleep."): now one text by form (in the packet). Write a 2nd and 3rd, each by form: `village_night:2:cat`, `:2:root-kin`, `:2:woman`, same for `:3`. 1 paragraph, 2–3 sentences, no event (nothing happens; it is a night that ends in sleep, between about 21:00 and midnight). Keep the forms' shared sentences the same where the form doesn't matter.

## SF, the small fixes

a. `stomp_prologue` won-fight texts (degree 2: James outclasses the beasts; the hunters then honour the kill). Rewrite ONLY the second paragraph of each, removing "in loads" / "every load" / "each load" (hammerspace: he carries everything in one go, or only shoulders it for show):
   - `stomp:wolves:2:1` now: "Ashfall gets the rest in loads. The hunters accept every load in silence and give it the bow owed to an enemy who fell well. Afterwards, no less solemnly, they bow to you."
   - `stomp:thornback:2:1` now: "The core comes out small and murky. You bring the rest to Ashfall in loads, and two eggs out of its nest with the last of them. The hunters meet each load without speaking and bow over it as over an enemy fallen with honour; then, just as gravely, to you." (keep the core sentence and the two eggs)
   - `stomp:thornback:2:2` now: "It goes as far as the oak hollow in loads, with two eggs from the nest riding on the last. The hunters are there already, unsent for, and they lift the weight off you by seniority. Not a word. The eldest looks along the bull, then at you, and tips his head a finger's width. You take it for promotion, and nobody corrects you." (keep the rest; only the first sentence's loads)
   Don't make all three the same bow; they sit next to your far_won texts.

b. The Blackroot drill replies (James practises darts or needles at the Ashen Hills camp with Mei Lin and Ya; Act 1). On days when Ya has walked off offended (she's away from camp; Mei Lin is there), the lines that name Ya need a version without her. Write one replacement each, same idea, Mei Lin or nobody instead of Ya, one or two sentences, same length:
   - `bl_train:1:3` "Farther again. Ya goes and stands by the mark to make it interesting. You make it interesting for her." (a dart success)
   - `bl_train:1:5` "From so far back that Ya has to walk out and report. She comes back slower than she went, which is the report." (a dart success)
   - `bl_train:2:3` "Slow enough to hear each one arrive. Ya watches for a hundred breaths, announces that nothing is happening, and stays to watch more of it. Mei Lin studies Ya studying you, and would deny it." (a needle success)
   - `bl_train:1:f:1` "Past thirty paces the darts start holding opinions of their own. The mark stands through all of them, and Ya counts the misses aloud until she runs out of fingers." (a dart failure)
   Don't mention that Ya is gone (the screen says so elsewhere); just don't have her there. Avoid Mei Lin's lines already in this set: picking a small mark "to be awkward", asking whether a needle would take a thread, "almost peaceful", "darned with worse", "whatever is standing behind the mark".

c. Yuki's daily scene, woman form only: two lines use "sits down beside you", a tic. Replace just that phrase with a different action that fits (one or two words to a clause), the rest unchanged:
   - `yuki_time:camp:3:woman` "You are sorting grey bracket fungi by gill spacing when Yuki sits down beside you, takes one, and holds it up. …"
   - `yuki_time:heart_hub:1:woman` "Yuki walks the hall with one hand trailing along the grown wood, as she'd walk a corridor at home, and sits down beside you in the dust. …"

## Output

Write `/tmp/p3/drafts.txt`: one draft per line, `key | text`, paragraphs (only if a text has more than one) separated by ` ¶ `. For c, give the whole changed sentence only. Then, under a line `# notes`, at most a few short notes (suggestions only). Avoid the canon card's tics and any phrase the packet's texts already use; don't reuse a five-word run from another draft. No song lyrics, no real names. Keep it British spelling as the game does.
