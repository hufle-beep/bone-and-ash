/** Bone and Ash — the credits in Settings (v0.11.285, owner pick G3-A, CR-p). A copy, in the player's words, of `CREDITS.md` and
 *  `art/bg/CREDITS.md`; the tools test checks that every name in those files is here and every name here is there (`names`). */
export const CREDITS = [
    { head: 'Made with AI', lines: ['The game is programmed and written with the help of AI (Claude by Anthropic). The pictures other than the backgrounds are made with AI image tools (ComfyUI).'] },
    { head: 'The rules and the design', lines: ['**Rules Engine C**: the Qi rules, from the author\'s own earlier work.', '**Selene: Tidelocked / The Long Patience**: the tasks and the Coil, the save safety, the tools and tests, from the author\'s own earlier work.'] },
    { head: 'Fonts', lines: ['**Literata** (© 2017 The Literata Project Authors) and **Shippori Mincho** (© 2021 The Shippori Mincho Project Authors), under the **SIL Open Font License 1.1**; trimmed to the characters the game uses, the licence texts beside them.'] },
    { head: 'Paintings (public domain)', lines: [
        '**Dong Qichang**, *Mt. Qingbian*, 1617: the **Cleveland Museum of Art** (Open Access, CC0).',
        '**Wen Zhengming**, *Old Pine Tree*, late 1530s: the **Cleveland Museum of Art** (Open Access, CC0).',
        'Unidentified artist, style of **Yang Sheng**, *Misty Landscape*: **The Metropolitan Museum of Art** (Public Domain).',
    ] },
    { head: 'The Android app', lines: ['**AndroidX WebKit** and **AndroidX Core** (Google, Apache-2.0).'] },
    { head: 'Tools (not in the game)', lines: ['**Playwright** (Apache-2.0), **Node.js** and **Python**, for the tests.'] },
];
/** The bold names in a text (`**name**`), for the tools test. */
export const names = (text) => [...String(text).matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1].trim());
