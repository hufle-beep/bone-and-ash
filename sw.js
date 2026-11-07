/* Bone and Ash — offline cache. Bump VERSION on every release so phones pick up the new files. */
const VERSION = 'bone-ash-0.11.33';
const FILES = [
    './', 'index.html', 'manifest.webmanifest', 'css/style.css',
    'js/main.js', 'js/core/game.js', 'js/core/story.js', 'js/core/tasks.js', 'js/core/coil.js', 'js/core/meditate.js', 'js/core/forms.js', 'js/story/coil_scenes.js', 'js/story/oneoff.js', 'js/story/task_hubs.js', 'js/story/nodice_tune.js', 'js/core/formulas.js', 'js/story/prologue.js', 'js/story/common.js', 'js/story/wilds.js', 'js/story/ashfall.js', 'js/story/act1_common.js', 'js/story/act1_tune.js', 'js/story/act1_fallout.js', 'js/story/act1_blackroot.js', 'js/story/act1_heart.js', 'js/story/act1_return.js', 'js/story/power.js', 'js/story/fight_tune.js', 'js/story/meridians.js', 'js/story/yuki_path.js', 'js/story/stomp_prologue.js', 'js/story/stomp_act1.js', 'js/story/longforest.js', 'js/art/art.js', 'js/art/portrait.js', 'js/art/figures-clamp.js', 'js/art/clamp2.js',
    'art/bg/forest.jpg', 'art/bg/peaks.jpg', 'art/bg/cliffs.jpg', 'art/bg/pine.jpg', 'art/bg/village.jpg', 'art/bg/mountain.jpg',
    'art/pic/yuki_human.webp', 'art/pic/yuki_cat.webp', 'art/pic/yuki_tiger.webp', 'art/pic/mei_lin.webp', 'art/pic/ya.webp', 'art/pic/shen_qiu.webp', 'art/pic/jackals.webp', 'art/pic/james.webp',
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
