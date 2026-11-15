# Bone and Ash — history, part 25

Started 2026-11-15 (v0.11.190), when `history-24.md` would have passed 20 KB with this move (owner pick U1, MD: history parts start at 20 KB, so a push uploads less). Older parts: `history-24.md` … `history.md`.

## Moved from the handover in v0.11.190 (word for word)

### Decided in chat

- **v0.11.187: the update check (U1) (the layout confirmed at about 15:11; the owner 15:12 "Go"):** **Found (read only):** the panel's second button said "Up to date" after all four failure kinds (403, 429, offline, 404) and kept an older success's label; the limited line always said "in an hour"; GitHub sends `X-RateLimit-Reset` (and `Retry-After` on a 429), both CORS-exposed; MainActivity's `shouldOverrideUrlLoading` already opens every outside link in the phone's browser, so the browser link needs no Java change. **U1 🟢 UB + RT + DL (recommended; every failed check still has a way on) / U2 🟡 UB + RT / U3 🔴 UB. Picked: U1.** No cold review (rule 9: not game logic, balance or story text). **Found while building:** the FAQ test's two button checks read `main.js` only; the label moved to `update.js` (`goLabel`), so they read both (no FAQ text changed).

### Version notes

## v0.11.187 — The update check (U1)

- **Files:** `js/core/update.js` (`resetAt`, `clock`, `goLabel`, `offerBrowser`; `st.failed` 'limited' / 'none' / 'offline', kept from a check at start too, cleared by one that works; `UPDATE_TEXT.limitedAt`, `.browser`; a failed Check now redraws Settings; `h.now` optional), `js/main.js` (the label from `goLabel`, the `a.updbrowser` link to `APK_URL` under `offerBrowser`), `js/core/news.js`, `sw.js` (VERSION), `tests/update.test.mjs`, `tests/faq.test.mjs`, `tools/browser.py`, `tests/README.md`, the docs.
- **What:** see the version line. No save field, key or id changed; the switches and `boneash.update` as before.
- **Checks:** a game change (rule 2): the full check after the build (exit 0, 363 s): 146 compared, 0 drifted, 4 log-only moves (mire_serpent inc random −5.9, guardian inc random +6.6, palisade_wolf story random +5.5, guardian story random −8.1; bot noise, nothing in play changed); the models unchanged (Careful 3.17 / 3.32, Completionist 3.31 / 3.51, Cultivator 2.82 / 3.04, Sociable 3.17 / 3.55). The first run stopped on the FAQ test (above). Browser part 2: the app page with a faked 403 and a reset 23 min on: "Not checked yet" → "Couldn't check", the time and "(in 23 min)", the link.
- **Tests:** `tests/update.test.mjs` F 39 cases (18 new: the labels, a found build kept, the reset from each header and its fallbacks, the link after 403 / 429 / no network and not after 404 or a success, a failure at start kept quietly), D (the import, the label, the link; MainActivity's outside links), 37 mutants (13 new) all caught.
