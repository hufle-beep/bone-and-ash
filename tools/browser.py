"""v0.11.7: the browser test (Selene's sanity.py, adapted). Run from the repo root: python3 tools/browser.py
Serves the folder, opens the game at 390x844 in headless Chromium and taps the real buttons:
  1. Incremental Mode, a new game: about 40 taps on cards, story choices and fight actions, every tab;
  2. v0.11.64: a timed card resolves at once (no bar, no queue, no speed menu; the clock moved, a Results entry), from a fixed
     task screen (saves/v0.11.7-long-forest-coil2.json); the status bar stays pinned at the top when scrolled;
  3. v0.11.34 (D1): no Game mode switch; a phone still set to Story Mode ('boneash.tasks' '0') plays Incremental Mode;
  4. two tabs: closing the older tab leaves the newer save alone (v0.11.8);
  5. Saves (v0.11.9, in the menu since v0.11.10): Copy status, Export all then Restore all into a new game, a backup restored;
  6. the main menu (v0.11.10): opens first on plain paper with no tab bar; Settings (text size, Show checks) and Saves; Continue;
  (part 2 also: v0.11.35 a scene read before folds, Read it all again, Skip to the next choice; v0.11.229 a one-paragraph one to its first sentence; v0.11.83 the FAQ tab)
  (part 3, v0.11.39: the art cache across an update, with the service worker running; see update_test)
  7. v0.11.11: holding a card opens its tooltip (no check text) and the tap that ends the hold runs nothing; the status bars carry
     progress values; a story card plays at once; each tab keeps its scroll.
  8. v0.11.64 (C1): on a resting place, Cultivate until the limit runs its sits at once (the clock and Saturation move).
  (part 2, v0.11.208, PC3: the PC layout from 1100 px; see wide_layout)
Game screens (story, fights, journal) also fail on any check text: DC, a die, "+ d6" (checks are hidden since v0.11.10).
Fails on any page error, or when the screen shows undefined, NaN, [object Object] or an old mode name.
The taps are seeded, so a run repeats. Exit code 1 on any failure.
v0.11.21: fixed sleeps replaced by condition waits (each step waits for what the next line checks, with a timeout; a check still
reports its own message when the wait runs out). Taps on story cards, choices and fight actions wait out the game's 400 ms
double-tap guard, so no tap is swallowed and a run no longer depends on how busy the machine is.
"""
import json, random, re, socket, subprocess, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

ROOT = Path(__file__).resolve().parent.parent
BAD = re.compile(r"\bundefined\b|\bNaN\b|\[object Object\]|Tasks \(preview\)|\bClassic\b")
CHECKS = re.compile(r"\bDC\b|🎲|\+ d6\b|→ (?:passes|partly|fails|double|full|partial|fail)\b")  # v0.11.17: the task cards' bands too
fails, notes = [], []

def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p

def check_text(pg, where, strict=False):
    t = pg.evaluate("document.body.innerText")
    m = BAD.search(t) or (CHECKS.search(t) if strict else None)
    if m: fails.append(f"{where}: the screen shows '{m.group(0)}' … {t[max(0, m.start() - 60):m.end() + 40]!r}")

def until(pg, what, ms=5000, state=None, arg=None):
    """v0.11.21: wait for a selector (state: visible, hidden, attached, detached) or, for a JS expression or function,
    until it is truthy; False when the time runs out: the check after it then reports as before.
    v0.11.103 (owner pick BF1, U): only a timeout is quiet. Any other error (a JS syntax error in the expression, a bad
    selector) is a failure naming the wait: such a wait never waited, and under load Chromium also reported it as a page
    error (the part 2 "missing ) after argument list" flake, v0.11.85–v0.11.102). Pass values with `arg`, never inside the text."""
    try:
        if state: pg.wait_for_selector(what, state=state, timeout=ms)
        else: pg.wait_for_function(what, arg=arg, timeout=ms)
        return True
    except PWTimeout: return False
    except Exception as e:
        fails.append(f"until: the wait itself failed ({what[:80]}): {(str(e).splitlines() or [type(e).__name__])[0][:160]}")  # review low 1: an empty message
        return False

def in_game(pg, ms=5000):
    """the menu closed and the game drawn (render() runs inside the click, so this is usually true at once)"""
    return until(pg, "!document.body.classList.contains('menu-on') && !document.querySelector('.main-menu')", ms)

def on_tab(pg, t, ms=5000):
    return until(pg, f'#tabs [data-tab="{t}"][aria-current="page"]', ms, 'attached') and in_game(pg, ms)

def enter(pg):
    """v0.11.10: the game opens on the main menu; Continue (or Begin) enters it."""
    b = pg.query_selector('button[data-menu="continue"]')
    if b: b.click(); in_game(pg)

TIMER = 'ol.queue, button.pause, select[data-speed], button.qadd, #nowbar, #yukibar'  # v0.11.64: none of these may show
def no_timer(pg, where):
    el = pg.query_selector(TIMER)
    if el: fails.append(f"{where}: a timer or queue element shows ({el.evaluate('e => e.outerHTML.slice(0, 80)')})")

GUARD = 0.41  # js/main.js (view click handler): a story card, choice, fight action or (v0.11.64) task or Meditate card within 400 ms of the last one is ignored
_pressed = {}
def tap(pg, el, timeout=3000):
    """click a card; one the double-tap guard covers first waits out the 400 ms since the last such tap on this page
    (a genuine pause: the game checks Date.now(), there is no element to wait for)"""
    guarded = el.evaluate("e => e.dataset.story != null || e.dataset.choice != null || !!e.dataset.act || !!e.dataset.flee || !!e.dataset.run || !!e.dataset.med")  # v0.11.64: task and Meditate cards too
    if guarded:
        w = _pressed.get(id(pg), 0) + GUARD - time.monotonic()
        if w > 0: time.sleep(w)
    el.click(timeout=timeout)
    if guarded: _pressed[id(pg)] = time.monotonic()

OLD_CAL = "localStorage.setItem('boneash.oldcal', '1')"
def fresh(pg, url, js, arg=None):
    """v0.11.8: set storage from a non-game page on the same site, then open the game: the game's save-on-close can't write over it."""
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md'))
    pg.evaluate(js, arg) if arg is not None else pg.evaluate(js)
    pg.evaluate(OLD_CAL)  # v0.11.226 (FP1, BT): the flows written for the old calendar keep it (main.js OLD_CAL_KEY); flip_ui plays without it
    pg.goto(url); until(pg, '.main-menu', 10000, 'attached')
    enter(pg)

def visit_tabs(pg, where):
    tabs = [t for t in pg.eval_on_selector_all('[data-tab]', 'els => els.map(e => e.dataset.tab)') if t != 'menu']
    for t in tabs:
        pg.click(f'[data-tab="{t}"]'); on_tab(pg, t); check_text(pg, f"{where}, tab {t}", strict=t in ('story', 'journal'))
    if 'story' in tabs: pg.click('[data-tab="story"]'); on_tab(pg, 'story')
    return tabs

def no_greyed(pg, where):
    """v0.11.17 (owner pick 1a): Incremental Mode shows no greyed-out task, Meditate or fight card (story choices keep their own rule).
    v0.11.68 (owner pick T1): except the cards the game shows locked on purpose, with their reason: a sit short of Qi
    ("needs 10 Qi", v0.11.46 Q1), gather Qi when too hungry, and a card that would end past midnight (v0.11.37 D-a; 00:00 since v0.11.91)."""
    for g in pg.query_selector_all('button.card[disabled]:not(.story)'):
        t = g.inner_text()
        if re.search(r'needs \d+ Qi \(you have|too hungry: eat first|ends past midnight', t): continue
        fails.append(f"{where}: a greyed-out card shows: {t[:80]!r}"); return

def taps(pg, n, rng, where, sel):
    done = 0
    for i in range(n):
        folded = pg.query_selector_all('details.grp:not([open]) > summary')
        if folded and rng.random() < 0.2:  # v0.11.67 (Fable review M4): now and then open a folded group, so its cards get tapped too
            try: rng.choice(folded).click(timeout=3000)
            except Exception: pass
        btns = [b for b in pg.query_selector_all(sel) if b.is_visible()]  # v0.11.67 (D2): a folded group's cards are not tappable
        if not btns: break
        try: tap(pg, rng.choice(btns)); done += 1
        except Exception: continue  # re-rendered under the tap: look again
        if i % 10 == 9: check_text(pg, f"{where}, tap {i + 1}", strict=True); no_timer(pg, f"{where}, tap {i + 1}")
        if 'Incremental' in where: no_greyed(pg, f"{where}, tap {i + 1}")
    check_text(pg, f"{where}, after {done} taps", strict=True)
    return done

def scene_of(raw):
    return json.loads(json.loads(raw)['data'])['scene']

def open_saves(pg):
    pg.click('[data-tab="menu"]'); until(pg, '.main-menu button[data-menu="saves"]', 5000, 'visible')
    pg.click('button[data-menu="saves"]'); until(pg, 'button[data-exportall]', 5000, 'visible')

def main_menu(pg, url):
    """v0.11.10: the menu opens first, without the tab bar or the game's picture; Settings and Saves; Continue enters the game."""
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md')); pg.evaluate("localStorage.clear()"); pg.evaluate(OLD_CAL)
    pg.goto(url); until(pg, '.main-menu', 10000, 'attached')
    if not pg.query_selector('.main-menu'): fails.append('menu: the game did not open on the main menu'); return
    if pg.is_visible('#tabs') or pg.query_selector('.plate'): fails.append('menu: the tab bar or the game picture shows behind the menu')
    if not pg.query_selector('button[data-menu="continue"]') or 'Begin' not in pg.inner_text('button[data-menu="continue"]'): fails.append('menu: a first start should offer Begin')
    check_text(pg, 'menu')
    pg.click('button[data-menu="settings"]'); until(pg, 'button[data-showchecks]', 5000, 'visible'); check_text(pg, 'Settings')
    pg.click('button[data-textsize="120"]'); until(pg, "getComputedStyle(document.documentElement).fontSize === '19.2px'", 3000)
    fs = pg.evaluate("getComputedStyle(document.documentElement).fontSize")
    if fs != '19.2px': fails.append(f'Settings: text size 120% gave a root font of {fs}')
    pg.click('button[data-textsize="100"]'); until(pg, 'button.primary[data-textsize="100"]', 3000, 'attached')
    pg.click('button[data-showchecks]'); until(pg, "localStorage.getItem('boneash.showchecks') === '1'", 3000)
    if pg.evaluate("localStorage.getItem('boneash.showchecks')") != '1': fails.append('Settings: Show checks did not switch on')
    pg.click('button[data-showchecks]'); until(pg, "localStorage.getItem('boneash.showchecks') === '0'", 3000)
    # v0.11.182 (RV1, TG4): Settings → References: General by default, By name kept on the phone and restored on a reload
    if not pg.query_selector('button.primary[data-edition="general"]'): fails.append('ES: References is not General by default')
    pg.click('button[data-edition="named"]'); until(pg, "localStorage.getItem('boneash.edition') === 'named'", 3000)
    pg.reload(); until(pg, '.main-menu', 10000, 'attached'); pg.click('button[data-menu="settings"]'); until(pg, 'button[data-edition]', 5000, 'visible')
    if not pg.query_selector('button.primary[data-edition="named"]'): fails.append('ES: By name was not restored after a reload')
    pg.click('button[data-edition="general"]'); until(pg, "localStorage.getItem('boneash.edition') === 'general'", 3000)
    pg.click('button[data-menu="main"]'); until(pg, '.main-menu', 5000, 'attached')
    pg.click('button[data-menu="saves"]'); until(pg, 'button[data-exportall]', 5000, 'visible'); check_text(pg, 'Saves (menu)')
    pg.click('button[data-menu="main"]'); until(pg, '.main-menu', 5000, 'attached')
    enter(pg)
    if pg.query_selector('.main-menu') or not pg.is_visible('#tabs'): fails.append('menu: Continue did not enter the game')
    else: notes.append('menu, settings and saves')
    check_text(pg, 'after Begin', strict=True)
    # back to the menu from the game: it pauses, and Continue says so now
    pg.click('[data-tab="menu"]'); until(pg, '.main-menu', 5000, 'attached')
    if not pg.query_selector('.main-menu'): fails.append('menu: the ☰ Menu tab did not open the menu')
    enter(pg)

def news_box(pg, url):
    """v0.11.150 (BL1): the build label (with the build only in the app), What's new on the menu (first run: a new player sees
    nothing; a save and an older kept version: the notes since, newest first; ✕ closes it; the version kept at once), the whole
    list in Settings. Before VERSION is bumped with the docs the newest note may be one patch ahead: then no box is expected."""
    ver = re.search(r"VERSION = 'bone-ash-([^']+)'", (ROOT / 'sw.js').read_text()).group(1)
    notes_src = (ROOT / 'js/core/news.js').read_text()
    shown = [v for v in re.findall(r"\['(\d+\.\d+\.\d+)', '", notes_src) if tuple(map(int, v.split('.'))) <= tuple(map(int, ver.split('.')))]
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md')); pg.evaluate("localStorage.clear()"); pg.evaluate(OLD_CAL)
    pg.goto(url); until(pg, '#menuVer:not(:empty)', 5000, 'attached'); until(pg, "document.getElementById('menuVer')?.textContent !== '…'", 5000)
    label = pg.inner_text('.mver')
    if label != f'Version {ver} · Incremental Mode': fails.append(f'BL1 (LB): the browser menu says {label!r}, not Version {ver} · Incremental Mode')
    until(pg, f"localStorage.getItem('boneash.seen') === '{ver}'", 3000)
    if pg.query_selector('.wnew-box') or pg.evaluate("localStorage.getItem('boneash.seen')") != ver: fails.append('BL1 (WN): a new player saw What\'s new, or the version was not kept')
    save = (ROOT / 'saves/v0.11.7-long-forest-coil2.json').read_text()
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md')); pg.evaluate("s => { localStorage.clear(); localStorage.setItem('boneash.oldcal', '1'); localStorage.setItem('boneash.auto', s); localStorage.setItem('boneash.seen', '0.11.140'); }", save)
    pg.goto(url); until(pg, f"localStorage.getItem('boneash.seen') === '{ver}'", 5000)
    if shown: until(pg, '.wnew-box li', 3000, 'visible')
    got = pg.eval_on_selector_all('.wnew-box li b', 'els => els.map(e => e.textContent)')
    if got != list(reversed(shown)): fails.append(f'BL1 (WN): the box listed {got}, not {list(reversed(shown))}')
    elif shown:
        pg.click('button[data-newsclose]'); until(pg, '.wnew-box', 3000, 'detached')
        if pg.query_selector('.wnew-box'): fails.append('BL1 (WN): ✕ did not close What\'s new')
        pg.goto(url); until(pg, '.main-menu', 10000, 'attached'); pg.wait_for_timeout(400)
        if pg.query_selector('.wnew-box'): fails.append('BL1 (WN): What\'s new came back on the next open')
    pg.click('button[data-menu="settings"]'); until(pg, 'details.wnew-all', 5000, 'attached')
    n = pg.eval_on_selector_all('details.wnew-all li', 'els => els.length')
    # v0.11.150 (RW1, KO): the list stays open when Settings redraws
    pg.click('details.wnew-all > summary'); pg.click('button[data-showchecks]'); until(pg, "localStorage.getItem('boneash.showchecks') === '1'", 3000)
    if not pg.evaluate("document.querySelector('details.wnew-all')?.open"): fails.append('RW1 (KO): Settings → What\'s new folded itself on a redraw')
    pg.click('button[data-showchecks]'); until(pg, "localStorage.getItem('boneash.showchecks') === '0'", 3000)
    if n != len(re.findall(r"\['\d+\.\d+\.\d+', '", notes_src)): fails.append(f'BL1 (WL): Settings → What\'s new lists {n} notes')
    check_text(pg, 'Settings (What\'s new)')
    # in the app (a fake bridge): the build on the label and in Copy status; no update check at start
    pa = pg.context.new_page()
    pa.add_init_script("window.AndroidBridge = { versionCode: () => 6, isApp: () => true }; try { localStorage.setItem('boneash.update', JSON.stringify({ auto: false, autoInstall: false })); } catch {}")
    pa.goto(url); until(pa, "document.getElementById('menuVer')?.textContent.includes('build')", 5000)
    al = pa.inner_text('.mver')
    if al != f'Version {ver} · build 6 · Incremental Mode': fails.append(f'BL1 (LB): the app\'s menu says {al!r}')
    else: notes.append(f'BL1: the label ({al}), What\'s new ({len(shown)} on the menu{", ✕" if shown else ", none before the bump"}), Settings\' list ({n})')
    # v0.11.187 (owner pick U1): GitHub limits the check (a fake 403 with its reset time 23 min on): UB the label, RT the time, DL the link
    reset = int(time.time()) + 23 * 60
    pa.route('https://api.github.com/**', lambda r: r.fulfill(status=403, body='{"message":"API rate limit exceeded"}', headers={'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Expose-Headers': 'X-RateLimit-Reset', 'X-RateLimit-Reset': str(reset)}))
    pa.click('button[data-menu="settings"]'); until(pa, 'button[data-updcheck]', 5000, 'attached')
    l0 = pa.inner_text('button[data-updgo]')
    pa.click('button[data-updcheck]'); until(pa, "/try again at/.test(document.getElementById('updSt')?.textContent || '')", 5000)
    st, l1 = pa.inner_text('#updSt'), pa.inner_text('button[data-updgo]')
    href = pa.get_attribute('a.updbrowser', 'href') if pa.query_selector('a.updbrowser') else None
    want = time.strftime('%H:%M', time.localtime(reset))
    if l0 != 'Not checked yet': fails.append(f'U1 (UB): before a check the button says {l0!r}')
    if l1 != "Couldn't check": fails.append(f'U1 (UB): after a limited check the button says {l1!r}')
    if not re.fullmatch(rf'GitHub limits update checks; try again at {want} \(in 2[23] min\)\.', st): fails.append(f'U1 (RT): the line says {st!r}, not {want}')
    if href != 'https://github.com/hufle-beep/bone-and-ash/releases/download/android-latest/BoneAndAsh.apk': fails.append(f'U1 (DL): the browser link is {href!r}')
    check_text(pa, 'Settings → App updates (limited)')
    if not [f for f in fails if f.startswith('U1')]: notes.append(f'U1: Settings → App updates: {l0!r} → {l1!r}, "{st}", the browser link')
    pa.close()

