from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 850})
    page.goto('https://tulasi-hms-proto.vercel.app')
    page.wait_for_timeout(1000)
    for b in page.query_selector_all('button, [class*="role"], [class*="card"]'):
        cls = b.get_attribute('class') or ''
        txt = b.inner_text().strip().replace('\n', ' -- ')
        if txt:
            print(f"{cls}: {txt[:80]}")
    browser.close()
