"""v0.11.7: the browser test (Selene's sanity.py, adapted). Run from the repo root: python3 tools/browser.py
Serves the folder, opens the game at 390x844 in headless Chromium and taps the real buttons:
  1. Incremental Mode, a new game: about 40 taps on cards, story choices and fight actions (test speeds, x10), every tab;
  2. a running bar survives a reload (v0.11.5), from a fixed task screen (saves/v0.11.7-long-forest-coil2.json);
  3. Story Mode, a new game: about 25 taps, every tab;
  4. two tabs: closing the older tab leaves the newer save alone (v0.11.8);
  5. Saves (v0.11.9, in the menu since v0.11.10): Copy status, Export all then Restore all into a new game, a backup restored;
  6. the main menu (v0.11.10): opens first on plain paper with no tab bar; Settings (text size, Show checks) and Saves; Continue.
Game screens (story, fights, journal) also fail on any check text: DC, a die, "+ d6" (checks are hidden since v0.11.10).
Fails on any page error, or when the screen shows undefined, NaN, [object Object] or an old mode name.
The taps are seeded, so a run repeats. Exit code 1 on any failure.
"""
import json, random, re, socket, subprocess, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
BAD = re.compile(r"\bundefined\b|\bNaN\b|\[object Object\]|Tasks \(preview\)|\bClassic\b")
CHECKS = re.compile(r"\bDC\b|🎲|\+ d6\b|→ (?:passes|partly|fails)")
fails, notes = [], []

def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p

def check_text(pg, where, strict=False):
    t = pg.evaluate("document.body.innerText")
    m = BAD.search(t) or (CHECKS.search(t) if strict else None)
    if m: fails.append(f"{where}: the screen shows '{m.group(0)}' … {t[max(0, m.start() - 60):m.end() + 40]!r}")

def enter(pg):
    """v0.11.10: the game opens on the main menu; Continue (or Begin) enters it."""
    b = pg.query_selector('button[data-menu="continue"]')
    if b: b.click(); pg.wait_for_timeout(300)

def wait_bar(pg, ms=800):
    end = time.time() + ms / 1000
    while time.time() < end and pg.query_selector('#nowbar'): pg.wait_for_timeout(100)

def fresh(pg, url, js, arg=None):
    """v0.11.8: set storage from a non-game page on the same site, then open the game: the game's save-on-close can't write over it."""
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md'))
    pg.evaluate(js, arg) if arg is not None else pg.evaluate(js)
    pg.goto(url); pg.wait_for_timeout(500)
    enter(pg)

def visit_tabs(pg, where):
    tabs = [t for t in pg.eval_on_selector_all('[data-tab]', 'els => els.map(e => e.dataset.tab)') if t != 'menu']
    for t in tabs:
        pg.click(f'[data-tab="{t}"]'); pg.wait_for_timeout(150); check_text(pg, f"{where}, tab {t}", strict=t in ('story', 'journal'))
    if 'story' in tabs: pg.click('[data-tab="story"]'); pg.wait_for_timeout(150)
    return tabs

def taps(pg, n, rng, where, sel):
    done = 0
    for i in range(n):
        wait_bar(pg)
        btns = pg.query_selector_all(sel)
        if not btns:
            if pg.query_selector('button.pause'): pg.click('button.pause'); pg.wait_for_timeout(300); continue
            break
        try: rng.choice(btns).click(timeout=3000); done += 1
        except Exception: continue  # re-rendered under the tap: look again
        pg.wait_for_timeout(120)
        if i % 10 == 9: check_text(pg, f"{where}, tap {i + 1}", strict=True)
    check_text(pg, f"{where}, after {done} taps", strict=True)
    return done

def scene_of(raw):
    return json.loads(json.loads(raw)['data'])['scene']

def open_saves(pg):
    pg.click('[data-tab="menu"]'); pg.wait_for_timeout(200); pg.click('button[data-menu="saves"]'); pg.wait_for_timeout(200)