FONT_FACES = {'Literata|400 600|normal', 'Literata|400|italic', 'Shippori Mincho|600|normal', 'Shippori Mincho|800|normal'}

def drawn_fonts(pg):
    """v0.11.149 (FX1, FL): the platform fonts Chromium used for sample text in the game's own styles (CDP CSS.getPlatformFontsForNode)."""
    pg.evaluate("""() => { const d = document.createElement('div'); d.id = 'fontprobe'; d.innerHTML = '<p id="fp-body">The bone sings — Ashfall.</p><p id="fp-bold"><b>The bone sings.</b></p><p id="fp-italic"><i>The bone sings.</i></p><h1 id="fp-title" style="font-family: var(--display); font-weight: 800">Bone and Ash</h1><h2 id="fp-heading" style="font-family: var(--display); font-weight: 600">Saves</h2>'; document.body.appendChild(d); return document.fonts.ready.then(() => 1); }""")
    cdp = pg.context.new_cdp_session(pg)
    try:
        cdp.send('DOM.enable'); cdp.send('CSS.enable')
        root = cdp.send('DOM.getDocument')['root']['nodeId']
        out = {}
        for k in ('body', 'bold', 'italic', 'title', 'heading'):
            node = cdp.send('DOM.querySelector', {'nodeId': root, 'selector': f'#fp-{k}'})['nodeId']
            kid = cdp.send('DOM.describeNode', {'nodeId': node, 'depth': 2})['node']
            text = next((c for c in kid.get('children', []) if c.get('nodeType') == 3), None) or next((g for c in kid.get('children', []) for g in c.get('children', []) if g.get('nodeType') == 3), None)
            target = cdp.send('DOM.pushNodesByBackendIdsToFrontend', {'backendNodeIds': [text['backendNodeId']]})['nodeIds'][0] if text else node
            out[k] = [f['familyName'] for f in cdp.send('CSS.getPlatformFontsForNode', {'nodeId': target})['fonts']]
        return out
    finally:
        cdp.detach(); pg.evaluate("document.getElementById('fontprobe')?.remove()")

def fonts_local(pg, url):
    """v0.11.149 (owner pick FN1): the four fonts load from the game's own css/fonts/ with Google Fonts blocked, and nothing asks Google."""
    asked = []
    google = re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*')
    def block(route): asked.append(route.request.url); route.abort()
    pg.context.route(google, block)
    try:
        fresh(pg, url, "localStorage.clear()")
        faces = pg.evaluate("Promise.all([...document.fonts].map((f) => f.load().then(() => f, () => f))).then((fs) => fs.map((f) => [f.family.replace(/\"/g, ''), f.weight, f.style, f.status].join('|')))")
        got = {'|'.join(f.split('|')[:3]) for f in faces if f.endswith('|loaded')}
        bad = [f for f in faces if not f.endswith('|loaded')]
        drawn = pg.evaluate("['16px Literata', '600 16px Literata', 'italic 16px Literata', '600 16px \"Shippori Mincho\"', '800 16px \"Shippori Mincho\"'].filter((f) => !document.fonts.check(f))")
        if got != FONT_FACES or bad: fails.append(f'fonts: the local faces {sorted(got)} (failed {bad}), expected {sorted(FONT_FACES)}')
        elif drawn: fails.append(f'fonts: not ready to draw {drawn}')
        elif asked: fails.append(f'fonts: the page still asked Google Fonts ({asked[:2]})')
        else:
            # v0.11.149 (FX1, FL): which font Chromium really draws each kind of text with (not just that the faces loaded)
            used = drawn_fonts(pg)
            want = {'body': 'Literata', 'bold': 'Literata', 'italic': 'Literata', 'title': 'Shippori Mincho', 'heading': 'Shippori Mincho'}
            off = {k: v for k, v in used.items() if not v or not v[0].startswith(want[k]) or len(v) > 1}
            if off or set(used) != set(want): fails.append(f'fonts: drawn with {used}')
            else: notes.append('the four fonts from css/fonts/, nothing asked of Google; body, bold, italic, title and headings drawn with them (' + ', '.join(f'{k} {v[0]}' for k, v in used.items()) + ')')
    finally:
        pg.context.unroute(google, block)

def comfort(pg, url):
    fresh(pg, url, "localStorage.clear()")
    if len(pg.query_selector_all('.status [role="progressbar"][aria-valuenow]')) != 3: fails.append('a11y: the status bars lack progress values')
    card = pg.query_selector('button.card:not([disabled])[data-story]') or pg.query_selector('button.card:not([disabled])[data-run]')
    if not card: fails.append('tooltip: no card to hold'); return
    scene0 = pg.inner_text('.head .title')
    card.scroll_into_view_if_needed()  # an instant scroll: the page has no smooth scroll-behavior
    bb = card.bounding_box(); x, y = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
    # the 750 ms hold is what is tested (HOLD_MS = 500 in js/main.js): kept as it was
    pg.mouse.move(x, y); pg.mouse.down(); pg.wait_for_timeout(750); pg.mouse.up(); until(pg, '#tip', 3000, 'visible')
    if not pg.is_visible('#tip'): fails.append('tooltip: holding a card did not open it')
    else:
        t = pg.inner_text('#tip')
        if CHECKS.search(t): fails.append(f'tooltip: shows check text {t[:120]!r}')
        pg.click('#tip [data-tip="close"]'); until(pg, '#tip', 3000, 'hidden')
        if pg.is_visible('#tip'): fails.append('tooltip: ✕ did not close it')
        else: notes.append('tooltip')
    scene1 = pg.inner_text('.head .title')
    if scene1 != scene0: fails.append(f'tooltip: the hold moved the story ({scene0} → {scene1})')
    # v0.11.64: a story card plays at once (no bar); its smooth scroll to the top ends before the tabs
    long = pg.query_selector('button.card:not([disabled])[data-story]')
    if long:
        ln = long.query_selector('.len').inner_text()
        if not re.search(r'→ (Day \d+, )?\d\d:\d\d$|^at once$', ln): fails.append(f'A1: a story card does not say where it ends: {ln!r}')
        tap(pg, long); until(pg, 'scrollY === 0', 3000)
        no_timer(pg, 'a story card')
    # each tab keeps its scroll
    pg.click('[data-tab="sheet"]'); on_tab(pg, 'sheet')
    jt = pg.inner_text('#view')  # v0.11.86 (#53, C1): the James tab says a bite by choice adds no faster learning
    if 'adds nothing to the faster learning' in jt and 'start the prologue over at the first dawn' in jt: notes.append('the James tab: a bite by choice restarts the prologue, no faster learning')
    else: fails.append('v0.11.86: the James tab does not say a bite by choice restarts the act with no faster learning')
    room = pg.evaluate("document.documentElement.scrollHeight - innerHeight")
    if room > 150:
        pg.evaluate("scrollTo(0, 120)"); until(pg, 'scrollY === 120', 3000)
        pg.click('[data-tab="bag"]'); on_tab(pg, 'bag'); pg.click('[data-tab="sheet"]'); on_tab(pg, 'sheet'); until(pg, 'Math.abs(scrollY - 120) <= 5', 3000)
        yv = pg.evaluate("scrollY")
        if abs(yv - 120) > 5: fails.append(f'scroll: the James tab came back at {yv}, not 120')
        else: notes.append('scroll kept per tab')
    pg.click('[data-tab="story"]'); on_tab(pg, 'story')

def groups(pg, url):
    """v0.11.67 (owner picks F1 + D2): one hub format. The Long Forest camp (a v0.11.7 test save) has no gate cards: Forage, Hunt,
    Practice and Go deep are groups on the list. Story never folds; the hub's own group and Meditate start open, the work groups
    start folded with their count; a group the player opens stays open through a redraw and a reload (kept on this phone)."""
    fresh(pg, url, "s => { localStorage.clear(); localStorage.setItem('boneash.auto', s); }", (ROOT / 'saves/v0.11.7-long-forest-coil2.json').read_text())
    st = pg.eval_on_selector_all('details.grp', "els => els.map(e => [e.dataset.grp, e.open, e.querySelectorAll('button.card').length, e.querySelector('.count')?.textContent || ''])")
    want = {'Forage': False, 'Hunt': False, 'Practice': False, 'Go deep': False, 'Camp': True, 'Meditate': True}
    seen = {n: o for n, o, k, c in st}
    bad = [f'{n} {"open" if seen.get(n) else "folded" if n in seen else "missing"}' for n, o in want.items() if seen.get(n) != o]
    if bad: fails.append(f'D2: the Long Forest camp\'s groups start wrong: {bad} (on screen: {st})')
    if any(c != f'· {k}' for n, o, k, c in st): fails.append(f'D2: a group heading does not show its card count: {st}')
    gate = pg.eval_on_selector_all('button.card.story', "els => els.map(e => e.textContent).filter(t => /^(Forage|Hunt|Train)\\.|^Go deep/.test(t))")
    if gate: fails.append(f'F1: the Long Forest camp still shows gate cards: {gate}')
    if pg.query_selector('.tasks > h2:has-text("Story") + details, details.grp[data-grp="Story"]'): fails.append('D2: Story folds')
    if pg.query_selector('details.grp:not([open]) button.card') and pg.query_selector('details.grp:not([open]) button.card').is_visible(): fails.append('D2: a folded group\'s card shows')
    if bad or gate: return
    pg.click('details.grp[data-grp="Hunt"] > summary'); until(pg, "() => document.querySelector('details.grp[data-grp=\"Hunt\"]').open", 3000)
    pg.click('details.grp[data-grp="Camp"] > summary'); until(pg, "() => !document.querySelector('details.grp[data-grp=\"Camp\"]').open", 3000)
    until(pg, "() => /Camp/.test(localStorage.getItem('boneash.groups') || '')", 3000)  # the toggle event comes a task after the click
    kept = pg.evaluate("JSON.parse(localStorage.getItem('boneash.groups') || '{}')")
    if kept != {'Hunt': True, 'Camp': False}: fails.append(f'D2: the opened and folded groups are not kept on the phone: {kept}')
    card = next((e for e in pg.query_selector_all('details.grp[data-grp="Hunt"] button.card:not([disabled])[data-run]') if e.is_visible()), None)
    if not card: fails.append('D2: the opened Hunt group shows no card'); return
    r0 = len(pg.query_selector_all('.res')); tap(pg, card); until(pg, "n => document.querySelectorAll('.res').length > n", 3000, arg=r0)  # the Long Forest's clock label never changes (Fable review M3)
    after = pg.eval_on_selector_all('details.grp', "els => Object.fromEntries(els.map(e => [e.dataset.grp, e.open]))")
    if after.get('Hunt') is not True or after.get('Camp') is not False or after.get('Forage') is not False: fails.append(f'D2: a redraw lost the groups\' state: {after}')
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md')); pg.goto(url); until(pg, '.main-menu', 10000, 'attached'); enter(pg)
    again = pg.eval_on_selector_all('details.grp', "els => Object.fromEntries(els.map(e => [e.dataset.grp, e.open]))")
    if again.get('Hunt') is not True or again.get('Camp') is not False: fails.append(f'D2: a reload lost the groups\' state: {again}')
    else: notes.append('one hub format: no gate cards in the Long Forest; groups fold, start as picked, and keep their state')

def replies(pg, url):
    """v0.11.68 (owner picks A1 + B2 + C1): a card's reply shows under the scene text, its gains in Results, never mixed;
    no reply box above the cards. The Long Forest camp (a v0.11.7 test save): Hunt → "Let Yuki hunt and watch her work."."""
    fresh(pg, url, "s => { localStorage.clear(); localStorage.setItem('boneash.auto', s); localStorage.setItem('boneash.groups', JSON.stringify({ Hunt: true })); }", (ROOT / 'saves/v0.11.7-long-forest-coil2.json').read_text())
    card = pg.query_selector('details.grp[data-grp="Hunt"] button.card[data-run="lf_hunt:2"]:not([disabled])')
    if not card: fails.append('A1: no "Let Yuki hunt" card in the Long Forest camp\'s Hunt group'); return
    r0 = len(pg.query_selector_all('.res')); tap(pg, card); until(pg, "n => document.querySelectorAll('.res').length > n", 3000, arg=r0)
    reply = pg.inner_text('.prose.reply') if pg.query_selector('.prose.reply') else ''
    res = pg.eval_on_selector('.res', "e => e.querySelector('div')?.innerText || ''") if pg.query_selector('.res') else ''
    if not re.search(r'comes back', reply): fails.append(f'A1: the card\'s reply is not under the scene text: {reply!r}')
    elif re.search(r'\+\d', reply): fails.append(f'A1: the reply holds a gain: {reply!r}')
    elif not re.search(r'\+\d', res) or 'comes back' in res: fails.append(f'A1: Results do not hold just the gains: {res!r}')
    elif pg.query_selector('.below .result'): fails.append('A1: a reply box still shows above the cards')
    else: notes.append('a card\'s reply under the scene text, its gains in Results')
    check_text(pg, 'a reply', strict=True)

