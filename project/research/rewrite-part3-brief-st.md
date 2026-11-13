# Bone and Ash: the Fable rewrite, part 3 (Ashfall), batch 2: the stomp texts (ST)

You already drafted part 3 (Ashfall's scenes) in /tmp/rw-p3; that draft stands (your notes: project/research/ (then /tmp/rw-p3-info/)notes.md). The
owner (pick CA1) wants one more batch: the **stomp texts** of Ashfall's three fights. The owner plays at Nascent Soul and above, so
these are the fight texts he actually sees in Ashfall.

## What stomp texts are
/home/claude/bone-and-ash/js/story/power.js lines 1–30: when James outclasses a fight, degree 2 ("outclassed") or 3
("roflstomp"), the fight's intro is replaced by `posture(g, degree)` (its last paragraph, James's aside, varies by degree through
`aside(d, deg1, deg2, deg3)`), the win scene's text by `win[2]` or `win[3]`, and degree 3 offers "End it in one move.", whose
result line is `one(g)`. Locals cannot sense James's or Yuki's cultivation and treat him as a mortal (lore.md: they place him by
what they see). James never kills humans. Each `win` text **must keep every story fact of the scene it replaces** (the same
choices follow).

## Where
- Edit only /tmp/rw-p3/js/story/stomp_prologue.js, the entries `wolves`, `thornback` and `arson` (lines 173–224). Nothing else.
- They replace, in /tmp/rw-p3/js/story/ashfall.js (your new text): the `farHunt` intros (wolves, thornback) and `far_won`'s text;
  the `arson` intro and `arson_won`'s text. Read those first, and keep the stomp versions consistent with them (the facts, and
  where it fits, the wording's spirit; a stomp text is not a copy: it tells the same outcome when James is far above the fight).

## The task
1. Rewrite the prose of every string in the three entries (they are all older, last written before v0.11.69). Same rules as your
   part 3 brief (project/research/ (then /tmp/rw-p3-info/)brief.md): hard constraints, voice, tics, no reused five-word runs (your new ashfall.js texts
   included: the stomp `arson.win[2]` today copies the old `arson_won` nearly word for word; make it its own), lengths ±25%.
2. Facts to keep: far_won's gains are shown elsewhere (a beast core and meat or thornback eggs); the hunters receive the kill gravely
   and bow to it, then to James; the thornback's eggs from its nest; the arson: two hired men and Pock-Face (Gao Feng's lackey),
   torches, the house of a widow (Mei Lin's mother), nobody hurt in the house, Pock-Face beaten and in the lane, the mother's
   sentence **word for word**: "You came by night to burn a widow's house. Your ancestors will hear of it from me." (as in your
   arson_won), she goes back to bed, and "Ashfall decides you're theirs" as the closing beat (your arson_won's wording of it);
   James knocks men down, never kills; in `win[3]` Pock-Face's threat that Elder Brother Gao / the Sect will hear of it.
3. **Yuki's forms (the owner's ask: every text for every form):** `yk(g)` and `ykShort(g)` (top of the file) already name her by form
   inside a sentence; keep each `${...}` and make the sentence around it read right for all three (cat: "eleven pounds of white
   cat" / "the cat on your shoulder"; great root-kin; the white-haired woman). In `thornback.win[3]` the new
   `stompForm(g, cat, greatRootKin, human)` has a placeholder "YF TODO thornback 3 human": write the woman's version (the cat's and
   the great root-kin's are the old texts; rewrite those too). Where a text names Yuki in one form only without a switch, make it fit
   all three, or note it. Do not change `yk` or `ykShort` themselves (other fights use them); if one reads wrong, note it.
4. The night's rules for the arson: it happens after bed, at 01:00 (James is woken; his "sleeping clothes" fit); promise nothing
   about the rest of the night.

## Notes
Append a section "## ST (batch 2)" to project/research/ (then /tmp/rw-p3-info/)notes.md: per entry, one line on what you changed; anything you noticed but
didn't fix. Check: `cd /tmp/rw-p3 && node -e "import('./js/story/stomp_prologue.js').then(()=>console.log('loads'))"` prints
"loads", and `grep -n TODO js/story/stomp_prologue.js` prints nothing. Then reply with a 3-line summary.
