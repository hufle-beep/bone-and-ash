/**
 * v0.11.182 (owner picks RS1, D1; CM push 2): "Read to Ya" (reading.js). Drafted by Fable (rule 10; Claude's cut: Ya's "tall man" →
 * "scholar", her name for him in the game; "back into the roots" → "back to the roots", a run shared with heart_roots). `{SHIP}`: the ship's sentence by what the party has found; `{LOVER}`: the closing
 * sentence when she is his lover. Real names through the editions' slots (the table in music_texts.js).
 */
export const READ = {
    "label": "Read to Ya from your archive.",
    "text": "You climb to Ya's ledge with the omnitool's pane of light open. Tonight it is {ref:lotr}, you tell her, from the middle, where the trees are. \"We are inside a tree,\" says Ya. That, you explain, is the joke.\n\nYou read her the chapters with {ref:ents} in them: keepers grown to look like what they keep, so old that saying anything quickly is bad manners. You read slowly, in fairness, and tilt the pane so she can watch the letters. She can't read them. She watches anyway, and interrupts. She would not have waited half a day for {ref:treebeard} to finish a greeting. She rules that {ref:entwives} were never lost: they left, and she wants their side of it. Then the council, days of it, and the march, when the slowest people alive decide that they are angry. Ya stops chewing. \"That part again,\" she says. You do.\n\n\"My people grow things that look like them,\" you say. \"Seedlings. Limbs, bark, nobody home, one job each. When the job's done, each goes back to the roots, and the next one starts out knowing what the last one learned.\" {SHIP} \"Now and then one wakes up. We don't cut that out of it. It gets a name and a place at the table. After that you ask, and it can say no.\"\n\n\"You grow a thing to carry water,\" says Ya. \"One day it puts the bucket down. And you feed it anyway.\" By then it's family, you tell her.\n\n\"The Sect grows things too,\" she says. \"Nobody asks them twice.\" She prods your ribs with one bare toe. \"I carry no one's bucket, scholar. I walk with you because I say so. And read slower. That voice is wasted on your face.\"{LOVER}",
    "ship": {
        "notfound": "Every ship your people ever grew has them underfoot, you tell her, mending things.",
        "found": "The ship under this floor grew them too, you tell her, and what they learned is still down there.",
        "named": "Selene grew them too, you tell her, and what they learned is still down in her roots."
    },
    "lover": " Then her head is on your shoulder, and you read on until the trees win.",
    "sleep": "Climb down and sleep."
};
