# Fable brief: CM push 1, the review's fixes (M2, M3, M4, L3)

You revise your own drafts after an Opus cold review. Read only: this brief, `/tmp/cm/r2/current.json` (the texts as built, keyed as in the game: KL labels, KU stage paragraphs, KD day lines by stage, KR return lines, PA prologue pot lines, PF Fallout pot lines, PCA / PCF the cook scenes), `/tmp/cm/r2/findings.md` (the review's M1–M4 and L3), `/tmp/cm/packet.md` (the screens around them) and `/home/claude/bone-and-ash/project/canon-card.md`. The first brief's rules still hold (`/tmp/cm/brief.md`: tone, lengths, labels never starting with Eat / Cook / Roast or containing "communal pot", pot lines and results ending bare, no music, no Yuki / Mei Lin / Ya in the pot lines and the cook scenes).

## Fix exactly these (the owner picked RV1: a Fable run for them)
- **M2 (PCA.text):** "You have a doctorate in exactly this and, until today, nowhere to put it." is false: James ran a spore print on a bracket fungus on Day 1 and used his fifteen years of mycology in the clinic; and the scene comes back on later Coils (he remembers every one). No time word; keep the beat (his expertise finally among cooks, not patients).
- **M3 (PCA.text, PCA.result if needed):** the mushroom must be real-world plausible: pale gills plus a ring plus "safe once boiled" reads as a death cap, whose toxins survive boiling. Make it a milk cap (Lactarius-like: gills that bleed a white milk when nicked, a peppery smell; boiled, the water thrown out, then fried: how they are eaten in Eastern Europe). Keep "Corpse-ears" and the great-aunt joke. **The prologue's result line must start with its present first words "Barley, beans and corpse-ears" (a test matches them).**
- **M4 (the legal images):** 13 of the 31 texts use courtroom / treaty images (acquittal, jurisdiction, objection, charge sheet, finding, ruling, treaty, boundary stone, border by arrangement, on her own authority, offence, hostage, concede, witness, argument). Keep them for **the mother only, about one in three of her lines at most** (her old texts already have ledger, evidence, magistrate, a seal on a document); give **the village women (PA, PF, PCA, PCF) other images**. Note KR2's "her argument against him" stacks with her return text's "sets a seal on a document": change one of them in KR2. **PF3 must keep its first words exactly `Stew, and a second ladle you did not ask for. "You work,"` and PA1 its `Barley and bean stew. The woman with the ladle has dropped "honoured guest"`** (tests match them).
- **L3 (repeats within a stage):** stage 1 has the thin-slice check three times (KU1, KD1[0], and PCF's last line): re-angle KD1[0]. Stage 3 has the "already done" joke twice (KU3's salt, KD3[0]'s fire): re-angle KD3[0]. "You gather" twice (KU3, KD3[2]): one goes. Ginger is in 6 texts: at most 3.

Change nothing else (other lines word for word). Avoid the canon card's tics and new habits of your own (count your similes).

## Output
`/tmp/cm/r2/revised.json`: the same shape as current.json, every key, with your changes in place. `/tmp/cm/r2/notes.md` (≤ 1 KB): each changed key, one line.


# The revision (run 2, word for word)

```json
{
 "KL": {
  "1": "Help Mei Lin's mother in her kitchen.",
  "2": "Share the kitchen with Mei Lin's mother.",
  "3": "Take over Mei Lin's mother's kitchen."
 },
 "KU": {
  "1": "The cooking comes after. You are given a knife and the ginger, and a look that covers both. You cut it fine. She holds a slice up against the doorway, finds it thin, and says nothing, which in this house is an acquittal. \"You have cooked,\" she says. \"I feed people. It's a habit.\" \"It is a duty,\" she says, correcting the word, and passes you the beans.",
  "2": "Then the hearth, where she has left half the fire unoccupied and does not explain it. You take the half. She does the millet; you do the beans, with ginger and a little dried fish fried in pork fat, which she watches as one watches a pot about to boil over. She tastes from your spoon. \"It is not how it is done,\" she says. She tastes once more, to be certain it is still wrong, and moves her pot over to make room.",
  "3": "Afterwards she sets the stool where it commands the whole hearth, and sits on it. Nothing is announced. You gather that the knife, the pot and the fire are yours, and the jurisdiction is hers. You make millet dumplings with crisped pork belly on top: dödölle, minus the potato, the sour cream and the planet. \"Less salt,\" she says. You have not salted it yet. You add what you intended. She eats two bowls in silence, to be thorough."
 },
 "KD": {
  "1": [
   "In the kitchen you are trusted with the pot, to be scoured with sand. She runs a thumb round the inside, studies the thumb, and hangs the pot up herself, on the proper hook.",
   "You keep her fire while she cooks. She corrects it twice. She begins a third correction, considers the flame, and withdraws it.",
   "She holds out the spoon for you to taste the broth; not for an opinion, for an audience. You say it wants nothing. \"It does not,\" she agrees."
  ],
  "2": [
   "At the hearth you work shoulder to shoulder and do not touch. Her pot, your pan, and the salt between them, which each of you reaches for only when the other has finished with it.",
   "She asks what you put in the beans. You tell her. She repeats it back like a charge sheet, omitting nothing, and then puts dried fish in her own pot, having thought of it herself.",
   "You knead dough at one end of her table; she shells beans at the other and watches your hands. \"Your mother taught you,\" she says. It is not a question, and it counts for you."
  ],
  "3": [
   "A neighbour comes for salt and finds you at the pot and her on the stool. \"He feeds people,\" she says. \"It cannot be helped.\" The neighbour leaves with the salt and the news.",
   "Eggs poached in stewed greens and ginger: shakshuka with everything removed that made it shakshuka. She asks what it is called. \"Eggs,\" you say. She approves of the brevity.",
   "You cook; she eats, upright, both hands on the bowl, and delivers her finding. \"The household has eaten worse.\" From her, this is the top of the scale."
  ]
 },
 "KR": {
  "1": "You eat it. Then you wash the bowl, and hers, and the pot, since nobody stops you; she stands by with a cloth and dries each as you hand it over. The Elder is not mentioned. The bowls are stacked for a household that intends to need them the day after tomorrow.",
  "2": "You eat half and look at the hearth. She follows the look, and moves aside by the width of one pot. You start the beans; she starts the millet. Neither of you mentions the Elder. Two people are cooking in this kitchen, and that is the whole of her answer to him.",
  "3": "You eat it. Then you take the pot off its hook, and she lets you, and sits. You make her the same bowl back, your way: the greens wilted in pork fat, the egg set on top with the yolk still loose. She eats all of it. \"The egg is underdone,\" she says, and holds out the bowl for another."
 },
 "PA": [
  "Barley and bean stew. The woman with the ladle has dropped \"honoured guest\" and says \"sit\" instead, and fills the bowl to the brim, which says the rest",
  "Bean stew, eaten under the red banners. You are served in your turn between two hunters, and nobody at the pot looks up to see who it is"
 ],
 "PF": [
  "Barley and beans. The ladle goes to the bottom of the pot for you, where the pork is, and the woman holding it denies it with her whole face",
  "Bean and barley stew, in the bowl with the chipped rim that is kept for you, on a place at the bench the builders close up only when you leave",
  "Stew, and a second ladle you did not ask for. \"You work,\" the woman says, in the voice kept for funerals, and stands there until the bowl is empty"
 ],
 "PCA": {
  "label": "Join the women at the village pot.",
  "text": "The women at the pot make room for you by not closing ranks, which here is an invitation. There are six of them, the barley, the beans, and a basket of grey-capped mushrooms set well apart, to be burned. \"Corpse-ears,\" says the eldest. \"My grandmother's sister ate one.\" The sentence is evidently complete.\n\nYou turn one over. Pale gills that bleed a white milk where your thumbnail nicks them, and a peppery smell. You have a doctorate in exactly this. It has mostly been asked to cure people. It would rather feed them. \"Boiled once, the water thrown out, then fried,\" you say. \"The poison leaves with the water. Raw, she was right. Your great-aunt skipped a step.\"\n\nNobody answers. You boil them, throw the broth on the ground where they can watch it go, and fry them in pork fat with salt. You eat a spoonful yourself and stand there, alive, for as long as it takes. The eldest counts under her breath. Then she holds out her bowl, at arm's length, and sends a girl for the second basket.",
  "go": "Stay alive. Have a bowl.",
  "result": "Barley, beans and corpse-ears, renamed on the spot by the eldest \"the stranger's mushroom\", though you told her the real name twice"
 },
 "PCF": {
  "label": "Help the women feed the builders.",
  "text": "The pot on the square has a palisade's worth of builders and a line of hunters to answer to, and the women at it are stretching the barley with water, grimly, as one stretches a truth. You ask for the flour instead. It is handed over slowly, by a woman who knows how much is left.\n\nFlour, two eggs, salt, water. You knead it on a scrubbed board until it gives in, roll it out with a pestle, fold it, and cut it into strips with a bone knife. \"Thread,\" says the woman beside you. \"Food,\" you say. \"Hung on a line, it dries and keeps through a winter, and it cooks before a builder has finished complaining.\" She does not agree that builders complain.\n\nThey take it up at once: six women kneading in a row, each one's dough corrected by her neighbour. The noodles go into the broth with dried fish and greens. Mei Lin's mother, at the end of the row, cuts hers finer than yours, and lets you see it.",
  "go": "Take a bowl before the builders do.",
  "result": "Noodles in fish broth, eaten standing among the builders, who hold out their bowls a second time and offer no opinion"
 }
}
```

# r2 notes (14 keys changed; the rest word for word)
- KU2 (M4): boundary stone -> a pot about to boil over; "the offence" -> "it is still wrong".
- KU3 (M4): "formal objection" -> "to be thorough".
- KD1[0] (L3): new angle, scouring the pot; no slices, no ginger.
- KD1[2] (M4): witness -> audience.
- KD2[0] (M4): the border -> the shared salt.
- KD2[1] (M4, ginger): "on her own authority" out; ginger -> dried fish.
- KD3[0] (L3): new angle, a neighbour at the door.
- KD3[2] (L3): "You gather" -> "From her".
- KR2 (M4): argument against -> answer to.
- PA1, PF3 (M4): ruling / finding of fact out; tested first words kept.
- PCA.text (M2, M3, M4): milk cap; doctorate line, no time word; treaty, ginger out.
- PCA.result (M4): "over your objection" out; starts as before; quote stays (M1).
- PCF.text (M4): hostage, concede out; "stops arguing" -> "gives in" (not on the list, same habit).
Mother's legal images: 4 of 15 lines (KU1, KU3, KD2[1], KD3[2]). Ginger: KU1, KU2, KD3[1].