def flip_ui(pg, url):
    """v0.11.226 (owner pick FP1, the flip; no OLD_CAL key, as a player has it): the menu has no test button; Begin starts the long
    calendar on Day 1; an old-calendar save (Day 4, Mei Lin) opens moved to Day 22, and its autosave after a card is on the long calendar."""
    auto = "(() => { try { return JSON.parse(JSON.parse(localStorage.getItem('boneash.auto')).data); } catch { return null; } })()"
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md')); pg.evaluate("localStorage.clear()")
    pg.goto(url); until(pg, '.main-menu', 10000, 'attached')
    bad = []
    if pg.query_selector('button[data-new="long"]') or '(test)' in pg.inner_text('.main-menu'): bad.append('OB: the long calendar\'s test button still shows')
    enter(pg)
    if 'Day 1' not in pg.evaluate("document.body.innerText"): bad.append('NG: Begin did not start on Day 1')
    c = pg.query_selector('button.card:not([disabled])[data-story], button.card:not([disabled])[data-run], button.card:not([disabled])[data-act]')
    if c: tap(pg, c); until(pg, f"{auto} && {auto}.cal === 7", 3000)
    st = pg.evaluate(auto)
    if not st or st.get('cal') != 7: bad.append(f"NG: Begin's autosave is not on the long calendar (cal {st and st.get('cal')})")
    save = (ROOT / 'saves/v0.8.5-day4-mei-lin.json').read_text()
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md')); pg.evaluate("s => { localStorage.clear(); localStorage.setItem('boneash.auto', s); }", save)
    pg.goto(url); until(pg, '.main-menu', 10000, 'attached'); enter(pg)
    if 'Day 22' not in pg.evaluate("document.body.innerText"): bad.append('MV: the Day 4 save did not open on Day 22')
    c = pg.query_selector('button.card:not([disabled])[data-story], button.card:not([disabled])[data-run], button.card:not([disabled])[data-act]')
    if c: tap(pg, c); until(pg, f"{auto} && {auto}.cal === 7", 3000)
    st = pg.evaluate(auto)
    if not st or st.get('cal') != 7 or not (21 * 1440 <= st.get('minutes', 0) < 23 * 1440): bad.append(f"MV: the moved save's autosave is not on Day 22 of the long calendar (cal {st and st.get('cal')}, minutes {st and st.get('minutes')})")
    if bad: fails.extend(bad)
    else: notes.append('FP1: no test button; Begin on Day 1 of the long calendar; a Day 4 save opened on Day 22, saved on the long calendar')

def nextstep(pg, url):
    """v0.11.72 (owner pick N1): the next-step line on a prologue task screen (Day 1, the stream, a v0.8.5 test save);
    its ✕ hides it for good on this phone, through a redraw and a reload."""
    fresh(pg, url, "s => { localStorage.clear(); localStorage.setItem('boneash.auto', s); }", (ROOT / 'saves/v0.8.5-day1-stream.json').read_text())
    line = pg.inner_text('.nstep') if pg.query_selector('.nstep') else ''
    if not re.search(r'Next step\s+Tap a card and it happens at once', line): fails.append(f'N1: no next-step line on Day 1 at the stream: {line!r}'); return
    tap(pg, pg.query_selector('.nstep [data-nonext]')); until(pg, "() => !document.querySelector('.nstep')", 3000)
    if pg.query_selector('.nstep') or pg.evaluate("localStorage.getItem('boneash.nonext')") != '1': fails.append('N1: the ✕ does not hide the line for good'); return
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md')); pg.goto(url); until(pg, '.main-menu', 10000, 'attached'); enter(pg)
    if pg.query_selector('.nstep'): fails.append('N1: the line is back after a reload')
    else: notes.append('the next-step line shows on Day 1 and its ✕ hides it for good')
    check_text(pg, 'the next-step line', strict=True)

def faq(pg, url):
    """v0.11.83 (owner picks P1 + T1 + R1): the FAQ tab, Selene's. Six tabs in one row (390 and 360 px). A phone that already
    has the FAQ (start entries seen) loading the Long Forest Coil 2 save: the tab shows its dot, the new entries are tagged and
    the first opens by itself; opening another removes its tag and is kept through a reload. A phone new to the FAQ: nothing
    new. Search filters (every word) and says when nothing matches; the FAQ opened from a tab opens that tab's entry; the James
    tab's old dice rules are gone (its button opens the FAQ)."""
    save = (ROOT / 'saves/v0.11.7-long-forest-coil2.json').read_text()
    start = ["James and Yuki", "What is the goal?", "How do I play?", "HP, Convergence and Fed", "Days, sleep and the night", "Results and the Journal", "Saving and settings", "The Android app", "Skills and checks", "The hammerspace"]
    kept = json.dumps({'u': {'start': 1}, 'seen': {q: 1 for q in start}})
    fresh(pg, url, "a => { localStorage.clear(); localStorage.setItem('boneash.auto', a[0]); localStorage.setItem('boneash.faq.v1', a[1]); }", [save, kept])
    row = pg.eval_on_selector_all('#tabs button', "els => els.map(e => Math.round(e.getBoundingClientRect().top))")
    if len(row) != 6 or len(set(row)) != 1: fails.append(f'FAQ: the six tabs are not one row at 390 px: tops {row}')
    pg.set_viewport_size({'width': 360, 'height': 780})
    row = pg.eval_on_selector_all('#tabs button', "els => els.map(e => Math.round(e.getBoundingClientRect().top))")
    if len(set(row)) != 1: fails.append(f'FAQ: the six tabs are not one row at 360 px: tops {row}')
    pg.set_viewport_size({'width': 390, 'height': 844})
    if not until(pg, '#tabs button[data-tab="faq"].new', 3000, 'attached'): fails.append('FAQ: no dot on the tab with new entries'); return
    pg.click('#tabs [data-tab="faq"]'); on_tab(pg, 'faq')
    if pg.query_selector('#tabs button[data-tab="faq"].new'): fails.append('FAQ: the dot stays on while the FAQ is open')
    ents = pg.eval_on_selector_all('details[data-faq]', "els => els.map(e => [e.dataset.faq, e.open, !!e.querySelector('.fnew')])")
    later = [q for q, o, n in ents if q not in start]  # unlocked by the save: new on this phone
    first = later[0] if later else None
    news = [q for q, o, n in ents if n]
    if not later or any(q in start for q in news) or news != later[1:]: fails.append(f'FAQ: the wrong entries are tagged new: {news} (unlocked: {later})')
    opened = [q for q, o, n in ents if o]
    until(pg, f"() => (JSON.parse(localStorage.getItem('boneash.faq.v1') || '{{}}').seen || {{}})[{json.dumps(first)}] === 1", 3000)
    if first not in opened or not pg.evaluate(f"(JSON.parse(localStorage.getItem('boneash.faq.v1')).seen || {{}})[{json.dumps(first)}] === 1"): fails.append(f'FAQ: the first new entry ({first}) did not open by itself as seen; open: {opened}')
    if 'The Long Forest' not in [q for q, o, n in ents] or 'Act 1' in [q for q, o, n in ents]: fails.append(f'FAQ: the Long Forest save unlocked the wrong entries: {[q for q, o, n in ents]}')
    other = next((q for q in news if q != first), None)
    if other:
        pg.click(f'details[data-faq="{other}"] > summary')
        until(pg, "q => ![...document.querySelectorAll('details[data-faq]')].some(d => d.dataset.faq === q && d.querySelector('.fnew'))", 3000, arg=other)  # v0.11.103 (BF1, F): the name as an argument ("Yuki's job" broke the text)
        until(pg, f"() => (JSON.parse(localStorage.getItem('boneash.faq.v1') || '{{}}').seen || {{}})[{json.dumps(other)}] === 1", 3000)
        if pg.query_selector(f'details[data-faq="{other}"] .fnew'): fails.append(f'FAQ: opening "{other}" kept its new tag')
    check_text(pg, 'the FAQ')
    seen0 = pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('boneash.faq.v1')).seen).length")
    pg.click('#tabs [data-tab="faq"]'); pg.click('#tabs [data-tab="faq"]'); on_tab(pg, 'faq')  # the review's #4: tapping the open tab again must not read the next new entry
    seen1 = pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('boneash.faq.v1')).seen).length")
    if seen1 != seen0: fails.append(f'FAQ: tapping the FAQ tab again marked entries read ({seen0} → {seen1})')
    pg.fill('#faq-q', 'midnight sleep')
    vis = pg.eval_on_selector_all('details[data-faq]', "els => els.filter(e => !e.hidden).map(e => [e.dataset.faq, e.open])")
    if [q for q, o in vis] != ['Days, sleep and the night'] or not all(o for q, o in vis): fails.append(f'FAQ: searching "midnight sleep" shows {vis}')
    pg.fill('#faq-q', 'zebra'); until(pg, '#faq-none', 2000, 'visible')
    if not pg.is_visible('#faq-none'): fails.append('FAQ: no "no question matches" note')
    pg.fill('#faq-q', '')
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md')); pg.goto(url); until(pg, '.main-menu', 10000, 'attached'); enter(pg)
    st = pg.evaluate("JSON.parse(localStorage.getItem('boneash.faq.v1'))")
    if other and not st['seen'].get(other): fails.append('FAQ: an opened entry is not kept through a reload')
    pg.click('#tabs [data-tab="sheet"]'); on_tab(pg, 'sheet')
    if re.search(r'Rules in one breath|a 6 always|d6', pg.inner_text('#view')): fails.append('R1: the James tab still shows the dice-era rules')
    b = pg.query_selector('#view button[data-tab-go="faq"]')
    if not b: fails.append('R1: no button to the FAQ on the James tab'); return
    b.click(); on_tab(pg, 'faq')
    if not pg.evaluate("document.querySelector('details[data-faq=\"Skills and checks\"]')?.open"): fails.append('FAQ: opened from the James tab, "Skills and checks" is not open')
    pg.click('#tabs [data-tab="story"]'); on_tab(pg, 'story'); pg.click('#tabs [data-tab="faq"]'); on_tab(pg, 'faq')
    if not pg.evaluate("document.querySelector('details[data-faq=\"How do I play?\"]')?.open"): fails.append('FAQ: opened from the Story tab, "How do I play?" is not open')
    # a phone new to the FAQ: what the save reached is there, none of it new, no dot
    fresh(pg, url, "a => { localStorage.clear(); localStorage.setItem('boneash.auto', a); }", save)
    if pg.query_selector('#tabs button[data-tab="faq"].new'): fails.append('FAQ: a phone new to the FAQ shows the dot')
    pg.click('#tabs [data-tab="faq"]'); on_tab(pg, 'faq')
    if pg.query_selector('.fnew'): fails.append('FAQ: a phone new to the FAQ tags entries as new')
    # the review's #1: on a new game the James tab's button finds its entry
    fresh(pg, url, "localStorage.clear()")
    pg.click('#tabs [data-tab="sheet"]'); on_tab(pg, 'sheet'); pg.click('#view button[data-tab-go="faq"]'); on_tab(pg, 'faq')
    if not pg.evaluate("document.querySelector('details[data-faq=\"Skills and checks\"]')?.open"): fails.append('FAQ: on a new game, the James tab\'s button does not open Skills and checks')
    elif not fails or not any(f.startswith(('FAQ', 'R1')) for f in fails): notes.append(f'the FAQ: six tabs in a row, {len(ents)} entries unfold with a dot and new tags, search, per-tab entries, kept on the phone')

def rest_places(pg, url):
    fresh(pg, url, "localStorage.clear()")
    if pg.query_selector('button.card.med'): fails.append('the arrival shows a Meditate card (v0.11.14: resting places only)')
    # v0.11.24: the arrival plate shows James's picture (art/pic/james.webp), and the file really loads
    pic = pg.evaluate("""async () => { const s = document.querySelector('.plate svg[data-pic]'); if (!s) return null;
        const href = s.querySelector('image')?.getAttribute('href'); const im = new Image(); im.src = href;
        try { await im.decode(); } catch (e) { return [s.dataset.pic, href, 0]; } return [s.dataset.pic, href, im.naturalWidth]; }""")
    if not pic: fails.append('the arrival plate shows no picture (v0.11.24: data-pic)')
    elif pic[0] != 'james' or pic[2] != 800: fails.append(f'the arrival picture is wrong or did not load: {pic}')
    else: notes.append('the arrival plate shows James\'s picture (800 px, loaded)')
    s1 = (ROOT / 'saves/v0.8.5-day1-stream.json').read_text()
    fresh(pg, url, "s => { localStorage.clear(); localStorage.setItem('boneash.auto', s); }", s1)
    # v0.11.64 (C1): Cultivate until the limit, at once: the clock and Saturation move, one Results entry
    loop = pg.query_selector('button.card.med[data-med="med:sitall"]')
    if not loop: fails.append('the stream: no "Cultivate until the limit" card'); return
    lab = loop.inner_text()
    if not re.search(r'\d+ sits, .*\d+ Qi → Saturation \d', lab): fails.append(f'the stream: the loop card does not show its sits, time and Qi: {lab[:120]!r}')
    clk0 = pg.inner_text('.status .clk'); r0 = len(pg.query_selector_all('.res'))
    tap(pg, loop); until(pg, "c => document.querySelector('.status .clk')?.innerText !== c", 3000, arg=clk0)
    clk1 = pg.inner_text('.status .clk'); r1 = len(pg.query_selector_all('.res'))
    if clk1 == clk0 or r1 != r0 + 1: fails.append(f'the stream: the loop did not run at once (clock {clk0} → {clk1}, results {r0} → {r1})')
    else: notes.append(f'Meditate only on resting places; Cultivate until the limit at once ({clk0} → {clk1})')
    no_timer(pg, 'the stream')
    check_text(pg, 'resting place', strict=True)
    # v0.11.26: the owner's 11:02 save (the end of Act 1 after "taken") goes round again: Go round again… → the start of Act 1
    import gzip, base64
    raw = (ROOT / 'saves/2026-11-07-1102-incremental-a1_end.txt').read_text().strip()
    s2 = gzip.decompress(base64.b64decode(raw[5:])).decode()
    fresh(pg, url, "s => { localStorage.clear(); localStorage.setItem('boneash.auto', s); }", s2)
    again = pg.query_selector('button.card.story:has-text("Go round again")')
    if not again: fails.append('the end of Act 1: no "Go round again…" (v0.11.26)'); return
    tap(pg, again)
    until(pg, "() => /Go Round Again/i.test(document.querySelector('.title')?.innerText || '')", 3000)
    bite = pg.query_selector('button.card.story:has-text("start of Act 1")')
    whole = pg.query_selector('button.card.story:has-text("start of the whole game")')
    if not bite or not whole: fails.append('Go round again: the two Bite choices are missing'); return
    tap(pg, bite); until(pg, "() => /Ashfall, Again/.test(document.body.innerText)", 3000)
    if 'Ashfall, Again' not in pg.evaluate('document.body.innerText'): fails.append('Go round again → the start of Act 1 did not show "Ashfall, Again"')
    else: notes.append('the end of Act 1 goes round again (the owner\'s save → the start of Act 1)')
    check_text(pg, 'going round again', strict=True)

