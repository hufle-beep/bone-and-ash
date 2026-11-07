"""v0.11.7: the browser test (Selene's sanity.py, adapted). Run from the repo root: python3 tools/browser.py
Serves the folder, opens the game at 390x844 in headless Chromium and taps the real buttons:
  1. Incremental Mode, a new game: about 40 taps on cards, story choices and fight actions (test speeds, x10), every tab;
  2. a running bar survives a reload (v0.11.5), from a fixed task screen (saves/v0.11.7-long-forest-coil2.json);
  3. Story Mode, a new game: about 25 taps, every tab;
  4. two tabs: closing the older tab leaves the newer save alone (v0.11.8);
  5. Saves (v0.11.9, in the menu since v0.11.10): Copy status, Export all then Restore all into a new game, a backup restored;
  6. the main menu (v0.11.10): opens first on plain paper with no tab bar; Settings (text size, Show checks) and Saves; Continue;
  7. v0.11.11: holding a card opens its tooltip (no check text) and the tap that ends the hold runs nothing; the status bars carry
     progress values; the running bar slides (transform, no width); each tab keeps its scroll.
Game screens (story, fights, journal) also fail on any check text: DC, a die, "+ d6" (checks are hidden since v0.11.10).
Fails on any page error, or when the screen shows undefined, NaN, [object Object] or an old mode name.
The taps are seeded, so a run repeats. Exit code 1 on any failure.
v0.11.21: fixed sleeps replaced by condition waits (each step waits for what the next line checks, with a timeout; a check still
reports its own message when the wait runs out). Taps on story cards, choices and fight actions wait out the game's 400 ms
double-tap guard, so no tap is swallowed and a run no longer depends on how busy the machine is.
"""
import json, random, re, socket, subprocess, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

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
    until it is truthy; False when the time runs out: the check after it then reports as before."""
    try:
        if state: pg.wait_for_selector(what, state=state, timeout=ms)
        else: pg.wait_for_function(what, arg=arg, timeout=ms)
        return True
    except Exception: return False

def in_game(pg, ms=5000):
    """the menu closed and the game drawn (render() runs inside the click, so this is usually true at once)"""
    return until(pg, "!document.body.classList.contains('menu-on') && !document.querySelector('.main-menu')", ms)

def on_tab(pg, t, ms=5000):
    return until(pg, f'#tabs [data-tab="{t}"][aria-current="page"]', ms, 'attached') and in_game(pg, ms)

def enter(pg):
    """v0.11.10: the game opens on the main menu; Continue (or Begin) enters it."""
    b = pg.query_selector('button[data-menu="continue"]')
    if b: b.click(); in_game(pg)

def wait_bar(pg, ms=800):
    """up to ms for a running bar (#nowbar) to end; returns at once when none runs"""
    until(pg, '#nowbar', ms, 'detached')

GUARD = 0.41  # js/main.js (view click handler): a story card, choice or fight action within 400 ms of the last one is ignored
_pressed = {}
def tap(pg, el, timeout=3000):
    """click a card; one the double-tap guard covers first waits out the 400 ms since the last such tap on this page
    (a genuine pause: the game checks Date.now(), there is no element to wait for)"""
    guarded = el.evaluate("e => e.dataset.story != null || e.dataset.choice != null || !!e.dataset.act || !!e.dataset.flee")
    if guarded:
        w = _pressed.get(id(pg), 0) + GUARD - time.monotonic()
        if w > 0: time.sleep(w)
    el.click(timeout=timeout)
    if guarded: _pressed[id(pg)] = time.monotonic()

def fresh(pg, url, js, arg=None):
    """v0.11.8: set storage from a non-game page on the same site, then open the game: the game's save-on-close can't write over it."""
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md'))
    pg.evaluate(js, arg) if arg is not None else pg.evaluate(js)
    pg.goto(url); until(pg, '.main-menu', 10000, 'attached')
    enter(pg)

def visit_tabs(pg, where):
    tabs = [t for t in pg.eval_on_selector_all('[data-tab]', 'els => els.map(e => e.dataset.tab)') if t != 'menu']
    for t in tabs:
        pg.click(f'[data-tab="{t}"]'); on_tab(pg, t); check_text(pg, f"{where}, tab {t}", strict=t in ('story', 'journal'))
    if 'story' in tabs: pg.click('[data-tab="story"]'); on_tab(pg, 'story')
    return tabs

def no_greyed(pg, where):
    """v0.11.17 (owner pick 1a): Incremental Mode shows no greyed-out task, Meditate or fight card (story choices keep their own rule)."""
    g = pg.query_selector('button.card[disabled]:not(.story)')
    if g: fails.append(f"{where}: a greyed-out card shows: {g.inner_text()[:80]!r}")

def taps(pg, n, rng, where, sel):
    done = 0
    for i in range(n):
        wait_bar(pg)
        btns = pg.query_selector_all(sel)
        if not btns:
            pb = pg.query_selector('button.pause')
            if pb: pb.click(); until(pg, 'e => !e.isConnected', 3000, arg=pb); continue  # the paused screen is drawn again
            break
        try: tap(pg, rng.choice(btns)); done += 1
        except Exception: continue  # re-rendered under the tap: look again
        if i % 10 == 9: check_text(pg, f"{where}, tap {i + 1}", strict=True)
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
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md')); pg.evaluate("localStorage.clear()")
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

def comfort(pg, url):
    fresh(pg, url, "localStorage.clear(); localStorage.setItem('boneash.speed','1')")
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
        if pg.query_selector('#nowbar'): fails.append('tooltip: the tap that ended the hold started the card')
        pg.click('#tip [data-tip="close"]'); until(pg, '#tip', 3000, 'hidden')
        if pg.is_visible('#tip'): fails.append('tooltip: ✕ did not close it')
        else: notes.append('tooltip')
    scene1 = pg.inner_text('.head .title')
    if scene1 != scene0: fails.append(f'tooltip: the hold moved the story ({scene0} → {scene1})')
    # the running bar slides
    long = pg.query_selector('button.card:not([disabled])[data-story]')
    if long:
        tap(pg, long); until(pg, "(e => e && parseFloat(e.dataset.v) > 0)(document.getElementById('nowbar'))", 5000)  # the bar has moved
        bar = pg.query_selector('#nowbar')
        if bar:
            st = pg.evaluate("e => [e.style.transform, e.style.width, e.parentElement.getAttribute('role')]", bar)
            if 'scaleX' not in st[0] or st[1] or st[2] != 'progressbar': fails.append(f'bars: the running bar is {st}')
        # the story step ends (its bar is gone, the next scene drawn, its smooth scroll to the top done) before the tabs
        until(pg, '#nowbar', 15000, 'detached'); until(pg, 'scrollY === 0', 3000)
    # each tab keeps its scroll
    pg.click('[data-tab="sheet"]'); on_tab(pg, 'sheet')
    room = pg.evaluate("document.documentElement.scrollHeight - innerHeight")
    if room > 150:
        pg.evaluate("scrollTo(0, 120)"); until(pg, 'scrollY === 120', 3000)
        pg.click('[data-tab="bag"]'); on_tab(pg, 'bag'); pg.click('[data-tab="sheet"]'); on_tab(pg, 'sheet'); until(pg, 'Math.abs(scrollY - 120) <= 5', 3000)
        yv = pg.evaluate("scrollY")
        if abs(yv - 120) > 5: fails.append(f'scroll: the James tab came back at {yv}, not 120')
        else: notes.append('scroll kept per tab')
    pg.click('[data-tab="story"]'); on_tab(pg, 'story')

def rest_places(pg, url):
    fresh(pg, url, "localStorage.clear(); localStorage.setItem('boneash.speed','1')")
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
    add = pg.query_selector('.cardwrap:has(button.card.med) button.qadd')
    if not add: fails.append('the stream: no + on a Meditate card'); return
    n0 = len(pg.query_selector_all('ol.queue li'))
    add.click(); until(pg, "n => document.querySelectorAll('ol.queue li').length === n", 3000, arg=n0 + 1)
    if len(pg.query_selector_all('ol.queue li')) != n0 + 1: fails.append('the stream: + on a Meditate card added no queue row')
    else: notes.append('Meditate only on resting places, + queues there')
    check_text(pg, 'resting place', strict=True)
    # v0.11.26: the owner's 11:02 save (the end of Act 1 after "taken") goes round again: Go round again… → the start of Act 1
    import gzip, base64
    raw = (ROOT / 'saves/2026-11-07-1102-incremental-a1_end.txt').read_text().strip()
    s2 = gzip.decompress(base64.b64decode(raw[5:])).decode()
    fresh(pg, url, "s => { localStorage.clear(); localStorage.setItem('boneash.auto', s); localStorage.setItem('boneash.speed','1'); }", s2)
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
    if scene_of(lf) not in st or not re.search(r'Bone and Ash \d+\.\d+\.\d+', st) or 'Pause log' not in st: fails.append(f'Copy status: unexpected text {st[:200]!r}')
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
    """v0.11.32 (P2-a): a story choice picked before is recoloured, in both modes; a task card and work stay as they were."""
    import json
    st = json.loads((ROOT / 'saves/v0.8.5-day1-stream.json').read_text())
    st['picked'] = {'stream': [1, 5]}  # 1 = "Test the water" (a work card on this task screen), 5 = "Keep walking" (story)
    s = json.dumps(st)
    for mode, sel in (('1', 'button.card.story'), ('0', 'button.choice')):
        fresh(pg, url, "a => { localStorage.clear(); localStorage.setItem('boneash.tasks', a[1]); localStorage.setItem('boneash.auto', a[0]); }", [s, mode])
        where = 'Incremental Mode' if mode == '1' else 'Story Mode'
        walk = pg.query_selector(f'{sel}:has-text("Keep walking")')
        if not walk: fails.append(f'picked, {where}: the stream\'s "Keep walking" is missing'); continue
        col = walk.evaluate("e => [e.classList.contains('picked'), getComputedStyle(e).color, /picked before/.test(e.textContent)]")
        if col != [True, 'rgb(107, 90, 69)', True]: fails.append(f'picked, {where}: "Keep walking" not recoloured: {col}')
        n = len(pg.query_selector_all('#view .picked'))
        if n != 1: fails.append(f'picked, {where}: {n} recoloured buttons, expected 1 (the work card "Test the water" stays as it was)')
    if not any(f.startswith('picked') for f in fails): notes.append('picked choices recoloured in both modes, work left alone')

def main(part=0):
    """v0.11.20: part 1 (Incremental Mode, the reload, Story Mode, two tabs) and part 2 (Saves, the menu, tooltips and scroll,
    the resting places) can run side by side, each with its own browser and server; no part = everything, in order."""
    one, two = part in (0, 1), part in (0, 2)
    n1 = n3 = 0; tabs = []
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
              fresh(pg, url, "localStorage.clear(); localStorage.setItem('boneash.testspeeds','1'); localStorage.setItem('boneash.speed','10')")
              if 'Day 1' not in pg.evaluate("document.body.innerText"): fails.append('Incremental Mode: the new game did not start on Day 1')
              n1 = taps(pg, 40, random.Random(7), 'Incremental Mode', 'button.card:not([disabled])[data-story], button.card:not([disabled])[data-run], button.card:not([disabled])[data-act]')
              tabs = visit_tabs(pg, 'Incremental Mode')
              # 2. a running bar survives a reload: a fixed task screen (the Long Forest camp on Coil 2, a v0.11.7 test save), so the path never varies
              fresh(pg, url, "s => { localStorage.setItem('boneash.auto', s); localStorage.setItem('boneash.speed', '1'); }", (ROOT / 'saves/v0.11.7-long-forest-coil2.json').read_text())  # the measured card runs at x1
              long = pg.eval_on_selector_all('button.card[data-run]:not([disabled])', "els => els.filter(e => / h/.test(e.querySelector('.len')?.textContent || '') && !/at once/.test(e.textContent)).map(e => e.dataset.run)")
              if not long: fails.append('reload: no task screen with an hour-long card reached; on screen: ' + ' | '.join(pg.eval_on_selector_all('#view button', 'els => els.slice(0, 8).map(e => e.textContent.slice(0, 50))')))
              else:
                  pg.click(f'button.card[data-run="{long[0]}"]')
                  until(pg, "(e => e && parseFloat(e.dataset.v) * 100 > 5)(document.getElementById('nowbar'))", 8000)  # the bar past 5% at x1
                  w1 = pg.eval_on_selector('#nowbar', 'e => parseFloat(e.dataset.v) * 100')
                  pg.reload(); until(pg, '.main-menu', 10000, 'attached'); enter(pg); until(pg, '#nowbar', 5000, 'attached')
                  w2 = pg.eval_on_selector('#nowbar', 'e => parseFloat(e.dataset.v) * 100') if pg.query_selector('#nowbar') else 0
                  if not (w1 > 5 and abs(w1 - w2) < 3): fails.append(f'reload: the bar was {w1}% before and {w2}% after')
                  else: notes.append(f'reload kept the bar ({w1:.0f}% → {w2:.0f}%)')
              # 3. Story Mode
              fresh(pg, url, "localStorage.clear(); localStorage.setItem('boneash.tasks','0')")
              n3 = taps(pg, 25, random.Random(11), 'Story Mode', 'button.choice:not([disabled])[data-choice], button.choice:not([disabled])[data-act]')
              visit_tabs(pg, 'Story Mode')
              # 4. two tabs (v0.11.8): a tab that closes never writes its older game over a newer save from another tab
              fresh(pg, url, "localStorage.clear(); localStorage.setItem('boneash.speed','10'); localStorage.setItem('boneash.testspeeds','1')")
              pg.evaluate("1")
              pb = ctx.new_page(); pb.goto(url); until(pb, '.main-menu', 10000, 'attached'); enter(pb)
              before = pb.evaluate("localStorage.getItem('boneash.auto')")
              for _ in range(6):
                  bt = pb.query_selector_all('button.card:not([disabled])[data-story], button.card:not([disabled])[data-run]')
                  if not bt: break
                  try: tap(pb, bt[0])
                  except Exception: pass
                  wait_bar(pb, 3000)
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
                # 7. tooltip, bars, scroll (v0.11.11)
                comfort(pg, url)
                # 8. Meditate only on the resting places, queueable there (v0.11.14)
                rest_places(pg, url)
                # 9. picked choices recoloured (v0.11.32)
                picked(pg, url)
            b.close()
    finally:
        srv.terminate()
    if one and n1 < 30: fails.append(f'Incremental Mode: only {n1} taps possible')
    if one and n3 < 15: fails.append(f'Story Mode: only {n3} taps possible')
    if fails:
        print('\n'.join(fails[:20])); sys.exit(1)
    print(f'{f"part {part}: " if part else ""}{f"{n1} + {n3} taps, {len(tabs)} tabs each mode; " if one else ""}{"; ".join(notes)}, no errors')

if __name__ == '__main__':
    pt = sys.argv.index('--part') if '--part' in sys.argv else -1
    main(int(sys.argv[pt + 1]) if pt >= 0 else 0)
