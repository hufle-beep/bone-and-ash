import sys, json, threading, http.server, functools, time, os, statistics
from playwright.sync_api import sync_playwright
root = sys.argv[1]; saves = sys.argv[2:]
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=root)
H.log_message = lambda *a: None
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), H); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{port}/index.html'
ver = open(os.path.join(root,'sw.js')).read().split("bone-ash-")[1].split("'")[0]
TIME = """async (sel) => { const b = document.querySelector(sel); if (!b) return -1; const t = performance.now(); b.click();
 await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return performance.now() - t; }"""
with sync_playwright() as p:
    br = p.chromium.launch()
    for rate in (4,):
        for s in saves:
            pg = br.new_page(viewport={'width':390,'height':844})
            cdp = pg.context.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': rate})
            pg.goto(url.replace('index.html','CREDITS.md'))
            raw = open(os.path.join(root,'saves',s)).read()
            pg.evaluate("([s,v]) => { localStorage.clear(); localStorage.setItem('boneash.auto', s); localStorage.setItem('boneash.seen', v); localStorage.setItem('boneash.welcome', JSON.stringify({off:1})); }", [raw, ver])
            pg.evaluate("() => { window.__lt = []; }")
            t0=time.time(); pg.goto(url); pg.wait_for_selector('button[data-menu="continue"]', timeout=30000); load=(time.time()-t0)*1000
            pg.evaluate("() => { window.__lt=[]; new PerformanceObserver(l => l.getEntries().forEach(e => window.__lt.push(e.duration))).observe({type:'longtask', buffered:false}); }")
            cont = pg.evaluate(TIME, 'button[data-menu="continue"]')
            pg.wait_for_selector('#tabs', state='visible', timeout=10000)
            tabs = []
            for i in range(4):
                tabs.append(pg.evaluate(TIME, '[data-tab="sheet"]')); tabs.append(pg.evaluate(TIME, '[data-tab="story"]'))
            taps=[]
            for i in range(3):
                pg.evaluate("() => { window.__lt=[]; }")
                b = pg.query_selector('button.card[data-run]:not([disabled]):not(.door)')
                if not b: break
                b.click(); pg.wait_for_timeout(1500)
                lt2 = pg.evaluate("() => window.__lt"); taps.append(round(sum(lt2)))
            ncard = pg.evaluate("() => document.querySelectorAll('button.card:not([disabled])').length")
            lt = pg.evaluate("() => window.__lt")
            print(json.dumps({'cpu': f'{rate}x', 'save': s, 'open_ms': round(load), 'continue_ms': round(cont), 'tab_median_ms': round(statistics.median(tabs)), 'tab_max_ms': round(max(tabs)), 'open_cards': ncard, 'card_tap_longtask_ms': taps, 'longtasks': len(lt), 'longest_ms': round(max(lt)) if lt else 0}))
            pg.close()
    br.close()