def saves(pg, url):
    lf = (ROOT / 'saves/v0.11.7-long-forest-coil2.json').read_text()
    s1 = (ROOT / 'saves/v0.8.5-day1-stream.json').read_text()
    b5 = (ROOT / 'saves/v0.11.7-coil2-day1.json').read_text()
    fresh(pg, url, """a => { localStorage.clear(); localStorage.setItem('boneash.auto', a[0]); localStorage.setItem('boneash.slot1', a[1]);
        localStorage.setItem('boneash.bak.5m', a[2]); localStorage.setItem('boneash.bak.meta', JSON.stringify({ play: 0, at: {}, when: { '5m': Date.now() } })); }""", [lf, s1, b5])
    open_saves(pg); check_text(pg, 'Saves')
    # v0.11.13: every save line shows its Coil (Incremental Mode), as Continue does
    txt = pg.inner_text('body')
    if not re.search(r'Day \d+, \d\d:\d\d · Coil 2', txt): fails.append('Saves: the Coil 2 backup line has no "· Coil 2"')
    else: notes.append('save lines show the Coil')
    # Copy status
    pg.click('button[data-status]')  # the note comes once the clipboard write has settled; then the clipboard holds text
    until(pg, "/Status copied|could not be copied|No status/.test(document.getElementById('saveNote')?.textContent || '')", 10000)
    until(pg, "navigator.clipboard.readText().then(t => t.length > 0)", 5000)
    st = pg.evaluate("navigator.clipboard.readText()")
    if scene_of(lf) not in st or not re.search(r'Bone and Ash \d+\.\d+\.\d+', st) or 'Journal (newest first)' not in st or 'Pause log' in st: fails.append(f'Copy status: unexpected text {st[:200]!r}')
    # Export all, then Restore all into a new game
    auto0 = pg.evaluate("localStorage.getItem('boneash.auto')")
    with pg.expect_download() as dl: pg.click('button[data-exportall]')
    path = dl.value.path()
    fresh(pg, url, "localStorage.clear()")
    open_saves(pg)
    pg.set_input_files('label:has-text("Restore all saves") input[data-import]', str(path)); until(pg, 'button[data-restoreall="1"]', 10000, 'visible')
    if not pg.query_selector('button[data-restoreall="1"]'): fails.append('Restore all: no confirm button after choosing the file')
    else:
        check_text(pg, 'Restore all confirm')
        pg.click('button[data-restoreall="1"]'); on_tab(pg, 'story')  # restoreAll() writes the storage, then opens the Story tab
        got = pg.evaluate("[localStorage.getItem('boneash.auto'), localStorage.getItem('boneash.slot1'), localStorage.getItem('boneash.bak.5m'), localStorage.getItem('boneash.bak.before')]")
        if got[0] != auto0: fails.append(f'Restore all: the autosave differs ({scene_of(got[0]) if got[0] else None} vs {scene_of(auto0)})')
        elif got[1] != s1 or got[2] != b5: fails.append('Restore all: a slot or backup differs')
        elif not got[3]: fails.append('Restore all: no "before" backup of the game it replaced')
        else: notes.append('export all → restore all exact')
    # a backup restored from Saves
    open_saves(pg)
    if not pg.query_selector('button[data-bak="5m"]'): fails.append('Backups: no Restore button for the 5-minute backup')
    else:
        pg.click('button[data-bak="5m"]'); on_tab(pg, 'story')  # the backup is loaded and autosaved, then the Story tab
        a = pg.evaluate("[localStorage.getItem('boneash.auto'), localStorage.getItem('boneash.bak.before')]")
        if scene_of(a[0]) != scene_of(b5) or scene_of(a[1]) != scene_of(lf): fails.append(f'Backups: after restore the game is at {scene_of(a[0])}, before = {scene_of(a[1])}')
        else: notes.append('backup restored')
        check_text(pg, 'after a backup restore')

def picked(pg, url):
    """v0.11.32 (P2-a): a story choice picked before is recoloured; a task card and work stay as they were (Incremental Mode only since v0.11.34)."""
    import json
    st = json.loads((ROOT / 'saves/v0.8.5-day1-stream.json').read_text())
    st['picked'] = {'stream': [1, 5]}  # 1 = "Test the water" (a work card on this task screen), 5 = "Keep walking" (story)
    s = json.dumps(st)
    for sel in ('button.card.story',):
        fresh(pg, url, "a => { localStorage.clear(); localStorage.setItem('boneash.auto', a); }", s)
        where = 'Incremental Mode'
        walk = pg.query_selector(f'{sel}:has-text("Keep walking")')
        if not walk: fails.append(f'picked, {where}: the stream\'s "Keep walking" is missing'); continue
        col = walk.evaluate("e => [e.classList.contains('picked'), getComputedStyle(e).color, /picked before/.test(e.textContent)]")
        if col != [True, 'rgb(107, 90, 69)', True]: fails.append(f'picked, {where}: "Keep walking" not recoloured: {col}')
        n = len(pg.query_selector_all('#view .picked'))
        if n != 1: fails.append(f'picked, {where}: {n} recoloured buttons, expected 1 (the work card "Test the water" stays as it was)')
    if not any(f.startswith('picked') for f in fails): notes.append('picked choices recoloured, work left alone')

