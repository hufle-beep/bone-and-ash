/* Bone and Ash — offline cache. Bump VERSION on every release so phones pick up the new files. */
const VERSION = 'bone-ash-0.11.58';
/* v0.11.39 (Z2-b): pictures, backgrounds and icons live in their own cache, kept across versions. Its name must not start with
   'bone-ash-' (main.js reads the game's version from that cache's name). Each file is stored under its path plus '?v=' and its
   fingerprint from ART (checked against the bytes before it is stored), and downloaded again only when that fingerprint changes. File names never change: replace a file, then
   run node tools/arthash.mjs --write (tools/consistency.mjs fails while a fingerprint is stale). */
const ART_CACHE = 'boneash-art';
const FILES = [
    './', 'index.html', 'manifest.webmanifest', 'css/style.css',
    'js/main.js', 'js/core/game.js', 'js/core/story.js', 'js/core/tasks.js', 'js/core/coil.js', 'js/core/meditate.js', 'js/core/forms.js', 'js/story/coil_scenes.js', 'js/story/oneoff.js', 'js/story/again.js', 'js/story/task_hubs.js', 'js/story/nodice_tune.js', 'js/core/formulas.js', 'js/story/prologue.js', 'js/story/common.js', 'js/story/wilds.js', 'js/story/ashfall.js', 'js/story/act1_common.js', 'js/story/act1_tune.js', 'js/story/act1_fallout.js', 'js/story/act1_blackroot.js', 'js/story/act1_heart.js', 'js/story/act1_return.js', 'js/story/power.js', 'js/story/fight_tune.js', 'js/story/meridians.js', 'js/story/yuki_path.js', 'js/story/stomp_prologue.js', 'js/story/stomp_act1.js', 'js/story/longforest.js', 'js/art/art.js', 'js/art/portrait.js', 'js/art/figures-clamp.js', 'js/art/clamp2.js',
];
const ART = {
    'art/bg/cliffs.jpg': '67c4b00b31',
    'art/bg/forest.jpg': '69d8dda9d5',
    'art/bg/mountain.jpg': 'ef9c5d2f5e',
    'art/bg/peaks.jpg': '04209ed7b8',
    'art/bg/pine.jpg': '9da50c2600',
    'art/bg/village.jpg': '50ce1392a4',
    'art/pic/a1_end.webp': '23b8fe0d8a',
    'art/pic/arson.webp': '799703cfc5',
    'art/pic/arson_human.webp': '0e5fe3e019',
    'art/pic/arson_tiger.webp': '09fb022d52',
    'art/pic/ashen_hills.webp': '7f7889d8c6',
    'art/pic/ashfall_dawn.webp': 'e65a43ec64',
    'art/pic/boar.webp': '72914ef1d0',
    'art/pic/bone_elk.webp': '087d286e65',
    'art/pic/bone_field.webp': 'f62ad38a6c',
    'art/pic/bone_field_human.webp': 'd1d95d9400',
    'art/pic/bone_field_tiger.webp': 'ad04c32a83',
    'art/pic/bone_needle.webp': '0d04e8d779',
    'art/pic/camp.webp': 'be4c752acb',
    'art/pic/camp_human.webp': 'd73eba024d',
    'art/pic/camp_tiger.webp': '11f196513f',
    'art/pic/cinder_hawks.webp': '50a69e78ed',
    'art/pic/clearing.webp': '73d8b763fc',
    'art/pic/clearing_human.webp': '76840fdd68',
    'art/pic/clearing_tiger.webp': '480dbd0d61',
    'art/pic/collectors.webp': 'fe356fe4e2',
    'art/pic/collectors_down.webp': '5178697b32',
    'art/pic/collectors_human.webp': 'a8a8d90b0d',
    'art/pic/collectors_tiger.webp': '7a1a68098e',
    'art/pic/council.webp': '3291dd9a53',
    'art/pic/crows.webp': '67749dd228',
    'art/pic/crows_human.webp': 'ef79ba88dc',
    'art/pic/crows_tiger.webp': '31f8bb1579',
    'art/pic/dinner.webp': 'ef9c2bbd32',
    'art/pic/dinner_human.webp': 'cdc79d3b0f',
    'art/pic/dinner_tiger.webp': 'de7962b7f9',
    'art/pic/drill.webp': 'f1a70f93c5',
    'art/pic/drill_human.webp': 'de227a544f',
    'art/pic/drill_tiger.webp': '4e84d5f52d',
    'art/pic/drowned_camp.webp': 'daabc3ee0a',
    'art/pic/drowned_dead.webp': '4851d4b7b9',
    'art/pic/drowned_wood.webp': '6dcb62d01a',
    'art/pic/elder.webp': '53dbf280d6',
    'art/pic/elder_duel.webp': '3c82ccb2c8',
    'art/pic/elder_parley.webp': '2995894298',
    'art/pic/envoy.webp': 'fb6421fcbb',
    'art/pic/forage.webp': 'ce70ccd032',
    'art/pic/forage_human.webp': 'dd9cb33ef6',
    'art/pic/forage_tiger.webp': 'db8400f0f9',
    'art/pic/forest_dawn.webp': 'addf110ed6',
    'art/pic/forest_dawn_human.webp': 'e33db41b6b',
    'art/pic/forest_dawn_tiger.webp': '0408e10264',
    'art/pic/forest_night.webp': '2ef7824e3b',
    'art/pic/gao_down.webp': '1e8caa4273',
    'art/pic/gao_down_human.webp': '3d706a4a72',
    'art/pic/gao_down_tiger.webp': 'e8560cc057',
    'art/pic/gao_window.webp': 'ae777469b9',
    'art/pic/gift.webp': '050831e63e',
    'art/pic/gift_human.webp': '877a8e2813',
    'art/pic/gift_tiger.webp': '59af0bd777',
    'art/pic/grove_sprout.webp': '91894c07da',
    'art/pic/guardian.webp': '64fe8bacd1',
    'art/pic/hairpin.webp': '2fe570b45e',
    'art/pic/healer.webp': '8d7f38896d',
    'art/pic/heart_core.webp': '126602b201',
    'art/pic/heart_gate.webp': '18536ad127',
    'art/pic/heart_hall.webp': 'b72e7810ca',
    'art/pic/heart_roots.webp': '2be01fd3c4',
    'art/pic/herb_girl.webp': 'ce8d9e9ded',
    'art/pic/herb_slope.webp': 'dde2ae8ac2',
    'art/pic/herb_slope_human.webp': 'c7f3a6b6a5',
    'art/pic/herb_slope_tiger.webp': 'fa4253bbd8',
    'art/pic/hollow.webp': '9cbe1d04a6',
    'art/pic/hollow_human.webp': 'e2fa7ec894',
    'art/pic/hollow_tiger.webp': '07094c379a',
    'art/pic/hot_spring.webp': '9c00ad7bcc',
    'art/pic/hunt.webp': '6f90df991b',
    'art/pic/hunt_human.webp': 'f7a338a038',
    'art/pic/hunt_tiger.webp': 'c07d54fda3',
    'art/pic/jackals.webp': 'f213327f0d',
    'art/pic/jackals_dead.webp': '2b48523c9b',
    'art/pic/jackals_dead_human.webp': 'ca7ba2c628',
    'art/pic/jackals_dead_tiger.webp': '81cea11235',
    'art/pic/jackals_human.webp': '59bd84feb5',
    'art/pic/jackals_tiger.webp': 'c86e03cf0c',
    'art/pic/james.webp': '89abe5c347',
    'art/pic/james_human.webp': 'bd903fc89f',
    'art/pic/james_tiger.webp': '9d968aca8f',
    'art/pic/lights.webp': '8b5cd8ba1a',
    'art/pic/lights_human.webp': 'd03c536e73',
    'art/pic/lights_tiger.webp': 'b3acb52679',
    'art/pic/lizard.webp': '02a5011f33',
    'art/pic/lizard_human.webp': 'db48e33adb',
    'art/pic/lizard_tiger.webp': '19005520a8',
    'art/pic/meditation.webp': 'ebf656d36a',
    'art/pic/mei_lin.webp': 'ca5cc266bf',
    'art/pic/mire.webp': '429f736cd7',
    'art/pic/mire_human.webp': '6a8c042412',
    'art/pic/mire_serpent.webp': '67af05c340',
    'art/pic/mire_tiger.webp': '81305bc7f9',
    'art/pic/night_watch.webp': '7cc7a6a641',
    'art/pic/omnitool.webp': 'de98e37767',
    'art/pic/omnitool_human.webp': 'bd773661eb',
    'art/pic/omnitool_tiger.webp': '2aabfcea33',
    'art/pic/palisade.webp': '47da60a3a3',
    'art/pic/rain.webp': '1dc30240af',
    'art/pic/rain_human.webp': '5278423e84',
    'art/pic/rain_tiger.webp': '6993cd4c5b',
    'art/pic/rats.webp': 'e88067d3c7',
    'art/pic/rats_human.webp': '25ca1b399d',
    'art/pic/rats_tiger.webp': '43a33192f4',
    'art/pic/return_road.webp': '07397443c8',
    'art/pic/ridge.webp': '8ac3fbe774',
    'art/pic/romance.webp': 'bf6da9159e',
    'art/pic/roof.webp': '1e0c3a558c',
    'art/pic/roof_human.webp': 'de7bf018aa',
    'art/pic/roof_tiger.webp': '07878555e7',
    'art/pic/root_road.webp': 'ff10bdd591',
    'art/pic/root_wyrm.webp': '266063c3d5',
    'art/pic/rot_ape.webp': '888c7bb5c1',
    'art/pic/seed.webp': '4e6b244b79',
    'art/pic/seed_planting.webp': '3e08438ee9',
    'art/pic/shen_qiu.webp': '0ffff3ce3a',
    'art/pic/ship_bridge.webp': '0a69ad668b',
    'art/pic/ship_log.webp': 'b7669cb0a9',
    'art/pic/ship_wreck.webp': '04fcfb1a63',
    'art/pic/stream.webp': '146f618712',
    'art/pic/stream_human.webp': 'e0cfc1300f',
    'art/pic/stream_tiger.webp': 'f730f97690',
    'art/pic/token.webp': '70b54ee233',
    'art/pic/tribulation.webp': '0c14fc76a5',
    'art/pic/tribulation_human.webp': 'ef5143f61a',
    'art/pic/tribulation_tiger.webp': 'b2801d7881',
    'art/pic/trio.webp': 'd6394227b1',
    'art/pic/trio_fire.webp': '0dadc9e24c',
    'art/pic/village.webp': '68a08522b1',
    'art/pic/village_human.webp': '6a4ea3b5d7',
    'art/pic/village_night.webp': '3c6306b996',
    'art/pic/village_tiger.webp': '2925a03602',
    'art/pic/wolves.webp': '5f7e9c0c11',
    'art/pic/wolves_human.webp': 'a6bdfb7c69',
    'art/pic/wolves_tiger.webp': '1a06f9f48e',
    'art/pic/workshop.webp': 'c108e2ff38',
    'art/pic/ya.webp': '146faed8a9',
    'art/pic/ya_arrives.webp': '677c2390f8',
    'art/pic/ya_fight.webp': '68d5700791',
    'art/pic/yuki_cat.webp': 'a24a172cdf',
    'art/pic/yuki_human.webp': '88343cf162',
    'art/pic/yuki_tiger.webp': '497eb63d61',
    'icons/icon-192.png': 'd6a18c4640',
    'icons/icon-512.png': '479a9ab2fc',
    'icons/icon.svg': '111e405e42',
};
const artKey = (path) => `${path}?v=${ART[path]}`;
const SCOPE = new URL(self.registration.scope).pathname;
/** The ART path a same-origin URL asks for, or null. */
const artPath = (url) => {
    if (url.origin !== location.origin || !url.pathname.startsWith(SCOPE)) return null;
    let p; try { p = decodeURIComponent(url.pathname.slice(SCOPE.length)); } catch { return null; } // a malformed escape is not art
    return Object.prototype.hasOwnProperty.call(ART, p) ? p : null;
};
/** v0.11.39 (Fable review): a response's fingerprint, so a stale copy from a proxy is never stored under a new fingerprint. */
const fpOf = async (r) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', await r.clone().arrayBuffer()))].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 10);
self.addEventListener('install', (e) => {
    // v0.11.10: 'reload' skips the browser's HTTP cache (GitHub Pages lets it keep files 10 minutes), so a new version caches new files.
    // v0.11.39: the art cache downloads only what it does not hold under the current fingerprint; any failure fails the install (the old version stays).
    e.waitUntil(Promise.all([
        caches.open(VERSION).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))),
        caches.open(ART_CACHE).then((c) => Promise.all(Object.keys(ART).map(async (p) => {
            if (await c.match(artKey(p))) return;
            const r = await fetch(new Request(p, { cache: 'reload' }));
            if (!r.ok) throw new Error(`${p}: ${r.status}`);
            if (await fpOf(r) !== ART[p]) throw new Error(`${p}: not the file ART names (a stale copy?)`); // the install fails; the old version stays and tries again later
            await c.put(artKey(p), r);
        }))),
    ]).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
    // old game caches go; the art cache stays, minus anything the current ART no longer names (an old fingerprint, a removed file)
    const keep = new Set(Object.keys(ART).map((p) => new URL(artKey(p), self.location).href));
    e.waitUntil(caches.keys()
        .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== ART_CACHE).map((k) => caches.delete(k))))
        .then(() => caches.open(ART_CACHE))
        .then(async (c) => { for (const r of await c.keys()) if (!keep.has(r.url)) await c.delete(r); })
        .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    // Fonts: cache on first use, then offline.
    if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
        e.respondWith(caches.open(VERSION).then(async (c) => (await c.match(req)) || fetch(req).then((r) => { c.put(req, r.clone()); return r; }).catch(() => new Response('', { status: 504 }))));
        return;
    }
    if (url.origin !== location.origin) return;
    // v0.11.39: pictures, backgrounds and icons from the art cache first (a fingerprint names one exact file), the network only on a miss.
    const p = artPath(url);
    if (p) {
        e.respondWith(caches.open(ART_CACHE).then(async (c) => {
            const hit = await c.match(artKey(p));
            if (hit) return hit;
            const r = await fetch(url.href, { cache: 'no-cache' });
            if (r.ok && await fpOf(r) === ART[p]) await c.put(artKey(p), r.clone()).catch(() => {}); // a full cache never costs the picture
            return r;
        }).catch(() => new Response('', { status: 504 })));
        return;
    }
    // Game files: network first (so updates arrive), cache when offline. v0.11.10: 'no-cache' asks GitHub every time
    // (a cheap "not modified" when nothing changed) instead of reusing the browser's 10-minute copy.
    const net = req.mode === 'navigate' ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req, { cache: 'no-cache' });
    e.respondWith(net.then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return r; }).catch(() => caches.match(req).then((m) => m || caches.match('index.html'))));
});
