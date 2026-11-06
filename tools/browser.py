"""v0.11.7: the browser test (Selene's sanity.py, adapted). Run from the repo root: python3 tools/browser.py
Serves the folder, opens the game at 390x844 in headless Chromium and taps the real buttons:
  1. Incremental Mode, a new game: about 40 taps on cards, story choices and fight actions (test speeds, x10), every tab;
  2. a running bar survives a reload (v0.11.5), from a fixed task screen (saves/v0.11.7-long-forest-coil2.json);
  3. Story Mode, a new game: about 25 taps, every tab;
  4. two tabs: closing the older tab leaves the newer save alone (v0.11.8).
Fails on any page error, or when the screen shows undefined, NaN, [object Object] or an old mode name.
The taps are seeded, so a run repeats. Exit code 1 on any failure.
"""
import random, re, socket, subprocess, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
BAD = re.compile(r"\bundefined\b|\bNaN\b|\[object Object\]|Tasks \(preview\)|\bClassic\b")
TABS = ['story', 'sheet', 'inv', 'journal', 'saves']
fails, notes = [], []

def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p

def check_text(pg, where):
    t = pg.evaluate("document.body.innerText")
    m = BAD.search(t)
    if m: fails.append(f"{where}: the screen shows '{m.group(0)}' … {t[max(0, m.start() - 60):m.end() + 40]!r}")

def wait_bar(pg, ms=800):
    end = time.time() + ms / 1000
    while time.time() < end and pg.query_selector('#nowbar'): pg.wait_for_timeout(100)

def fresh(pg, url, js, arg=None):
    """v0.11.8: set storage from a non-game page on the same site, then open the game: the game's save-on-close can't write over it."""
    pg.goto(url.replace('index.html', 'art/bg/CREDITS.md'))
    pg.evaluate(js, arg) if arg is not None else pg.evaluate(js)
    pg.goto(url); pg.wait_for_timeout(500)

def visit_tabs(pg, where):
    tabs = pg.eval_on_selector_all('[data-tab]', 'els => els.map(e => e.dataset.tab)')
    for t in tabs:
        pg.click(f'[data-tab="{t}"]'); pg.wait_for_timeout(150); check_text(pg, f"{where}, tab {t}")
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
        if i % 10 == 9: check_text(pg, f"{where}, tap {i + 1}")
    check_text(pg, f"{where}, after {done} taps")
    return done

def main():
    port = free_port()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    url = f'http://127.0.0.1:{port}/index.html'
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            ctx = b.new_context(viewport={'width': 390, 'height': 844}, service_workers='block')
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
                pg.reload(); pg.wait_for_timeout(500)
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
            pb = ctx.new_page(); pb.goto(url); pb.wait_for_timeout(500)
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
            b.close()
    finally:
        srv.terminate()
    if n1 < 30: fails.append(f'Incremental Mode: only {n1} taps possible')
    if n3 < 15: fails.append(f'Story Mode: only {n3} taps possible')
    if fails:
        print('\n'.join(fails[:20])); sys.exit(1)
    print(f'{n1} + {n3} taps, {len(tabs)} tabs each mode, {"; ".join(notes)}, no errors')

main()