def music_line(pg, url):
    """v0.11.182 (RV1, TG4): the day's music line under a folded evening screen (the Wilds' night on Coil 2, read on Coil 1), in the named edition."""
    st = json.loads((ROOT / 'saves/v0.11.7-coil2-day1.json').read_text())
    st = json.loads(st['data']) if 'data' in st and isinstance(st.get('data'), str) else st
    st['scene'] = 'night'; st['combat'] = None; st['minutes'] = 1440 + 21 * 60 + 30
    st['coil']['n'] = 2; st['seen'] = {'night': 1}; st['lines'] = None
    js = ("import { SCENES } from './js/story/prologue.js'; import { sceneView } from './js/core/story.js';"
          "import { noteRead } from './js/story/again.js'; import { migrate, ensureBars } from './js/core/game.js';"
          "const st = JSON.parse(process.argv[1]); const c = ensureBars(migrate(JSON.parse(JSON.stringify(st)))); const read = {};"
          "noteRead({ read, coil: { n: 1 } }, sceneView(c, SCENES).text, 1); console.log(JSON.stringify(read));")
    st['read'] = json.loads(subprocess.run(['node', '--input-type=module', '-e', js, json.dumps(st)], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    fresh(pg, url, "a => { localStorage.clear(); localStorage.setItem('boneash.auto', a); localStorage.setItem('boneash.edition', 'named'); }", json.dumps(st))
    if not pg.query_selector('.prose.again'): fails.append('ML (TG4): the night read on Coil 1 did not fold'); return
    mu = pg.query_selector('.prose.again p.music')
    if not mu or len(mu.inner_text().strip()) < 20: fails.append('ML (TG4): no music line under the folded night'); return
    t0 = mu.inner_text(); pg.reload(); until(pg, '.main-menu', 10000, 'attached'); enter(pg)
    mu2 = pg.query_selector('.prose p.music')
    if not mu2 or mu2.inner_text() != t0: fails.append('ML (TG4): the line changed or went on a reload of the same visit')
    else: notes.append('the music line under a folded screen, the same after a reload')

def again(pg, url):
    """v0.11.35 (P1-a): a scene read in an earlier Coil folds under a memory line; Read it all again opens it; Skip to the next choice
    walks the stretch at once (night_won → morning → the wilds) and lands on the task screen."""
    st = json.loads((ROOT / 'saves/v0.11.7-coil2-day1.json').read_text())
    st = json.loads(st['data']) if 'data' in st and isinstance(st.get('data'), str) else st
    st['scene'] = 'night_won'; st['combat'] = None
    st['flags'].update({'long': True, 'forest_day': 2}); st['minutes'] = 1440 + 22 * 60 + 360
    st['coil']['n'] = 2; st['seen'] = {'night_won': 1, 'morning': 1, 'wilds': 1, 'arrival': 1}
    # v0.11.133 (FP2): a fold needs every paragraph read on an earlier Coil: the record Coil 1 left, from the game's own code
    js = ("import { SCENES } from './js/story/prologue.js'; import { sceneView, choose } from './js/core/story.js';"
          "import { noteRead } from './js/story/again.js'; import { migrate, ensureBars } from './js/core/game.js';"
          "const st = JSON.parse(process.argv[1]); const c = ensureBars(migrate(JSON.parse(JSON.stringify(st)))); const read = {};"
          "const g = { read, coil: { n: 1 } };"
          "for (let k = 0; k < 3 && c.scene !== 'wilds'; k++) { noteRead(g, sceneView(c, SCENES).text, 1); choose(c, SCENES, sceneView(c, SCENES).choices.filter((x) => !x.disabled)[0].index); }"
          "console.log(JSON.stringify(read));")
    st['read'] = json.loads(subprocess.run(['node', '--input-type=module', '-e', js, json.dumps(st)], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    fresh(pg, url, "a => { localStorage.clear(); localStorage.setItem('boneash.auto', a); }", json.dumps(st))
    mem = pg.query_selector('.prose.again .memory')
    if not mem: fails.append('again: no memory line on a scene read before'); return
    rd = pg.query_selector('button.readall')
    if not rd: fails.append('again: no Read it all again'); return
    n0 = len(pg.query_selector_all('.prose.again > p'))
    tap(pg, rd); until(pg, '!document.querySelector("button.readall")', 3000)
    n1 = len(pg.query_selector_all('.prose.again > p'))
    if not (n1 > n0): fails.append(f'again: Read it all again showed nothing more ({n0} → {n1} paragraphs)')
    sk = pg.query_selector('button.card.skip[data-skip]')
    if not sk or '2 scenes' not in sk.inner_text(): fails.append('again: no Skip to the next choice (2 scenes)'); return
    tap(pg, sk); until(pg, "JSON.parse(JSON.parse(localStorage.getItem('boneash.auto')).data || localStorage.getItem('boneash.auto')).scene === 'wilds'", 5000)
    raw = pg.evaluate("localStorage.getItem('boneash.auto')"); o = json.loads(raw); o = json.loads(o['data']) if isinstance(o.get('data'), str) else o
    if o.get('scene') != 'wilds': fails.append(f'again: the skip ended on {o.get("scene")}, not the wilds')
    else:  # v0.11.133 (FP2, RF1): the screen records what it shows, but only screens that can fold; a reload saves the game on close
        def saved():
            pg.reload(); pg.wait_for_load_state('load'); time.sleep(0.5)
            r = json.loads(pg.evaluate("localStorage.getItem('boneash.auto')")); return json.loads(r['data']) if isinstance(r.get('data'), str) else r
        r2 = saved()
        # RF1 (M2): the wilds is a task screen: none of its paragraphs recorded (v0.11.214, RD1: the skip's result lines are, as every tap's)
        hub_ok = pg.evaluate("""async (r) => { const { SCENES } = await import('./js/story/prologue.js'); const { sceneView } = await import('./js/core/story.js');
            const { paraKey } = await import('./js/story/again.js'); const { migrate, ensureBars } = await import('./js/core/game.js');
            const g = ensureBars(migrate(JSON.parse(JSON.stringify(r)))); const ps = String(sceneView(g, SCENES).text).split(/\\n\\s*\\n/).map((p) => p.trim()).filter(Boolean);
            return ps.length > 0 && ps.every((p) => r.read?.[paraKey(p)] == null); }""", r2) and len(r2.get('read') or {}) >= len(st['read'])
        st2 = dict(st); st2['coil'] = dict(st['coil'], n=1); st2['read'] = {}; st2['seen'] = {'night_won': 1}
        fresh(pg, url, "a => { localStorage.clear(); localStorage.setItem('boneash.auto', a); }", json.dumps(st2))
        r3 = saved()
        if not hub_ok: fails.append(f'RF1 (M2): the wilds (a task screen) added its paragraphs to the record ({len(st["read"])} → {len(r2.get("read") or {})})')
        elif len(r3.get('read') or {}) < 2: fails.append(f'FP2: the screen recorded no paragraph of night_won ({len(r3.get("read") or {})})')
        else: notes.append('a scene read before folds, reads in full, the skip walks to the wilds, and the screen records the scenes that can fold (not the task screens)')
    check_text(pg, 'after the skip', strict=True)

def split_fold(pg, url):
    """v0.11.229 (owner pick E2-2: FR; RV1, TG2): a one-paragraph scene read in an earlier Coil folds to its first sentence under a
    memory line; Read it all again opens the paragraph whole, as one paragraph, the first sentence not twice (far_won)."""
    st = json.loads((ROOT / 'saves/v0.11.7-coil2-day1.json').read_text())
    st = json.loads(st['data']) if 'data' in st and isinstance(st.get('data'), str) else st
    st['scene'] = 'far_won'; st['combat'] = None; st['flags'].update({'far_kind': 'wolves'}); st['minutes'] = 1440 + 10 * 60
    st['coil']['n'] = 2; st['seen'] = {'far_won': 1}; st.pop('lines', None)
    js = ("import { SCENES } from './js/story/prologue.js'; import { sceneView } from './js/core/story.js';"
          "import { noteRead, sentencesOf } from './js/story/again.js'; import { migrate, ensureBars } from './js/core/game.js';"
          "const st = JSON.parse(process.argv[1]); const c = ensureBars(migrate(JSON.parse(JSON.stringify(st)))); const read = {};"
          "const t = sceneView(c, SCENES).text; noteRead({ read, coil: { n: 1 } }, t, 1);"
          "console.log(JSON.stringify({ read, t, first: sentencesOf(t)[0] }));")
    o = json.loads(subprocess.run(['node', '--input-type=module', '-e', js, json.dumps(st)], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    st['read'] = o['read']
    fresh(pg, url, "a => { localStorage.clear(); localStorage.setItem('boneash.auto', a); }", json.dumps(st))
    ps = lambda: [e.inner_text().strip() for e in pg.query_selector_all('.prose.again > p:not(.memory):not(.music)')]
    rd = pg.query_selector('.prose.again button.readall')
    if '\n\n' in o['t'].strip() or not pg.query_selector('.prose.again .memory') or not rd:
        fails.append('FR (TG2): far_won read on Coil 1 should fold on Coil 2, with a memory line and Read it all again'); return
    p0 = ps()
    tap(pg, rd); until(pg, '!document.querySelector("button.readall")', 3000)
    p1 = ps()
    if p0 != [o['first']]: fails.append(f'FR (TG2): folded, the first sentence alone should show ({p0!r})')
    elif len(p1) != 1 or p1[0].count(o['first']) != 1 or len(p1[0]) <= len(o['first']): fails.append(f'FR (TG2): opened, the paragraph should show whole, once ({p1!r})')
    else: notes.append('FR (TG2): a one-paragraph scene read before folds to its first sentence and opens whole')

def lp2(pg, url):
    """v0.11.134 (owner pick LP2): QR, a reply already shown this Coil is not shown again (a card that fails twice: "You see what
    went wrong." under the text once, its Intuitive Aptitude gain in Results both times: two forage cards that fail); SV, a scene shown again with the same text
    right after an action that kept you there folds, with no memory line (the Bone Field's bone-meal, on Coil 1); RQ1: a save slot
    loaded on that scene shows it in full (a new visit)."""
    st = json.loads((ROOT / 'saves/v0.11.7-coil2-day1.json').read_text())
    st = json.loads(st['data']) if 'data' in st and isinstance(st.get('data'), str) else st
    st['combat'] = None; st['scene'] = 'wilds'; st.pop('lines', None)
    # two forage cards that both fail on this save (the game's checks have no dice): the same aptitude reply, from two cards
    fresh(pg, url, "a => { localStorage.clear(); localStorage.setItem('boneash.groups', JSON.stringify({ Forage: true })); localStorage.setItem('boneash.auto', a); }", json.dumps(st))
    replies, gains = [], []
    for k, cid in enumerate(['wild_forage:1', 'wild_forage:2']):
        el = pg.query_selector(f'button.card:not([disabled])[data-run="{cid}"]')
        if not el: fails.append(f'LP2 (QR): no {cid} card at the wilds (tap {k + 1})'); return
        n0 = len(pg.query_selector_all('.pane.results details.res'))
        tap(pg, el); until(pg, f'document.querySelectorAll(".pane.results details.res").length > {n0}', 3000)
        r = pg.query_selector('.prose.reply'); replies.append(r.inner_text() if r else '')
        top = pg.query_selector('.pane.results details.res'); gains.append(top.text_content() if top else '')
    if not ('You see what went wrong.' in replies[0] and 'You see what went wrong.' not in replies[1]):
        fails.append(f'LP2 (QR): the aptitude reply should show once in a Coil (first: {replies[0][:80]!r}, second: {replies[1][:80]!r})')
    elif not all('Intuitive Aptitude' in x for x in gains):
        fails.append(f'LP2 (QR): the aptitude gain should go to Results both times ({[x[:60] for x in gains]})')
    else: notes.append('LP2 (QR): a repeated reply shows once a Coil, its gain in Results each time')
    st2 = dict(st); st2['scene'] = 'bone_field'; st2['inventory'] = {k: v for k, v in (st.get('inventory') or {}).items() if k != 'bone_meal'}
    st2['coil'] = dict(st['coil'], n=1); st2['seen'] = {}; st2['read'] = {}
    fresh(pg, url, "a => { localStorage.clear(); localStorage.setItem('boneash.auto', a); }", json.dumps(st2))
    if pg.query_selector('.prose.again'): fails.append('LP2 (SV): the Bone Field folded on its first view'); return
    grind = next((e for e in pg.query_selector_all('button.card:not([disabled])[data-story]') if 'Grind a pouch' in e.inner_text()), None)
    if not grind: fails.append('LP2 (SV): no "Grind a pouch of old bone" choice at the Bone Field'); return
    tap(pg, grind); until(pg, 'document.querySelector(".prose.again") || !document.querySelector(".head .title") || document.querySelector(".head .title").textContent !== "The Bone Field"', 3000)
    title = pg.query_selector('.head .title'); title = title.inner_text() if title else ''
    if title != 'The Bone Field': fails.append(f'LP2 (SV): the bone-meal left the Bone Field ({title!r})')
    elif not pg.query_selector('.prose.again button.readall') or pg.query_selector('.prose.again .memory'):
        fails.append('LP2 (SV): the Bone Field shown again on the same visit should fold, with Read it all again and no memory line')
    else: notes.append('LP2 (SV): a scene shown again on the same visit folds, no memory line')
    check_text(pg, 'after the same-visit fold', strict=True)
    # RQ1 (TG): loading a save slot is a new visit: the same scene and text, in full
    pg.evaluate("localStorage.setItem('boneash.slot1', localStorage.getItem('boneash.auto'))")
    open_saves(pg)
    ld = pg.query_selector('button[data-load="1"]')
    if not ld: fails.append('RQ1 (TG): no Load button for slot 1'); return
    ld.click(); on_tab(pg, 'story')
    title = pg.query_selector('.head .title'); title = title.inner_text() if title else ''
    if title != 'The Bone Field' or pg.query_selector('.prose.again'): fails.append(f'RQ1 (TG): a slot loaded on the same scene should show it in full ({title!r}, folded: {bool(pg.query_selector(".prose.again"))})')
    else: notes.append('RQ1: a loaded slot shows the scene in full')

def hv1(pg, url):
    """v0.11.137 (owner pick HV1): the James tab lists the people with friendship and affection, the Village last with friendship
    only (VD), and no Old Hu (HD); a save holding Old Hu keeps his numbers after a reload."""
    st = json.loads((ROOT / 'saves/v0.11.7-coil2-day1.json').read_text())
    st = json.loads(st['data']) if 'data' in st and isinstance(st.get('data'), str) else st
    st['combat'] = None; st['scene'] = 'wilds'
    st['rel'] = {'Village': {'f': 44, 'a': 0}, 'Old Hu': {'f': 12, 'a': 0}, 'Mei Lin': {'f': 20, 'a': 11}, 'Yuki': {'f': 5, 'a': 2}}
    fresh(pg, url, "a => { localStorage.clear(); localStorage.setItem('boneash.auto', a); }", json.dumps(st))
    pg.click('#tabs [data-tab="sheet"]'); on_tab(pg, 'sheet')
    rows = pg.eval_on_selector_all('#view .row', "els => els.map(e => [...e.children].map(c => c.textContent.trim()))")
    people = [r for r in rows if len(r) >= 2 and r[0] in ('Village', 'Old Hu', 'Mei Lin', 'Yuki')]
    names = [r[0] for r in people]
    vil = next((r for r in people if r[0] == 'Village'), None)
    if 'Old Hu' in names: fails.append(f'HV1 (HD): Old Hu is still on the James tab ({names})')
    elif not vil or vil[1] != 'friendship 44': fails.append(f'HV1 (VD): the Village should show "friendship 44" only ({vil})')
    elif names[-1] != 'Village' or names[:2] != ['Mei Lin', 'Yuki']: fails.append(f'HV1 (VD): the people in their order, the Village last ({names})')
    elif next(r for r in people if r[0] == 'Mei Lin')[1] != 'friendship 20 · affection 11': fails.append('HV1: Mei Lin should keep both numbers')
    else:
        # Fable L1: make the game write its save first (a card at the wilds), so the check reads the game's save, not the one put in
        before = pg.evaluate("localStorage.getItem('boneash.auto')")
        pg.click('#tabs [data-tab="story"]'); on_tab(pg, 'story')
        card = next((e for e in pg.query_selector_all('button.card:not([disabled])[data-run]') if e.is_visible()), None)
        if not card: fails.append('HV1 (T): no card to play at the wilds'); return
        tap(pg, card); until(pg, f"localStorage.getItem('boneash.auto') !== {json.dumps(before)}", 5000)
        r = json.loads(pg.evaluate("localStorage.getItem('boneash.auto')")); r = json.loads(r['data']) if isinstance(r.get('data'), str) else r
        if pg.evaluate("localStorage.getItem('boneash.auto')") == before: fails.append('HV1 (T): the game never wrote its save after a card')
        elif (r.get('rel') or {}).get('Old Hu', {}).get('f') != 12: fails.append(f'HV1 (T): the save lost Old Hu\'s numbers ({(r.get("rel") or {}).get("Old Hu")})')
        else: notes.append('HV1: the James tab shows the Village last with friendship only and no Old Hu; the game\'s own save keeps his numbers')
    check_text(pg, 'the James tab (HV1)', strict=False)

def plan_rows(b, url):
    """v0.11.205 (owner pick P1, TG): the long calendar's Plan the week (saves/v0.11.204-long-wilds-day2.json, the wilds on Day 2):
    at 412 px (the owner's phone, two card columns) and at 360 px with 130% text, every row's − and + sits inside its row and is
    what a tap at its middle reaches (in v0.11.204 the next row's label lay over 8 of the 22 at 412 px), and one + adds a card."""
    save = (ROOT / 'saves/v0.11.204-long-wilds-day2.json').read_text()
    for w, size in ((412, 100), (360, 130)):
        ctx = b.new_context(viewport={'width': w, 'height': 800}, service_workers='block')
        pg = ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f"page error: {e}"))
        fresh(pg, url, "([s, z]) => { localStorage.clear(); localStorage.setItem('boneash.auto', s); localStorage.setItem('boneash.textsize', z); }", [save, str(size)])
        rows = pg.query_selector_all('.prow')
        if len(rows) < 8: fails.append(f'P1 ({w} px, {size}%): Plan the week shows {len(rows)} rows, not the wilds\' 8 or more'); ctx.close(); continue
        bad = []
        for r in rows:
            for bt in r.query_selector_all('button'):
                bt.evaluate("e => e.scrollIntoView({ block: 'center' })")
                ok = bt.evaluate("""e => { const q = e.getBoundingClientRect(), c = e.closest('.prow').getBoundingClientRect();
                    const at = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2);
                    return q.left >= c.left - 0.5 && q.right <= c.right + 0.5 && !!at && (at === e || e.contains(at)); }""")
                if not ok: bad.append(bt.get_attribute('aria-label'))
        if bad: fails.append(f'P1 ({w} px, {size}%): {len(bad)} plan buttons stick out of their row or lie under another ({bad[:3]})')
        else:
            plus = rows[0].query_selector('button[data-d="1"]'); n0 = rows[0].query_selector('.pn').inner_text() if rows[0].query_selector('.pn') else '?'
            plus.evaluate("e => e.scrollIntoView({ block: 'center' })"); plus.click()
            until(pg, f"(document.querySelector('.prow .pn')?.textContent || '') !== {json.dumps(n0)}", 3000)
            n1 = pg.query_selector('.prow .pn').inner_text() if pg.query_selector('.prow .pn') else '?'
            if n1 == n0: fails.append(f'P1 ({w} px, {size}%): + on the first row did not add a card ({n0} → {n1})')
            else: notes.append(f'P1: Plan the week at {w} px, {size}% text: every − and + inside its row and tappable; + added a card ({n0} → {n1})')
        check_text(pg, f'Plan the week ({w} px)', strict=False)
        ctx.close()

def week_read(save, card):
    """v0.11.214 (owner pick RD1): the save with every line its week would show (one `card` on the plan, the evenings' first way on,
    as the forecast takes them) noted as read, from the game's own code, so the plan runs as before RD1. v0.11.224 (TX2, TS6): and past a
    morning the plan stops on ('left': a night or morning whose text is new to the save, as the long calendar's new texts are), its first
    way on, as the browser run takes it."""
    js = ("import { SCENES } from './js/story/prologue.js'; import { sceneView } from './js/core/story.js';"
          "import { noteLines } from './js/story/again.js'; import { deserialize, serialize } from './js/core/game.js';"
          "import * as Wk from './js/core/week.js'; Wk.READ_CAP.n = Infinity;"  # v0.11.228 (RV1, L1a): the copy notes every line, so no cap there
          "const g = deserialize(process.argv[1], { force: true }); const c = JSON.parse(JSON.stringify(g)); Wk.planEnsure(c); Wk.planSet(c, process.argv[2], 1);"
          "for (let k = 0; k < 60; k++) { const r = Wk.runWeek(c, SCENES); if (r.stop !== 'read') { if (r.stop !== 'evening' && r.stop !== 'left') break; const i = Wk.eveningPick(c, SCENES); if (i == null) break; Wk.storyTap(c, SCENES, i); Wk.afterStory(c, SCENES); continue; } const u = Wk.readProbe(c, SCENES); noteLines(g, u.lines); noteLines(c, u.lines); }"
          "process.stdout.write(serialize(g));")
    return subprocess.run(['node', '--input-type=module', '-e', js, save, card], cwd=ROOT, capture_output=True, text=True, check=True).stdout

def rd1_ui(b, url):
    """v0.11.214 (owner pick RD1: RU + RB; RN1: NT + NL): on saves/v0.11.204-long-wilds-day2.json (no result lines read) one + on Forage's
    first row: the forecast stops for a text not read yet; Run the week stops before the card and names it; the card tapped by hand counts
    as the plan's step (its row back to 0) and its lines are read; Run the week again goes past it."""
    save = (ROOT / 'saves/v0.11.204-long-wilds-day2.json').read_text()
    ctx = b.new_context(viewport={'width': 412, 'height': 800}, service_workers='block')
    pg = ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f"page error: {e}"))
    state = "() => { const o = JSON.parse(localStorage.getItem('boneash.auto')); return JSON.parse(o.data || JSON.stringify(o)); }"
    try:
        fresh(pg, url, "s => { localStorage.clear(); localStorage.setItem('boneash.auto', s); }", save)
        plus = pg.query_selector('button[data-plan="wild_forage:0"][data-d="1"]')
        if not plus: fails.append('RD1: no + on the Forage row of Plan the week'); return
        plus.evaluate("e => e.scrollIntoView({ block: 'center' })"); plus.click()
        until(pg, "() => /Forecast: /.test(document.body.innerText)", 5000)
        txt = pg.evaluate("document.body.innerText")
        if 'a card with text you have not read yet' not in txt: fails.append('RD1: the forecast does not stop for the card not read yet'); return
        n0 = pg.evaluate("localStorage.getItem('boneash.auto')")
        run = pg.query_selector('button[data-week="run"]'); run.evaluate("e => e.scrollIntoView({ block: 'center' })"); run.click()
        until(pg, "b => localStorage.getItem('boneash.auto') !== b", 8000, arg=n0)
        st = pg.evaluate(state); p = (st.get('tasks') or {}).get('plan') or {}
        txt = pg.evaluate("document.body.innerText")
        m = re.search(r'The week stops here: a card with text you have not read yet \(([^)]+)\)\. Tap it yourself, then run the week again\.', txt)
        if p.get('stop') != 'read' or p.get('read') != 'wild_forage:0' or not m or st.get('minutes') != 1840:
            fails.append(f"RD1: Run the week did not stop before the Forage card (stop {p.get('stop')}, card {p.get('read')}, minutes {st.get('minutes')}, line {bool(m)})"); return
        k0 = len(st.get('read') or {}); card = pg.query_selector('button.card[data-run="wild_forage:0"]')
        if not card: fails.append('RD1: the card it stopped for is not on the hub'); return
        n0 = pg.evaluate("localStorage.getItem('boneash.auto')"); time.sleep(GUARD); card.evaluate("e => e.click()"); until(pg, "b => localStorage.getItem('boneash.auto') !== b", 8000, arg=n0)  # the card may sit in a closed group: clicked as the page would
        st = pg.evaluate(state); p = (st.get('tasks') or {}).get('plan') or {}
        if (p.get('items') or {}).get('wild_forage:0') or p.get('read') or len(st.get('read') or {}) <= k0:
            fails.append(f"RD1 (NT): the tap did not count as the plan's step or was not read (row {(p.get('items') or {}).get('wild_forage:0')}, stop card {p.get('read')}, read {k0} → {len(st.get('read') or {})})"); return
        n0 = pg.evaluate("localStorage.getItem('boneash.auto')")
        run = pg.query_selector('button[data-week="run"]'); run.evaluate("e => e.scrollIntoView({ block: 'center' })"); run.click()
        until(pg, "b => localStorage.getItem('boneash.auto') !== b", 8000, arg=n0)
        st = pg.evaluate(state); p = (st.get('tasks') or {}).get('plan') or {}
        if p.get('read') == 'wild_forage:0': fails.append('RD1: after the tap the plan stopped for the same card again')
        else: notes.append(f"RD1: the plan stopped before the Forage card ({m.group(1)[:40]}), the tap counted and was read ({k0} → more), the next run went past it (stop {p.get('stop')})")
        check_text(pg, 'the read stop (RD1)', strict=False)
    finally:
        ctx.close()

def plan_forecast(b, url):
    """v0.11.206 (owner pick FC1, the test that the forecast equals the run): on saves/v0.11.204-long-wilds-day2.json (the wilds on
    Day 2 06:40, Fed 42, no food) one + on Forage's first row shows its finish and the outlook; Run the week, then the night's
    first way on (the forecast's own pick, E4), runs to where the forecast said: the same stop, the same minute, the same Fed and HP."""
    save = week_read((ROOT / 'saves/v0.11.204-long-wilds-day2.json').read_text(), 'wild_forage:0')  # v0.11.214 (RD1): the week's lines read, so the run is FC1's
    ctx = b.new_context(viewport={'width': 412, 'height': 800}, service_workers='block')
    pg = ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f"page error: {e}"))
    try:
        fresh(pg, url, "s => { localStorage.clear(); localStorage.setItem('boneash.auto', s); }", save)
        plus = pg.query_selector('button[data-plan="wild_forage:0"][data-d="1"]')
        if not plus: fails.append('FC1: no + on the Forage row of Plan the week'); return
        plus.evaluate("e => e.scrollIntoView({ block: 'center' })"); plus.click()
        until(pg, "() => /Forecast: /.test(document.body.innerText) && /done Day|not this week/.test(document.body.innerText)", 5000)
        txt = pg.evaluate("document.body.innerText")
        m = re.search(r'Forecast: it (?:stops|runs to the week\'s end) \(?(Day \d+ \d\d:\d\d)\)?:? ?([^.]*)\.(?: Fed (\d+), HP (\d+)/(\d+) then\.)?', txt)
        row = re.search(r'a card · (done Day \d+ \d\d:\d\d|not this week)', txt)
        tot = re.search(r'Cards ([^;]+); ([^.]+) left to the evenings this week\.', txt)
        if not (m and row and tot): fails.append(f'FC1: the plan shows no forecast after a + (outlook {bool(m)}, row {bool(row)}, total {bool(tot)})'); return
        want = (m.group(1), m.group(3), m.group(4))
        # v0.11.209 (owner pick TF1, K): the plan's own row for "Smoke the catch.", once a day, with its + (the save has no raw food: the card itself not on the hub)
        pres = pg.query_selector('button[data-plan="med:pres"][data-d="1"]')
        if not pres or 'Smoke the catch, once a day' not in txt or 'Smoke the catch.' in pg.eval_on_selector_all('button.card', "els => els.map(e => e.textContent).join('|')"):
            fails.append('TF1: Plan the week has no "Smoke the catch, once a day" row with a +, or the hub shows the card with no raw food')
        run = pg.query_selector('button[data-week="run"]'); run.evaluate("e => e.scrollIntoView({ block: 'center' })"); run.click()
        for _ in range(12):  # the evening's choices, the forecast's pick each time (the lowest way on), until the plan stops elsewhere
            until(pg, "() => !!document.querySelector('button.card.story[data-story]:not([disabled])') || !!document.querySelector('button[data-week=\"run\"]')", 5000)
            st = json.loads(pg.evaluate("localStorage.getItem('boneash.auto')")); st = json.loads(st['data']) if isinstance(st.get('data'), str) else st
            if st.get('scene') == 'wilds': break
            ids = sorted(int(x) for x in pg.eval_on_selector_all('button.card.story[data-story]:not([disabled])', "els => els.filter(e => !/^(Yuki: change form|Story Mode only)/.test(e.textContent)).map(e => e.dataset.story)") if int(x) < 1000)
            if not ids: break
            before = pg.evaluate("localStorage.getItem('boneash.auto')")
            tap(pg, pg.query_selector(f'button.card.story[data-story="{ids[0]}"]'))
            until(pg, "b => localStorage.getItem('boneash.auto') !== b", 8000, arg=before)
        st = json.loads(pg.evaluate("localStorage.getItem('boneash.auto')")); st = json.loads(st['data']) if isinstance(st.get('data'), str) else st
        mins = st.get('minutes', 0); d, hh, mm = mins // 1440 + 1, (mins % 1440) // 60, mins % 60
        got = (f'Day {d} {hh:02d}:{mm:02d}', str(round(st['james']['satiety'])), str(round(st['james']['hp'])))
        stop = ((st.get('tasks') or {}).get('plan') or {}).get('stop')
        if got != want or stop != 'hungry': fails.append(f'FC1: the forecast said {want} ({m.group(2)}), the run reached {got}, stop {stop}')
        else: notes.append(f'FC1: the forecast ({row.group(1)}; cards {tot.group(1)}, {tot.group(2)} to the evenings; stops {want[0]}, {m.group(2)}, Fed {want[1]}, HP {want[2]}) is where Run the week stopped')
        check_text(pg, 'the plan\'s forecast (FC1)', strict=False)
    finally:
        ctx.close()