def main_menu(pg, url):
    """v0.11.10: the menu opens first, without the tab bar or the game's picture; Settings and Saves; Continue enters the game."""
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md')); pg.evaluate("localStorage.clear()")
    pg.goto(url); pg.wait_for_timeout(500)
    if not pg.query_selector('.main-menu'): fails.append('menu: the game did not open on the main menu'); return
    if pg.is_visible('#tabs') or pg.query_selector('.plate'): fails.append('menu: the tab bar or the game picture shows behind the menu')
    if not pg.query_selector('button[data-menu="continue"]') or 'Begin' not in pg.inner_text('button[data-menu="continue"]'): fails.append('menu: a first start should offer Begin')
    check_text(pg, 'menu')
    pg.click('button[data-menu="settings"]'); pg.wait_for_timeout(200); check_text(pg, 'Settings')
    pg.click('button[data-textsize="120"]'); pg.wait_for_timeout(150)
    fs = pg.evaluate("getComputedStyle(document.documentElement).fontSize")
    if fs != '19.2px': fails.append(f'Settings: text size 120% gave a root font of {fs}')
    pg.click('button[data-textsize="100"]'); pg.wait_for_timeout(150)
    pg.click('button[data-showchecks]'); pg.wait_for_timeout(150)
    if pg.evaluate("localStorage.getItem('boneash.showchecks')") != '1': fails.append('Settings: Show checks did not switch on')
    pg.click('button[data-showchecks]'); pg.wait_for_timeout(150)
    pg.click('button[data-menu="main"]'); pg.wait_for_timeout(150)
    pg.click('button[data-menu="saves"]'); pg.wait_for_timeout(200); check_text(pg, 'Saves (menu)')
    pg.click('button[data-menu="main"]'); pg.wait_for_timeout(150)
    enter(pg)
    if pg.query_selector('.main-menu') or not pg.is_visible('#tabs'): fails.append('menu: Continue did not enter the game')
    else: notes.append('menu, settings and saves')
    check_text(pg, 'after Begin', strict=True)
    # back to the menu from the game: it pauses, and Continue says so now
    pg.click('[data-tab="menu"]'); pg.wait_for_timeout(200)
    if not pg.query_selector('.main-menu'): fails.append('menu: the ☰ Menu tab did not open the menu')
    enter(pg)

def saves(pg, url):
    lf = (ROOT / 'saves/v0.11.7-long-forest-coil2.json').read_text()
    s1 = (ROOT / 'saves/v0.8.5-day1-stream.json').read_text()
    b5 = (ROOT / 'saves/v0.11.7-coil2-day1.json').read_text()
    fresh(pg, url, """a => { localStorage.clear(); localStorage.setItem('boneash.auto', a[0]); localStorage.setItem('boneash.slot1', a[1]);
        localStorage.setItem('boneash.bak.5m', a[2]); localStorage.setItem('boneash.bak.meta', JSON.stringify({ play: 0, at: {}, when: { '5m': Date.now() } })); }""", [lf, s1, b5])
    open_saves(pg); check_text(pg, 'Saves')
    # Copy status
    pg.click('button[data-status]'); pg.wait_for_timeout(800)
    st = pg.evaluate("navigator.clipboard.readText()")
    if scene_of(lf) not in st or not re.search(r'Bone and Ash \d+\.\d+\.\d+', st) or 'Pause log' not in st: fails.append(f'Copy status: unexpected text {st[:200]!r}')
    # Export all, then Restore all into a new game
    auto0 = pg.evaluate("localStorage.getItem('boneash.auto')")
    with pg.expect_download() as dl: pg.click('button[data-exportall]')
    path = dl.value.path()
    fresh(pg, url, "localStorage.clear()")
    open_saves(pg)
    pg.set_input_files('label:has-text("Restore all saves") input[data-import]', str(path)); pg.wait_for_timeout(500)
    if not pg.query_selector('button[data-restoreall="1"]'): fails.append('Restore all: no confirm button after choosing the file')
    else:
        check_text(pg, 'Restore all confirm')
        pg.click('button[data-restoreall="1"]'); pg.wait_for_timeout(500)
        got = pg.evaluate("[localStorage.getItem('boneash.auto'), localStorage.getItem('boneash.slot1'), localStorage.getItem('boneash.bak.5m'), localStorage.getItem('boneash.bak.before')]")
        if got[0] != auto0: fails.append(f'Restore all: the autosave differs ({scene_of(got[0]) if got[0] else None} vs {scene_of(auto0)})')
        elif got[1] != s1 or got[2] != b5: fails.append('Restore all: a slot or backup differs')
        elif not got[3]: fails.append('Restore all: no "before" backup of the game it replaced')
        else: notes.append('export all → restore all exact')
    # a backup restored from Saves
    open_saves(pg)
    if not pg.query_selector('button[data-bak="5m"]'): fails.append('Backups: no Restore button for the 5-minute backup')
    else:
        pg.click('button[data-bak="5m"]'); pg.wait_for_timeout(400)
        a = pg.evaluate("[localStorage.getItem('boneash.auto'), localStorage.getItem('boneash.bak.before')]")
        if scene_of(a[0]) != scene_of(b5) or scene_of(a[1]) != scene_of(lf): fails.append(f'Backups: after restore the game is at {scene_of(a[0])}, before = {scene_of(a[1])}')
        else: notes.append('backup restored')
        check_text(pg, 'after a backup restore')

