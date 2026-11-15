/**
 * Bone and Ash — the songs (v0.11.183; owner pick SG2; group e's CM, push 3; texts by Fable, rule 10, in songs_texts.js; the
 * owner's notes of 2026-11-13, 2026-11-14 17:41 and 20:39, word for word in `lore.md`).
 *  - PL: thirteen songs, each in one fixed scene (SONG_AT). Its passage is drawn under the scene's text the first time the
 *    player reaches that scene, the way the day's music line is (main.js proseHtml → music.js musicLine), and is the same on
 *    every redraw of that visit.
 *  - ON-S: once a save. The heard songs live in the flag `songs` (a comma list of song keys), kept across every Coil, the whole
 *    game's included (coil.js KEEP_FLAGS). An older save has none heard. No id changes; no gain, time or check.
 *  - DU-A (the owner 2026-11-15 00:30, after the coverage check found 11 of the 65 lines never shown under DU): a song on an
 *    evening screen from 15:00 is its day's music (no line after it that day); one in the morning, by day or on a screen with
 *    no music line leaves that evening its line.
 *  - ED: the songs, singers and the musical only through slots (SONG_REFS, with MUSIC_REFS); `{YUKI}` is the one line Yuki
 *    says, through the bond in her cat forms and aloud as a human.
 *  - FC (checked by search, 2026-11-14): "The Eater's Call" of the owner's note is "The Water's Call"; "Athelstan" is
 *    Aethelstan; "Breathe" is the song from *In the Heights* as Ironmouse sings it on stream. The notes hold 13 songs.
 */
import { yukiForm } from '../core/game.js';
import { fillRefs } from '../core/edition.js';
import { SONG_TEXTS, SONG_REFS } from './songs_texts.js';
import { MUSIC_REFS } from './music_texts.js';

export { SONG_TEXTS, SONG_REFS };
/** The scene each song plays in (PL). */
export const SONG_AT = {
    night: 'reflect', fo_elder_named: 'hammerdeep', fo_depart: 'genesis', bl_camp: 'boof_pack', dw_enter: 'waters_call',
    ah_enter: 'lyfjaberg', ape_lured: 'trollabundin', heart_view: 'music_box', heart_hall: 'durin', ship_wreck: 'mumei_song',
    rt_camp: 'non_fiction', rt_arrive: 'breathe', rt_elder: 'dwarven_forge',
};
export const SONG_FLAG = 'songs';
/** Every slot a song can use: the songs' own, then the music lines' (gura, mumei_artist, …). */
export const ALL_REFS = { ...MUSIC_REFS, ...SONG_REFS };
/** The songs this save has heard (ON-S). */
export const heardSongs = (g) => new Set(String(g.flags?.[SONG_FLAG] || '').split(',').filter((k) => SONG_TEXTS[k]));
export function markHeard(g, key) {
    const h = heardSongs(g);
    h.add(key);
    g.flags[SONG_FLAG] = [...h].join(',');
}
/** The song's passage for this save (Yuki's line by her form), in edition `ed` (default: the phone's). */
export function songText(g, key, ed) {
    const s = SONG_TEXTS[key];
    let t = s.text;
    if (s.yuki) t = t.replace('{YUKI}', yukiForm(g) === 'human' ? s.yuki.aloud : s.yuki.bond);
    return ed ? fillRefs(t, ALL_REFS, ed) : fillRefs(t, ALL_REFS);
}
/** The song due on this screen, or null: its key when the scene has one and this save has not heard it. */
export const songDue = (g, id) => { const k = SONG_AT[id]; return k && !heardSongs(g).has(k) ? k : null; };
