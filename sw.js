/* Bone and Ash — offline cache. Bump VERSION on every release so phones pick up the new files. */
const VERSION = 'bone-ash-0.11.38';
const FILES = [
    './', 'index.html', 'manifest.webmanifest', 'css/style.css',
    'js/main.js', 'js/core/game.js', 'js/core/story.js', 'js/core/tasks.js', 'js/core/coil.js', 'js/core/meditate.js', 'js/core/forms.js', 'js/story/coil_scenes.js', 'js/story/oneoff.js', 'js/story/again.js', 'js/story/task_hubs.js', 'js/story/nodice_tune.js', 'js/core/formulas.js', 'js/story/prologue.js', 'js/story/common.js', 'js/story/wilds.js', 'js/story/ashfall.js', 'js/story/act1_common.js', 'js/story/act1_tune.js', 'js/story/act1_fallout.js', 'js/story/act1_blackroot.js', 'js/story/act1_heart.js', 'js/story/act1_return.js', 'js/story/power.js', 'js/story/fight_tune.js', 'js/story/meridians.js', 'js/story/yuki_path.js', 'js/story/stomp_prologue.js', 'js/story/stomp_act1.js', 'js/story/longforest.js', 'js/art/art.js', 'js/art/portrait.js', 'js/art/figures-clamp.js', 'js/art/clamp2.js',
    'art/bg/forest.jpg', 'art/bg/peaks.jpg', 'art/bg/cliffs.jpg', 'art/bg/pine.jpg', 'art/bg/village.jpg', 'art/bg/mountain.jpg',
    'art/pic/yuki_human.webp', 'art/pic/yuki_cat.webp', 'art/pic/yuki_tiger.webp', 'art/pic/mei_lin.webp', 'art/pic/ya.webp', 'art/pic/shen_qiu.webp', 'art/pic/jackals.webp', 'art/pic/james.webp',
    'art/pic/forest_dawn.webp', 'art/pic/omnitool.webp', 'art/pic/clearing.webp', 'art/pic/bone_needle.webp', 'art/pic/meditation.webp', 'art/pic/stream.webp', 'art/pic/forage.webp', 'art/pic/hunt.webp', 'art/pic/camp.webp', 'art/pic/forest_night.webp', 'art/pic/jackals_dead.webp', 'art/pic/herb_girl.webp', 'art/pic/gao_down.webp', 'art/pic/ridge.webp', 'art/pic/village.webp', 'art/pic/elder.webp', 'art/pic/healer.webp', 'art/pic/boar.webp', 'art/pic/dinner.webp', 'art/pic/romance.webp', 'art/pic/collectors.webp', 'art/pic/collectors_down.webp', 'art/pic/hairpin.webp', 'art/pic/tribulation.webp', 'art/pic/lights.webp', 'art/pic/rain.webp', 'art/pic/crows.webp', 'art/pic/rats.webp', 'art/pic/lizard.webp', 'art/pic/gift.webp', 'art/pic/bone_field.webp', 'art/pic/mire.webp', 'art/pic/hollow.webp', 'art/pic/roof.webp', 'art/pic/village_night.webp', 'art/pic/token.webp', 'art/pic/gao_window.webp', 'art/pic/arson.webp', 'art/pic/herb_slope.webp', 'art/pic/workshop.webp', 'art/pic/drill.webp', 'art/pic/wolves.webp',
    'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
];
self.addEventListener('install', (e) => {
    // v0.11.10: 'reload' skips the browser's HTTP cache (GitHub Pages lets it keep files 10 minutes), so a new version caches new files
    e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
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
    // Game files: network first (so updates arrive), cache when offline. v0.11.10: 'no-cache' asks GitHub every time
    // (a cheap "not modified" when nothing changed) instead of reusing the browser's 10-minute copy.
    const net = req.mode === 'navigate' ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req, { cache: 'no-cache' });
    e.respondWith(net.then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return r; }).catch(() => caches.match(req).then((m) => m || caches.match('index.html'))));
});