def poll(pg, js, ms=20000):
    """v0.11.39: evaluate js (may return a promise) until it is truthy; the last value (falsy when the time ran out)."""
    end = time.time() + ms / 1000; v = None
    while time.time() < end:
        try: v = pg.evaluate(js)
        except Exception: v = None
        if v: return v
        time.sleep(0.1)
    return v

def update_test(b):
    """v0.11.39 (Z2-b), part 3: the service worker for real (served under /bone-and-ash/ like GitHub Pages).
    0. a phone on today's 0.11.38 worker (tests/fixtures/sw-0.11.38.js: every picture in its version cache, no art cache);
    1. the update to Z2-b: the old cache goes, every art file is downloaded exactly once into 'boneash-art', pictures served from it;
    2. a new version with one picture replaced (same name, new fingerprint): only that picture is downloaded, its old copy pruned;
    3. a version whose fingerprint does not match the file (a stale copy from a proxy): the install fails, the working version stays;
    4. a picture missing from the art cache is fetched and stored again; 5. the replaced picture is served offline."""
    import functools, http.server, shutil, tempfile, threading
    tmp = Path(tempfile.mkdtemp(prefix='boneash-sw-')); site = tmp / 'bone-and-ash'
    shutil.copytree(ROOT, site, ignore=shutil.ignore_patterns('.git', 'node_modules', 'tests', 'tools', 'saves', 'project', '__pycache__'))
    log = []
    class H(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def do_GET(self): log.append(self.path.split('?')[0]); super().do_GET()
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(H, directory=str(tmp)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{srv.server_port}/bone-and-ash/'
    sw = (site / 'sw.js').read_text()
    art = dict(re.findall(r"'((?:art|icons|css/fonts)/[^']+)': '([0-9a-f]+)'", sw))  # v0.11.149 (FN1): the fonts are in the art cache too
    ver = re.search(r"const VERSION = '([^']+)'", sw).group(1)
    def with_version(text, v): return text.replace(f"const VERSION = '{ver}'", f"const VERSION = '{v}'")
    art_hits = lambda: [x for x in log if re.match(r'^/bone-and-ash/(art/.*\.(jpg|png|svg|webp)|icons/|css/fonts/.*\.woff2?$)', x)]
    entries = "async () => (await (await caches.open('boneash-art')).keys()).map(r => r.url.replace(location.origin, ''))"
    def update_to(pg, v, ms=20000):
        log.clear(); pg.evaluate("navigator.serviceWorker.getRegistration().then(r => r.update())")
        # v0.11.149 (PX1, AW): and the new worker fully activated, nothing installing or waiting: its activate step prunes the art
        # cache after it deletes the old version cache, so the old-cache test alone could pass in between (an old picture still there)
        return poll(pg, f"Promise.all([caches.keys(), navigator.serviceWorker.getRegistration()]).then(([k, r]) => k.includes('{v}') && k.includes('boneash-art') && k.filter(x => /^bone-ash-/.test(x)).length === 1 && !!r && !r.installing && !r.waiting && !!r.active && r.active.state === 'activated')", ms)
    def bad(msg): fails.append(f'update: {msg}')
    try:
        ctx = b.new_context(viewport={'width': 390, 'height': 844})
        pg = ctx.new_page(); pg.on('pageerror', lambda e: bad(f'page error: {e}'))
        # 0. today's phones: the 0.11.38 worker
        (site / 'sw.js').write_text((ROOT / 'tests/fixtures/sw-0.11.38.js').read_text())
        pg.goto(base + 'index.html')
        if not poll(pg, "caches.open('bone-ash-0.11.38').then(c => c.match('art/pic/james.webp')).then(r => !!r)"): bad('the 0.11.38 worker did not cache its pictures'); return
        pg.reload(); poll(pg, "navigator.serviceWorker.controller ? 1 : 0", 10000)
        # v0.11.149 (FX1, PF): let the page's own requests (the fonts through the old worker, which caches without waiting) and the
        # navigation's update check settle first, so a late write can't bring the old cache back after the update deleted it
        pg.wait_for_load_state('networkidle'); pg.evaluate("document.fonts.ready.then(() => navigator.serviceWorker.getRegistration()).then((r) => r && r.update()).then(() => 1, () => 1)")
        # 1. the update to this version (Z2-b)
        (site / 'sw.js').write_text(with_version(sw, 'bone-ash-9.9.8'))
        if not update_to(pg, 'bone-ash-9.9.8'):
            state = pg.evaluate("navigator.serviceWorker.getRegistration().then((r) => r ? [r.installing?.state, r.waiting?.state, r.active?.state].map(String).join(' / ') : 'none')")
            bad(f'the update from 0.11.38 never took over (caches {pg.evaluate("caches.keys()")}; installing / waiting / active: {state}; sw.js fetched {log.count("/bone-and-ash/sw.js")}×)'); return
        # v0.11.150 (BL1, VN): the page opened under 0.11.38's worker; the new version's takeover shows the notice, Reload, no Download
        if not poll(pg, "(() => { const n = document.getElementById('notebar'); return !!n && !n.hidden && n.textContent.includes('Version 9.9.8 is ready') && !n.querySelector('[data-note=reload]').hidden && n.querySelector('[data-note=export]').hidden; })()", 5000):
            bad(f'VN: no "Version 9.9.8 is ready" notice with Reload after the takeover (bar: {pg.evaluate("document.getElementById(\'notebar\')?.hidden")}, {pg.evaluate("document.getElementById(\'notebar\')?.textContent")!r})')
        have = pg.evaluate(entries); hits = art_hits()
        if len(have) != len(art) or sorted(hits) != sorted('/bone-and-ash/' + f for f in art): bad(f'from 0.11.38: {len(have)} art files cached, {len(hits)} downloaded ({len(set(hits))} distinct), expected {len(art)} each once')
        log.clear()
        if pg.evaluate("fetch('art/pic/james.webp').then(r => r.status)") != 200 or art_hits(): bad(f'a cached picture went to the network ({art_hits()})')
        if pg.evaluate("fetch('css/fonts/Literata.woff').then(r => r.status)") != 200 or art_hits(): bad(f'a cached font went to the network ({art_hits()})')  # v0.11.149 (FX1, FL)
        # 2. one picture replaced, same name
        changed, donor = 'art/pic/ridge.webp', 'art/pic/hollow.webp'
        shutil.copyfile(site / donor, site / changed)
        new_fp = art[donor]
        sw2 = with_version(sw, 'bone-ash-9.9.9').replace(f"'{changed}': '{art[changed]}'", f"'{changed}': '{new_fp}'")
        (site / 'sw.js').write_text(sw2)
        if not update_to(pg, 'bone-ash-9.9.9'): bad(f'the next version never took over (caches {pg.evaluate("caches.keys()")})'); return
        if sorted(set(art_hits())) != ['/bone-and-ash/' + changed]: bad(f'art downloaded on the update {sorted(set(art_hits()))}, expected only {changed}')
        have = pg.evaluate(entries)
        if f'/bone-and-ash/{changed}?v={new_fp}' not in have or f'/bone-and-ash/{changed}?v={art[changed]}' in have or len(have) != len(art):
            bad(f'the art cache after the update holds {len(have)} files, {changed}: ' + ', '.join(h for h in have if 'ridge' in h))
        # 3. a stale copy: the fingerprint in sw.js does not match the file served; the install must fail and 9.9.9 stay
        stale = 'art/pic/hairpin.webp'
        (site / 'sw.js').write_text(sw2.replace("bone-ash-9.9.9", "bone-ash-9.9.10").replace(f"'{stale}': '{art[stale]}'", f"'{stale}': 'deadbeef00'"))
        log.clear(); pg.evaluate("navigator.serviceWorker.getRegistration().then(r => r.update())")
        end = time.time() + 10
        while '/bone-and-ash/' + stale not in log and time.time() < end: time.sleep(0.05)  # the new worker's install has fetched the file
        settled = poll(pg, "navigator.serviceWorker.getRegistration().then(r => !r.installing && !r.waiting)", 10000)
        tried = '/bone-and-ash/' + stale in log
        have = pg.evaluate(entries); keys = pg.evaluate("caches.keys()")
        if not (settled and tried) or 'bone-ash-9.9.9' not in keys or any('deadbeef00' in h for h in have) or f'/bone-and-ash/{stale}?v={art[stale]}' not in have:
            bad(f'a stale file: settled {bool(settled)}, fetched {tried}, caches {keys}, stored under the bogus fingerprint {any("deadbeef00" in h for h in have)}')
        (site / 'sw.js').write_text(sw2)  # back to 9.9.9 on the server
        # 4. a picture missing from the art cache (evicted): fetched again and stored again
        pg.evaluate(f"caches.open('boneash-art').then(c => c.delete('art/pic/james.webp?v={art['art/pic/james.webp']}'))")
        log.clear()
        st = pg.evaluate("fetch('art/pic/james.webp').then(r => r.status)")
        back = poll(pg, f"caches.open('boneash-art').then(c => c.match('art/pic/james.webp?v={art['art/pic/james.webp']}')).then(r => !!r)", 5000)
        if st != 200 or '/bone-and-ash/art/pic/james.webp' not in log or not back: bad(f'a miss: status {st}, fetched {"/bone-and-ash/art/pic/james.webp" in log}, stored again {bool(back)}')
        # 5. offline
        ctx.set_offline(True)
        size = pg.evaluate(f"fetch('{changed}').then(r => r.ok ? r.arrayBuffer().then(a => a.byteLength) : -r.status).catch(e => String(e))")
        if size != (site / donor).stat().st_size: bad(f'offline, {changed} gave {size}, not the new file ({(site / donor).stat().st_size} bytes)')
        fsize = pg.evaluate("fetch('css/fonts/ShipporiMincho-ExtraBold.woff').then(r => r.ok ? r.arrayBuffer().then(a => a.byteLength) : -r.status).catch(e => String(e))")  # v0.11.149 (FX1, FL)
        if fsize != (site / 'css/fonts/ShipporiMincho-ExtraBold.woff').stat().st_size: bad(f'offline, the ExtraBold font gave {fsize}')
        ctx.set_offline(False)
        # v0.11.150 (BL1, VN + WN): Reload saves and opens the new version: its label, no notice, and What's new since 0.11.38
        pg.click('#notebar [data-note="reload"]'); pg.wait_for_load_state('load'); pg.wait_for_load_state('networkidle')  # PF: the page's own requests settle first
        poll(pg, "document.getElementById('menuVer')?.textContent === '9.9.9' ? 1 : 0", 10000)
        lbl = pg.evaluate("document.getElementById('menuVer')?.textContent")
        box = pg.eval_on_selector_all('.wnew-box li b', 'els => els.map(e => e.textContent)')
        saved = pg.evaluate("!!localStorage.getItem('boneash.auto')")
        if lbl != '9.9.9' or not pg.evaluate("document.getElementById('notebar').hidden") or not box or pg.evaluate("localStorage.getItem('boneash.seen')") != '9.9.9' or not saved:
            bad(f'VN: after Reload the label {lbl!r}, the bar hidden {pg.evaluate("document.getElementById(\'notebar\').hidden")}, What\'s new {box}, kept {pg.evaluate("localStorage.getItem(\'boneash.seen\')")!r}, saved {saved}')
        # v0.11.150 (RW1, NT): a page opened online already runs the new files: the takeover that follows shows no notice
        (site / 'sw.js').write_text(sw2.replace('bone-ash-9.9.9', 'bone-ash-9.9.11'))
        pg.reload(); pg.wait_for_load_state('load'); pg.wait_for_load_state('networkidle')
        if not update_to(pg, 'bone-ash-9.9.11', 30000): bad(f'NT: 9.9.11 never took over (caches {pg.evaluate("caches.keys()")})')
        pg.wait_for_timeout(600)
        nt = pg.evaluate("[document.getElementById('menuVer')?.textContent, document.getElementById('notebar').hidden]")
        if nt != ['9.9.11', True]: bad(f'NT: a page already on the arriving version: label and bar hidden {nt}, expected 9.9.11 and no notice')
        # v0.11.150 (RW1, OL): offline the label comes from the cache's name (sw.js is not cached by the worker)
        ctx.set_offline(True)
        pg.reload(); pg.wait_for_load_state('load')
        poll(pg, "document.getElementById('menuVer')?.textContent === '9.9.11' ? 1 : 0", 8000)
        ol = pg.evaluate("document.getElementById('menuVer')?.textContent")
        if ol != '9.9.11': bad(f'OL: offline the menu says {ol!r}, not 9.9.11')
        ctx.set_offline(False)
        if not any(f for f in fails if f.startswith('update')): notes.append('VN: the takeover\'s notice with Reload; Reload saved, opened 9.9.9 and showed What\'s new; a page already on the arriving version: no notice; offline the label from the cache')
        if not any(f for f in fails if f.startswith('update')): notes.append(f'update: from 0.11.38 every art file once ({len(art)}); a new version downloaded only the 1 changed picture, old copy pruned; a stale file rejected (the install failed, the version stayed); a miss stored again; served offline (a font too)')
        ctx.close()
    finally:
        srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)

def wide_layout(b, url):
    """v0.11.208 (owner pick PC3): the PC layout from 1100 px (saves/v0.11.7-long-forest-coil2.json, the Long Forest camp, 24 cards):
    three columns (story, cards, Results), the switch hidden; at 1366x768 at least 10 cards whole on the first screen and Results
    in view (11 when built), at 1920x1080 all 24; the cards scroll on their own under the pinned status bar and the last card is
    what a tap at its middle reaches; at 130% text the cards still start under the status bar; no sideways scroll; the James
    tab's page sits where it did in the old 44 rem column, centred; at 1099 px the screen is today's single column."""
    save = (ROOT / 'saves/v0.11.7-long-forest-coil2.json').read_text()
    for w, h, size, need in ((1366, 768, 100, 10), (1920, 1080, 100, 24), (1366, 768, 130, 0), (1099, 768, 100, -1)):
        ctx = b.new_context(viewport={'width': w, 'height': h}, service_workers='block')
        pg = ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f"page error: {e}"))
        fresh(pg, url, "([s, z]) => { localStorage.clear(); localStorage.setItem('boneash.auto', s); localStorage.setItem('boneash.textsize', z); }", [save, str(size)])
        where = f'PC3 ({w}x{h}, {size}%)'
        m = pg.evaluate("""() => {
            const q = (s) => document.querySelector(s), r = (s) => q(s)?.getBoundingClientRect();
            const sec = q('#view > section'), st = r('.status'), tb = r('#tabs'), bl = r('.below'), res = r('.pane.results'), tk = r('.pane.tasks'), pl = r('.plate');
            const whole = [...document.querySelectorAll('#view .card')].filter((c) => { const k = c.getBoundingClientRect();
                return k.height > 0 && k.top >= st.bottom - 1 && k.bottom <= tb.top + 1 && k.top >= bl.top - 1 && k.bottom <= bl.bottom + 1; }).length;
            return { grid: getComputedStyle(sec).display === 'grid', whole, cards: document.querySelectorAll('#view .card').length,
                cols: pl && tk && res ? [pl.left, tk.left, res.left].map(Math.round) : null, resIn: !!res && res.height > 0 && res.top < tb.top - 40 && res.right <= innerWidth + 1,
                sw: getComputedStyle(q('.panel-switch')).display, below: bl ? [Math.round(bl.top), Math.round(st.bottom)] : null,
                hs: document.documentElement.scrollWidth > innerWidth }; }""")
        if m['hs']: fails.append(f'{where}: the page scrolls sideways')
        if need < 0:
            if m['grid']: fails.append(f'{where}: under 1100 px the screen is not the single column')
            ctx.close(); continue
        if not m['grid'] or m['sw'] != 'none' or not m['cols'] or not (m['cols'][0] < m['cols'][1] < m['cols'][2]):
            fails.append(f'{where}: not three columns (grid {m["grid"]}, switch {m["sw"]}, lefts {m["cols"]})'); ctx.close(); continue
        if m['below'][0] < m['below'][1] - 1: fails.append(f'{where}: the cards start under the status bar ({m["below"]})')
        if m['whole'] < need: fails.append(f'{where}: {m["whole"]} of {m["cards"]} cards whole on the first screen, not {need}')
        if not m['resIn']: fails.append(f'{where}: Results not in view')
        last = pg.evaluate("""() => { const b = document.querySelector('.below'); b.scrollTop = b.scrollHeight;
            const c = [...b.querySelectorAll('.card')].filter((e) => e.getBoundingClientRect().height).pop(); const k = c.getBoundingClientRect();
            const at = document.elementFromPoint(k.left + k.width / 2, k.top + k.height / 2); return [scrollY, !!at && (at === c || c.contains(at))]; }""")
        if last[0] != 0 or not last[1]: fails.append(f'{where}: the cards do not scroll on their own, or the last card lies under something (page scrollY, hit) = {last}')
        if size == 100 and w == 1366:
            pg.click('[data-tab="sheet"]'); on_tab(pg, 'sheet')
            off = pg.evaluate("() => { const p = document.querySelector('#view > section.page').getBoundingClientRect(); const rem = parseFloat(getComputedStyle(document.documentElement).fontSize); return Math.round(p.left - (innerWidth - 44 * rem) / 2); }")
            if abs(off) > 1: fails.append(f'{where}: the James tab is {off} px off the old centred column')
        if size == 100 and w == 1366 and not any(f.startswith('PC3') for f in fails):
            notes.append(f'PC3: three columns from 1100 px, {m["whole"]} of {m["cards"]} cards on the first screen at 1366x768, Results in view, the other tabs centred')
        ctx.close()

