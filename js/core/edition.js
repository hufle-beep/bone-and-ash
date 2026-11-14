/**
 * Bone and Ash — the editions (v0.11.182; owner picks CB1, DF1; group e's CM, push 2; the owner 2026-11-13 22:58, word for word
 * in `lore.md`: "a personalized one with all the music references, and a sanitized one with only general references. The only
 * difference should be the texts and references, the framework should stay the same").
 *  - ES: one setting, kept per phone (Settings → References), like Show checks: 'general' (the default, DF1) or 'named'. It is
 *    not in the save: a save plays the same in either edition, and the bots, the checks and the balance never read it.
 *  - ET: a text names a real band, artist, song, book or game only through a slot, `{ref:id}`; `fillRefs` puts in the named
 *    phrase or the general one (a description with no proper name) from a table (music_texts.js `MUSIC_REFS`).
 *  - EK: the text lint and the story test read both editions; the general one may show no name from the table.
 */
export const EDITIONS = ['general', 'named'];
export const EDITION_KEY = 'boneash.edition'; // per phone (main.js); a new key, no save field
let edition = 'general'; // DF1: the general edition unless the phone's setting says otherwise

export const getEdition = () => edition;
/** Set the edition; anything but 'named' is the general edition. Returns the edition set. */
export function setEdition(e) { edition = e === 'named' ? 'named' : 'general'; return edition; }

export const SLOT = /\{ref:([a-z0-9_]+)\}/g;
/** The text with every slot filled from `refs` ({ id: { named, general } }) for edition `ed`. An unknown id throws (a test catches it). */
export function fillRefs(text, refs, ed = edition) {
    return String(text).replace(SLOT, (m, id) => {
        const r = refs[id];
        if (!r) throw new Error(`No reference ${id}`);
        return ed === 'named' ? r.named : r.general;
    });
}
