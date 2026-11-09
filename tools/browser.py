"""v0.11.7: the browser test (Selene's sanity.py, adapted). Run from the repo root: python3 tools/browser.py
Serves the folder, opens the game at 390x844 in headless Chromium and taps the real buttons:
  1. Incremental Mode, a new game: about 40 taps on cards, story choices and fight actions, every tab;
  2. v0.11.64: a timed card resolves at once (no bar, no queue, no speed menu; the clock moved, a Results entry), from a fixed
     task screen (saves/v0.11.7-long-forest-coil2.json); the status bar stays pinned at the top when scrolled;
  3. v0.11.34 (D1): no Game mode switch; a phone still set to Story Mode ('boneash.tasks' '0') plays Incremental Mode;
  4. two tabs: closing the older tab leaves the newer save alone (v0.11.8);
  5. Saves (v0.11.9, in the menu since v0.11.10): Copy status, Export all then Restore all into a new game, a backup restored;
  6. the main menu (v0.11.10): opens first on plain paper with no tab bar; Settings (text size, Show checks) and Saves; Continue;
  (part 2 also: v0.11.35 a scene read before folds, Read it all again, Skip to the next choice; v0.11.83 the FAQ tab)
  (part 3, v0.11.39: the art cache across an update, with the service worker running; see update_test)
  7. v0.11.11: holding a card opens its tooltip (no check text) and the tap that ends the hold runs nothing; the status bars carry
     progress values; a story card plays at once; each tab keeps its scroll.
  8. v0.11.64 (C1): on a resting place, Cultivate until the limit runs its sits at once (the clock and Saturation move).
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
    start = ["James and Yuki", "What is the goal?", "How do I play?", "HP, Convergence and Fed", "Days, sleep and the night", "Results and the Journal", "Saving and settings", "Skills and checks", "The hammerspace"]
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

def again(pg, url):
    """v0.11.35 (P1-a): a scene read in an earlier Coil folds under a memory line; Read it all again opens it; Skip to the next choice
    walks the stretch at once (night_won → morning → the wilds) and lands on the task screen."""
    st = json.loads((ROOT / 'saves/v0.11.7-coil2-day1.json').read_text())
    st = json.loads(st['data']) if 'data' in st and isinstance(st.get('data'), str) else st
    st['scene'] = 'night_won'; st['combat'] = None
    st['flags'].update({'long': True, 'forest_day': 2}); st['minutes'] = 1440 + 22 * 60 + 360
    st['coil']['n'] = 2; st['seen'] = {'night_won': 1, 'morning': 1, 'wilds': 1, 'arrival': 1}
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
    else: notes.append('a scene read before folds, reads in full, and the skip walks to the wilds')
    check_text(pg, 'after the skip', strict=True)

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
    art = dict(re.findall(r"'((?:art|icons)/[^']+)': '([0-9a-f]+)'", sw))
    ver = re.search(r"const VERSION = '([^']+)'", sw).group(1)
    def with_version(text, v): return text.replace(f"const VERSION = '{ver}'", f"const VERSION = '{v}'")
    art_hits = lambda: [x for x in log if re.match(r'^/bone-and-ash/(art/.*\.(jpg|png|svg|webp)|icons/)', x)]
    entries = "async () => (await (await caches.open('boneash-art')).keys()).map(r => r.url.replace(location.origin, ''))"
    def update_to(pg, v, ms=20000):
        log.clear(); pg.evaluate("navigator.serviceWorker.getRegistration().then(r => r.update())")
        return poll(pg, f"caches.keys().then(k => k.includes('{v}') && k.includes('boneash-art') && k.filter(x => /^bone-ash-/.test(x)).length === 1)", ms)
    def bad(msg): fails.append(f'update: {msg}')
    try:
        ctx = b.new_context(viewport={'width': 390, 'height': 844})
        pg = ctx.new_page(); pg.on('pageerror', lambda e: bad(f'page error: {e}'))
        # 0. today's phones: the 0.11.38 worker
        (site / 'sw.js').write_text((ROOT / 'tests/fixtures/sw-0.11.38.js').read_text())
        pg.goto(base + 'index.html')
        if not poll(pg, "caches.open('bone-ash-0.11.38').then(c => c.match('art/pic/james.webp')).then(r => !!r)"): bad('the 0.11.38 worker did not cache its pictures'); return
        pg.reload(); poll(pg, "navigator.serviceWorker.controller ? 1 : 0", 10000)
        # 1. the update to this version (Z2-b)
        (site / 'sw.js').write_text(with_version(sw, 'bone-ash-9.9.8'))
        if not update_to(pg, 'bone-ash-9.9.8'): bad(f'the update from 0.11.38 never took over (caches {pg.evaluate("caches.keys()")})'); return
        have = pg.evaluate(entries); hits = art_hits()
        if len(have) != len(art) or sorted(hits) != sorted('/bone-and-ash/' + f for f in art): bad(f'from 0.11.38: {len(have)} art files cached, {len(hits)} downloaded ({len(set(hits))} distinct), expected {len(art)} each once')
        log.clear()
        if pg.evaluate("fetch('art/pic/james.webp').then(r => r.status)") != 200 or art_hits(): bad(f'a cached picture went to the network ({art_hits()})')
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
        ctx.set_offline(False)
        if not any(f for f in fails if f.startswith('update')): notes.append(f'update: from 0.11.38 every art file once ({len(art)}); a new version downloaded only the 1 changed picture, old copy pruned; a stale file rejected (the install failed, the version stayed); a miss stored again; served offline')
        ctx.close()
    finally:
        srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)

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
                # 7. tooltip, bars, scroll (v0.11.11)
                comfort(pg, url)
                # 8. Meditate only on the resting places (v0.11.14); Cultivate until the limit (v0.11.64)
                rest_places(pg, url)
                # 9. picked choices recoloured (v0.11.32)
                picked(pg, url)
                # 10. a scene read before: the fold, the memory line, the skip (v0.11.35)
                again(pg, url)
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