def n1_ui(b, url):
    """v0.11.210 (owner pick N1): SC, a tap in the PC's cards column keeps its scroll (the day-2 save at 1366x768: a + on the plan's
    rows kept the column where it was, 682 px, not 0; a work card too; at 412 px the page's scroll as before); DC-a, Plan the week
    shows Yuki's row at 1; MS, Continue from a scrolled main menu opens the game at its own place (the top on a first entry), not
    the menu's (35 px at 1366x768, 130%, in v0.11.209); TT, a tooltip at most 28 rem wide on a PC (was the whole width)."""
    save = (ROOT / 'saves/v0.11.204-long-wilds-day2.json').read_text()
    for w, h in ((1366, 768), (412, 800)):
        ctx = b.new_context(viewport={'width': w, 'height': h}, service_workers='block')
        pg = ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f"page error: {e}"))
        try:
            fresh(pg, url, "s => { localStorage.clear(); localStorage.setItem('boneash.auto', s); }", save)
            where = f'N1 ({w}x{h})'
            yk = pg.query_selector('button[data-plan="door:yk_time"][data-d="1"]')
            row = yk.evaluate("e => [e.closest('.prow').querySelector('.pl')?.textContent || '', e.closest('.prow').querySelector('.pn')?.textContent || '']") if yk else ['', '']
            if not yk or not row[0].startswith('Sit with Yuki.') or row[1] != '1':
                fails.append(f'{where} (DC-a): Plan the week has no "Sit with Yuki." row at 1 ({row[:80]!r})')
            pos = "() => { const b = document.querySelector('#view .below'); return [Math.round(scrollY), b ? Math.round(b.scrollTop) : 0]; }"
            ok = True
            for sel in ('button[data-plan="med:sit"][data-d="1"]', 'button[data-plan="med:mer"][data-d="1"]'):
                e = pg.query_selector(sel); e.evaluate("e => e.scrollIntoView({ block: 'center' })"); pg.wait_for_timeout(100)
                before = pg.evaluate(pos); n0 = pg.evaluate("localStorage.getItem('boneash.auto')"); e.click()
                until(pg, "b => localStorage.getItem('boneash.auto') !== b", 3000, arg=n0); pg.wait_for_timeout(100)
                after = pg.evaluate(pos)
                k = 1 if w >= 1100 else 0
                if before[k] < 100 or abs(after[k] - before[k]) > 2: ok = False; fails.append(f'{where} (SC): a + on {sel} moved the {"cards column" if k else "page"} {before[k]} → {after[k]} px')
            if w >= 1100:
                if ok: notes.append(f'N1 (SC): a + on the plan keeps the cards column at {after[1]} px at {w}x{h}; Yuki\'s row at 1 (DC-a)')
                # TT: hold a card for its tooltip
                c = pg.evaluate_handle("() => [...document.querySelectorAll('#view button.card:not([disabled])[data-run]')].find((e) => e.checkVisibility())").as_element()
                c.evaluate("e => e.scrollIntoView({ block: 'center' })"); pg.wait_for_timeout(200)
                bb = c.bounding_box(); pg.mouse.move(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2); pg.mouse.down(); pg.wait_for_timeout(750); pg.mouse.up(); until(pg, '#tip', 3000, 'visible')
                tw = pg.evaluate("() => { const t = document.querySelector('#tip'); return t && !t.hidden ? [Math.round(t.getBoundingClientRect().width), parseFloat(getComputedStyle(document.documentElement).fontSize)] : null; }")
                if not tw or tw[0] > 28 * tw[1] + 1: fails.append(f'{where} (TT): the tooltip is {tw} wide (px, rem), not at most 28 rem')
        finally:
            ctx.close()
    # RV1 (M1, TG1): a new screen starts at the top (the wilds at 16:30, the column scrolled, then "Make camp for the night.": Camp
    # opened at 372 px, its bottom, before RV1); RV1 (L6): the column comes back after the menu and Continue
    ctx = b.new_context(viewport={'width': 1366, 'height': 420}, service_workers='block')
    pg = ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f"page error: {e}"))
    try:
        fresh(pg, url, "s => { localStorage.clear(); localStorage.setItem('boneash.auto', s); }", (ROOT / 'saves/v0.11.210-long-wilds-evening.json').read_text())
        col = "() => { const b = document.querySelector('#view .below'); return b ? [Math.round(b.scrollTop), b.scrollHeight - b.clientHeight] : [-1, -1]; }"
        y0 = pg.evaluate("() => { const b = document.querySelector('#view .below'); b.scrollTop = b.scrollHeight; return Math.round(b.scrollTop); }")
        pg.click('[data-tab="menu"]'); until(pg, 'button[data-menu="continue"]', 5000, 'visible'); pg.click('button[data-menu="continue"]'); in_game(pg)
        back = pg.evaluate(col)
        if y0 < 100 or abs(back[0] - y0) > 2: fails.append(f'N1 (RV1, L6): the cards column at {y0} px came back from the menu at {back[0]} px')
        camp = pg.evaluate_handle("() => [...document.querySelectorAll('#view button.card[data-story]')].find(e => /^Make camp/.test(e.textContent) && !e.disabled)").as_element()
        if not camp: fails.append('N1 (RV1, M1): no "Make camp for the night." on the wilds at 16:30')
        else:
            pg.evaluate("() => { const b = document.querySelector('#view .below'); b.scrollTop = b.scrollHeight; }")  # the column scrolled again (L6 apart)
            before = pg.evaluate("localStorage.getItem('boneash.auto')"); camp.evaluate("e => e.click()")
            until(pg, "b => localStorage.getItem('boneash.auto') !== b", 5000, arg=before); pg.wait_for_timeout(100)
            c = pg.evaluate(col)
            if c[1] < 50 or c[0] != 0: fails.append(f'N1 (RV1, M1): Camp, a new screen, opened its cards column at {c[0]} px of {c[1]}, not 0')
            else: notes.append(f'N1 (RV1, M1, L6): a new screen starts at the top (Camp 0 of {c[1]} px); the column back from the menu at {back[0]} px')
    finally:
        ctx.close()
    # MS: the main menu scrolled, then Continue: the game at the top (a first entry this visit)
    ctx = b.new_context(viewport={'width': 1366, 'height': 420}, service_workers='block')
    pg = ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f"page error: {e}"))
    try:
        pg.goto(url); pg.evaluate("([s, z]) => { localStorage.clear(); localStorage.setItem('boneash.oldcal', '1'); localStorage.setItem('boneash.auto', s); localStorage.setItem('boneash.textsize', z); }", [save, '130']); pg.reload()
        until(pg, 'button[data-menu="continue"]', 5000, 'visible')
        y = pg.evaluate("() => { scrollTo(0, document.documentElement.scrollHeight); return Math.round(scrollY); }")
        pg.click('button[data-menu="continue"]'); in_game(pg)
        y2 = pg.evaluate("Math.round(scrollY)")
        if y < 20 or y2 != 0: fails.append(f'N1 (MS): Continue from the main menu scrolled {y} px opened the game at {y2} px, not 0')
        else: notes.append(f'N1 (MS): Continue from a main menu scrolled {y} px opens the game at the top')
    finally:
        ctx.close()

def vq1_ui(b, url):
    """v0.11.213 (owner picks VQ1 + FQ1): Plan the week on the day-2 wilds save at 412 px: the rest row ("Rest, hours a day", last,
    its + sets 1 and the save keeps it in g.tasks.plan.med.rest); Yuki's row says "every 3rd day"; RV1 (TG8): her card tapped by hand,
    then "Go on.": her row says "every 3rd day, opens Day 5". v0.11.225 (LO2): her card stays on the hub, closed, with that note (SN);
    the button reads "Run the week" with Clear (PE)."""
    save = (ROOT / 'saves/v0.11.204-long-wilds-day2.json').read_text()
    ctx = b.new_context(viewport={'width': 412, 'height': 800}, service_workers='block')
    pg = ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f"page error: {e}"))
    try:
        fresh(pg, url, "s => { localStorage.clear(); localStorage.setItem('boneash.auto', s); }", save)
        info = pg.evaluate("""() => { const rows = [...document.querySelectorAll('.prow')]; const t = (r) => r.querySelector('.pl')?.textContent || '';
            const rest = rows.findIndex((r) => r.querySelector('[data-plan="med:rest"]')); const yk = rows.find((r) => r.querySelector('[data-plan="door:yk_time"]'));
            return [rows.length, rest, rest >= 0 ? t(rows[rest]) : '', yk ? t(yk) : '']; }""")
        if info[1] < 0 or 'Rest, hours a day' not in info[2]: fails.append(f'VQ1: no rest row on the plan ({info})')
        elif 'every 3rd day' not in info[3]: fails.append(f'VQ1: Yuki\'s row does not say "every 3rd day" ({info[3]})')
        else:
            n0 = pg.evaluate("localStorage.getItem('boneash.auto')"); pg.click('button[data-plan="med:rest"][data-d="1"]')
            until(pg, "b => localStorage.getItem('boneash.auto') !== b", 3000, arg=n0); pg.wait_for_timeout(100)
            got = pg.evaluate("() => { const o = JSON.parse(localStorage.getItem('boneash.auto')); return JSON.parse(o.data || JSON.stringify(o)).tasks?.plan?.med?.rest; }")
            if got != 1: fails.append(f'VQ1: the rest row\'s + kept {got} in the save (1 expected)')
            # RV1 (TG8): Yuki's card tapped by hand, then "Go on.": back on the hub her row says the day it opens again (S3)
            card = pg.query_selector('button[data-run="wilds:14"]')
            if not card: fails.append('VQ1 (TG8): no "Sit with Yuki." card on the wilds')
            else:
                tap(pg, card); until(pg, "() => [...document.querySelectorAll('button')].some((e) => e.textContent.trim().startsWith('Go on.'))", 5000)
                go = pg.locator('button', has_text='Go on.').first; tap(pg, go.element_handle())
                until(pg, 'button[data-plan="door:yk_time"]', 5000, 'attached'); pg.wait_for_timeout(100)
                note = pg.evaluate("() => document.querySelector('button[data-plan=\"door:yk_time\"]').closest('.prow').querySelector('.note')?.textContent || ''")
                if 'every 3rd day, opens Day 5' not in note: fails.append(f'VQ1 (TG8): Yuki\'s row after her scene: {note!r} ("every 3rd day, opens Day 5" expected)')
                # v0.11.225 (owner pick LO2, SN): her card stays on the hub, closed, with the same note; PE: her row alone runs ("Run the week", Clear)
                sn = pg.evaluate("() => { const c = document.querySelector('button.card[data-run=\"wilds:14\"]'); const btn = document.querySelector('button[data-week=\"run\"]'); return [c ? c.disabled : null, c?.querySelector('.tag')?.textContent || '', btn?.textContent || '', !!document.querySelector('button[data-week=\"clear\"]')]; }")
                if sn[0] is not True or sn[1] != 'every 3rd day, opens Day 5': fails.append(f'LO2 (SN): Yuki\'s card after her scene: {sn[:2]} (closed, "every 3rd day, opens Day 5" expected)')
                if not sn[2].startswith('Run the week') or not sn[3]: fails.append(f'LO2 (PE): the plan\'s button with Yuki\'s row set: {sn[2:]} ("Run the week" and Clear expected)')
    finally:
        ctx.close()


