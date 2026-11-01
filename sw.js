/* Bone and Ash — offline cache. Bump VERSION on every release so phones pick up the new files. */
const VERSION = 'bone-ash-0.2.0';
const FILES = [
    './', 'index.html', 'manifest.webmanifest', 'css/style.css',
    'js/main.js', 'js/core/game.js', 'js/core/story.js', 'js/core/formulas.js', 'js/story/prologue.js', 'js/art/art.js', 'js/art/portrait.js',
    'art/bg/forest.jpg', 'art/bg/peaks.jpg', 'art/bg/cliffs.jpg', 'art/bg/pine.jpg', 'art/bg/village.jpg', 'art/bg/mountain.jpg',
    'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
];
self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
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
    // Game files: network first (so updates arrive), cache when offline.
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return r; }).catch(() => caches.match(req).then((m) => m || caches.match('index.html'))));
});