def main():
    port = free_port()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    url = f'http://127.0.0.1:{port}/index.html'
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            ctx = b.new_context(viewport={'width': 390, 'height': 844}, service_workers='block', permissions=['clipboard-read', 'clipboard-write'])
            pg = ctx.new_page()
            pg.on('pageerror', lambda e: fails.append(f"page error: {e}"))
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
                pg.click(f'button.card[data-run="{long[0]}"]'); pg.wait_for_timeout(2200)
                w1 = pg.eval_on_selector('#nowbar', 'e => parseFloat(e.style.width)')
                pg.reload(); pg.wait_for_timeout(500); enter(pg)
                w2 = pg.eval_on_selector('#nowbar', 'e => parseFloat(e.style.width)') if pg.query_selector('#nowbar') else 0
                if not (w1 > 5 and abs(w1 - w2) < 3): fails.append(f'reload: the bar was {w1}% before and {w2}% after')
                else: notes.append(f'reload kept the bar ({w1:.0f}% → {w2:.0f}%)')
            # 3. Story Mode
            fresh(pg, url, "localStorage.clear(); localStorage.setItem('boneash.tasks','0')")
            n3 = taps(pg, 25, random.Random(11), 'Story Mode', 'button.choice:not([disabled])[data-choice], button.choice:not([disabled])[data-act]')
            visit_tabs(pg, 'Story Mode')
            # 4. two tabs (v0.11.8): a tab that closes never writes its older game over a newer save from another tab
            fresh(pg, url, "localStorage.clear(); localStorage.setItem('boneash.speed','10'); localStorage.setItem('boneash.testspeeds','1')")
            pg.evaluate("1")
            pb = ctx.new_page(); pb.goto(url); pb.wait_for_timeout(500); enter(pb)
            before = pb.evaluate("localStorage.getItem('boneash.auto')")
            for _ in range(6):
                bt = pb.query_selector_all('button.card:not([disabled])[data-story], button.card:not([disabled])[data-run]')
                if not bt: break
                try: bt[0].click(timeout=3000)
                except Exception: pass
                pb.wait_for_timeout(300); wait_bar(pb, 3000)
            newer = pb.evaluate("localStorage.getItem('boneash.auto')")
            pg.goto(url.replace('index.html', 'art/bg/CREDITS.md'))  # the older tab closes: its save on close fires
            after = pg.evaluate("localStorage.getItem('boneash.auto')")
            if newer == before: fails.append('two tabs: the second tab never saved, nothing to compare')
            elif after != newer: fails.append('two tabs: the closing tab wrote over the newer save')
            else: notes.append('two tabs: the newer save kept')
            pb.close()
            # 5. Saves (v0.11.9)
            saves(pg, url)
            # 6. the main menu (v0.11.10)
            main_menu(pg, url)
            b.close()
    finally:
        srv.terminate()
    if n1 < 30: fails.append(f'Incremental Mode: only {n1} taps possible')
    if n3 < 15: fails.append(f'Story Mode: only {n3} taps possible')
    if fails:
        print('\n'.join(fails[:20])); sys.exit(1)
    print(f'{n1} + {n3} taps, {len(tabs)} tabs each mode, {"; ".join(notes)}, no errors')

main()