def pr2_ui(b, url):
    """v0.11.211 (owner picks PR2 + PK1): Plan the week's places. On the day-2 save at 412 px and 1366x768: every row has a drop-down of
    1 to the rows' count by its label, inside its row and reachable; "Sits a day" shows 11 of 13; set to 1 it shows 1 and the save
    keeps it (g.tasks.prio.wilds); with a card planned, Yuki's row set to 1 says "before the day's work" and Smoke's "after the day's work"
    (RV1, L2); RV1 (M1, TG5): two ArrowUp keys move a row two places, the focus kept."""
    save = (ROOT / 'saves/v0.11.204-long-wilds-day2.json').read_text()
    for w, h in ((412, 800), (1366, 768)):
        ctx = b.new_context(viewport={'width': w, 'height': h}, service_workers='block')
        pg = ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f"page error: {e}"))
        try:
            fresh(pg, url, "s => { localStorage.clear(); localStorage.setItem('boneash.auto', s); }", save)
            where = f'PR2 ({w}x{h})'
            info = pg.evaluate("""() => { const rows = [...document.querySelectorAll('.prow')];
                return rows.map((r) => { const s = r.querySelector('select.prio'); if (!s) return null; s.scrollIntoView({ block: 'center' });
                  const q = s.getBoundingClientRect(), c = r.getBoundingClientRect(), at = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2);
                  return [s.dataset.prio, s.options.length, Number(s.value), q.left >= c.left - 0.5 && q.right <= c.right + 0.5 && (at === s || s.contains(at))]; }); }""")
            if not info or any(x is None for x in info): fails.append(f'{where}: a plan row has no place drop-down ({info})'); continue
            n = len(info); bad = [x[0] for x in info if not x[3] or x[1] != n]
            vals = sorted(x[2] for x in info)
            if bad or vals != list(range(1, n + 1)): fails.append(f'{where}: drop-downs not 1..{n}, or outside their row / covered ({bad[:3]}, {vals})'); continue
            sit = next(x for x in info if x[0] == 'med:sit')
            if n != 14 or sit[2] != 11: fails.append(f'{where}: the wilds shows {n} rows, "Sits a day" at {sit[2]} (14 rows with v0.11.213\'s rest row, 11 expected)')
            # RV1 (L2): a card planned first, so the notes have the day's work to go by
            n0 = pg.evaluate("localStorage.getItem('boneash.auto')"); pg.click('.prow button[data-d="1"]')
            until(pg, "b => localStorage.getItem('boneash.auto') !== b", 3000, arg=n0); pg.wait_for_timeout(100)
            for key, at in (('med:sit', '1'), ('door:yk_time', '1'), ('med:pres', '4')):  # Smoke at 4: after the planned card (3), before the cards at 0
                n0 = pg.evaluate("localStorage.getItem('boneash.auto')")
                pg.select_option(f'select[data-prio="{key}"]', at)
                until(pg, "b => localStorage.getItem('boneash.auto') !== b", 3000, arg=n0); pg.wait_for_timeout(100)
            got = pg.evaluate("""() => [Number(document.querySelector('select[data-prio="door:yk_time"]').value), Number(document.querySelector('select[data-prio="med:sit"]').value),
                document.querySelector('select[data-prio="door:yk_time"]').closest('.prow').querySelector('.note')?.textContent || '',
                document.querySelector('select[data-prio="med:pres"]').closest('.prow').querySelector('.note')?.textContent || '',
                JSON.parse(JSON.parse(localStorage.getItem('boneash.auto')).data).tasks?.prio?.wilds || null]""")
            if got[0] != 1 or got[1] != 2 or 'before the day\'s work' not in got[2] or 'after the day\'s work' not in got[3] or not got[4] or got[4].get('door:yk_time') != 1:
                fails.append(f'{where}: after Sits a day and then Yuki to 1: Yuki {got[0]}, sits {got[1]} (1, 2), notes {got[2]!r} / Smoke {got[3]!r}, saved {got[4]}')
            else: notes.append(f'PR2: Plan the week\'s places at {w}x{h}: {n} drop-downs, 1..{n}, inside their rows; a move saved; Yuki at 1: "{got[2]}"; Smoke: "{got[3]}"')
            # RV1 (M1, TG5): the keyboard: an arrow key moves the row a place and the focus stays on its drop-down, so the next one moves it again
            sel = 'select[data-prio="med:qi"]'
            v0 = int(pg.eval_on_selector(sel, 'e => e.value')); pg.focus(sel); seen = []
            for _ in range(2):
                n0 = pg.evaluate("localStorage.getItem('boneash.auto')"); pg.keyboard.press('ArrowUp')
                until(pg, "b => localStorage.getItem('boneash.auto') !== b", 3000, arg=n0); pg.wait_for_timeout(100)
                seen.append(pg.evaluate("() => { const a = document.activeElement; return [a?.dataset?.prio || a?.tagName || '', Number(a?.value || 0)]; }"))
            if seen != [['med:qi', v0 - 1], ['med:qi', v0 - 2]]: fails.append(f'{where} (RV1, M1): two ArrowUp on Gather Qi at {v0}: {seen} (the focus kept, {v0 - 1} then {v0 - 2})')
            else: notes.append(f'PR2 (RV1, M1): two ArrowUp on Gather Qi: {v0} → {v0 - 2}, the focus kept at {w}x{h}')
        finally:
            ctx.close()

def main(part=0):
    """v0.11.20: part 1 (Incremental Mode, the reload, no mode switch, two tabs) and part 2 (Saves, the menu, tooltips and scroll,
    the resting places) can run side by side, each with its own browser and server; no part = everything, in order."""
    one, two, three, four = part in (0, 1), part in (0, 2), part in (0, 3), part in (0, 4)  # v0.11.41: part 4 = the reload and the two tabs, split off part 1
    n1 = 0; tabs = []
    port = free_port()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    up = time.time() + 10  # v0.11.21: wait for the server's port instead of a fixed 0.8 s
    while True:
        try: socket.create_connection(('127.0.0.1', port), timeout=0.5).close(); break
        except OSError:
            if srv.poll() is not None or time.time() > up:
                srv.terminate(); print(f'browser test: the local server on port {port} did not come up in 10 s'); sys.exit(1)
            time.sleep(0.05)
    url = f'http://127.0.0.1:{port}/index.html'
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            ctx = b.new_context(viewport={'width': 390, 'height': 844}, service_workers='block', permissions=['clipboard-read', 'clipboard-write'])
            pg = ctx.new_page()
            pg.on('pageerror', lambda e: fails.append(f"page error: {e}"))
            if one:
              # 1. Incremental Mode
              fresh(pg, url, "localStorage.clear()")
              if 'Day 1' not in pg.evaluate("document.body.innerText"): fails.append('Incremental Mode: the new game did not start on Day 1')
              n1 = taps(pg, 40, random.Random(7), 'Incremental Mode', 'button.card:not([disabled])[data-story], button.card:not([disabled])[data-run], button.card:not([disabled])[data-act]')
              tabs = visit_tabs(pg, 'Incremental Mode')
              # 3. v0.11.34 (D1): Incremental Mode only; an old Story Mode setting on the phone is ignored, and Settings has no switch
              fresh(pg, url, "localStorage.clear(); localStorage.setItem('boneash.tasks','0')")
              if pg.query_selector('button.choice[data-choice]') or not pg.query_selector('button.card[data-story], button.card[data-run]'): fails.append('D1: a phone set to Story Mode did not open in Incremental Mode (cards)')
              pg.click('[data-tab="menu"]'); until(pg, '.main-menu button[data-menu="settings"]', 5000, 'visible')
              pg.click('button[data-menu="settings"]'); until(pg, 'button[data-showchecks]', 5000, 'visible')
              if pg.query_selector('[data-tasks]') or 'Story Mode' in pg.inner_text('#view'): fails.append('D1: Settings still offers a game mode')
              else: notes.append('Incremental Mode only, no mode switch')
            if four:
              # 2. v0.11.64: a timed card resolves at once, from a fixed task screen (the Long Forest camp on Coil 2, a v0.11.7 test save)
              fresh(pg, url, "s => { localStorage.setItem('boneash.auto', s); localStorage.setItem('boneash.speed', '1'); }", (ROOT / 'saves/v0.11.7-long-forest-coil2.json').read_text())  # an old speed setting is ignored
              no_timer(pg, 'a task screen')
              long = pg.eval_on_selector_all('button.card[data-run]:not([disabled])', "els => els.filter(e => e.checkVisibility() && / h/.test(e.querySelector('.len')?.textContent || '') && !/at once/.test(e.textContent)).map(e => e.dataset.run)")
              if not long: fails.append('at once: no task screen with an hour-long card reached; on screen: ' + ' | '.join(pg.eval_on_selector_all('#view button', 'els => els.slice(0, 8).map(e => e.textContent.slice(0, 50))')))
              else:
                  dur = pg.eval_on_selector(f'button.card[data-run="{long[0]}"] .len', "e => { const m = /(\\d+) h(?: (\\d+) m)?/.exec(e.textContent); return m ? 60 * +m[1] + (+m[2] || 0) : -1; }")
                  mins = "(() => JSON.parse(JSON.parse(localStorage.getItem('boneash.auto')).data).minutes)()"
                  m0 = pg.evaluate(mins); r0 = len(pg.query_selector_all('.res'))
                  tap(pg, pg.query_selector(f'button.card[data-run="{long[0]}"]'))
                  until(pg, f"{mins} !== {m0}", 2000)
                  m1 = pg.evaluate(mins); r1 = len(pg.query_selector_all('.res'))
                  if m1 - m0 != dur: fails.append(f'at once: the card said {dur} min, the clock moved {m1 - m0} min')
                  elif r1 != r0 + 1: fails.append(f'at once: no Results entry ({r0} → {r1})')
                  else: notes.append(f'a card at once ({dur} min, as its card said)')
                  no_timer(pg, 'after a card')
              # v0.11.64 (S2): the status bar stays pinned at the top
              pg.evaluate("scrollTo(0, document.documentElement.scrollHeight)"); until(pg, 'scrollY > 200', 3000)
              top = pg.evaluate("(() => { const r = document.querySelector('.status')?.getBoundingClientRect(); return r ? [Math.round(r.top), Math.round(r.bottom), scrollY] : null; })()")
              if not top or abs(top[0]) > 1 or top[1] < 20 or top[2] < 200: fails.append(f'status bar: not pinned at the top when scrolled (top, bottom, scrollY = {top})')
              else: notes.append('the status bar pinned at the top')
              pg.evaluate("scrollTo(0, 0)")
              groups(pg, url)
              replies(pg, url)
              nextstep(pg, url)
              flip_ui(pg, url)
              # 4. two tabs (v0.11.8): a tab that closes never writes its older game over a newer save from another tab
              fresh(pg, url, "localStorage.clear()")
              pg.evaluate("1")
              pb = ctx.new_page(); pb.goto(url); until(pb, '.main-menu', 10000, 'attached'); enter(pb)
              before = pb.evaluate("localStorage.getItem('boneash.auto')")
              for _ in range(6):
                  bt = [e for e in pb.query_selector_all('button.card:not([disabled])[data-story], button.card:not([disabled])[data-run]') if e.is_visible()]
                  if not bt: break
                  try: tap(pb, bt[0])
                  except Exception: pass
              newer = pb.evaluate("localStorage.getItem('boneash.auto')")
              pg.goto(url.replace('index.html', 'art/bg/CREDITS.md'))  # the older tab closes: its save on close fires
              after = pg.evaluate("localStorage.getItem('boneash.auto')")
              if newer == before: fails.append('two tabs: the second tab never saved, nothing to compare')
              elif after != newer: fails.append('two tabs: the closing tab wrote over the newer save')
              else: notes.append('two tabs: the newer save kept')
              pb.close()
            if two:
                # 5. Saves (v0.11.9)
                saves(pg, url)
                # 6. the main menu (v0.11.10)
                main_menu(pg, url)
                # 6c. the build label and What's new (v0.11.150, BL1)
                news_box(pg, url)
                # 6b. the fonts from the game's own files (v0.11.149, FN1)
                fonts_local(pg, url)
                # 7. tooltip, bars, scroll (v0.11.11)
                comfort(pg, url)
                # 8. Meditate only on the resting places (v0.11.14); Cultivate until the limit (v0.11.64)
                rest_places(pg, url)
                # 9. picked choices recoloured (v0.11.32)
                picked(pg, url)
                # 10. a scene read before: the fold, the memory line, the skip (v0.11.35)
                again(pg, url)
                split_fold(pg, url)  # v0.11.229 (E2-2, RV1: TG2)
                music_line(pg, url)
                # 13. quiet repeats and the same-visit fold (v0.11.134, LP2)
                lp2(pg, url)
                # 14. whose relationships are shown (v0.11.137, HV1)
                hv1(pg, url)
                # 15. the long calendar's Plan the week at a phone's width (v0.11.205, P1)
                plan_rows(b, url)
                plan_forecast(b, url)  # v0.11.206 (FC1)
                wide_layout(b, url)  # v0.11.208 (PC3)
                n1_ui(b, url)  # v0.11.210 (N1: SC, DC-a, MS, TT)
                pr2_ui(b, url)  # v0.11.211 (PR2 + PK1)
                vq1_ui(b, url)  # v0.11.213 (VQ1 + FQ1)
                rd1_ui(b, url)  # v0.11.214 (RD1 + RN1)
                # 12. the FAQ (v0.11.83)
                faq(pg, url)
            if three:
                # 11. the art cache across an update (v0.11.39, Z2-b): its own server and a service worker that runs
                update_test(b)
            b.close()
    finally:
        srv.terminate()
    if one and n1 < 30: fails.append(f'Incremental Mode: only {n1} taps possible')
    if fails:
        print('\n'.join(fails[:20])); sys.exit(1)
    print(f'{f"part {part}: " if part else ""}{f"{n1} taps, {len(tabs)} tabs; " if one else ""}{"; ".join(notes)}, no errors')

if __name__ == '__main__':
    pt = sys.argv.index('--part') if '--part' in sys.argv else -1
    main(int(sys.argv[pt + 1]) if pt >= 0 else 0)
