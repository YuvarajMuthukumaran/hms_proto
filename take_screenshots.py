import os
from playwright.sync_api import sync_playwright

art_dir = r"C:\Users\Yuvaraj M\.gemini\antigravity\brain\8c8c0046-5db9-492b-be7d-78cca06e2a9e"

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1366, 'height': 850})
    page.goto('https://tulasi-hms-proto.vercel.app')
    page.wait_for_timeout(1000)
    
    # 1. Select Psychiatrist role
    for el in page.query_selector_all('.pk-role'):
        if 'Psychiatrist' in el.inner_text() and 'Floor' not in el.inner_text():
            el.click()
            break
    page.wait_for_timeout(500)
    
    # Click Login button
    login_btn = page.query_selector('.pk-go, button:has-text("Login")')
    if login_btn:
        login_btn.click()
    
    page.wait_for_timeout(2500)
    print("Logged in, URL:", page.url)
    
    # Click the first patient row/link
    pat = page.wait_for_selector('table tbody tr, .pat-card, [data-pid], a[href*="patient"]', timeout=10000)
    if pat:
        pat.click()
    page.wait_for_timeout(2000)
    print("Patient opened, URL:", page.url)
    
    # --- Screenshot 1: Vitals and Monitoring with Filter Bar ---
    # Click Treatment Plan / Vitals
    for tab in page.query_selector_all('button, a, .tab, .seg button'):
        t = tab.inner_text().strip()
        if t in ['Treatment Plan', 'Vitals and monitoring', 'Vitals']:
            tab.click()
            page.wait_for_timeout(500)
            
    page.wait_for_timeout(1500)
    vitals_all = os.path.join(art_dir, "vitals_monitoring_all.png")
    page.screenshot(path=vitals_all)
    print("Screenshot 1 saved:", vitals_all)
    
    # --- Screenshot 2: Vitals filtered with 'Today' preset ---
    for btn in page.query_selector_all('.vm9-pbtn, button'):
        if btn.inner_text().strip() == 'Today':
            btn.click()
            break
    page.wait_for_timeout(1000)
    vitals_today = os.path.join(art_dir, "vitals_filtered_today.png")
    page.screenshot(path=vitals_today)
    print("Screenshot 2 saved:", vitals_today)
    
    # --- Screenshot 3: Admission Workup (where Scores and Scans/Investigations are moved with Examination) ---
    for tab in page.query_selector_all('button, a, .tab, .seg button'):
        if 'Admission' in tab.inner_text().strip():
            tab.click()
            break
    page.wait_for_timeout(1500)
    
    for btn in page.query_selector_all('button, a, .seg button'):
        if 'workup' in btn.inner_text().lower():
            btn.click()
            break
    page.wait_for_timeout(1500)
    
    adm_workup = os.path.join(art_dir, "admission_workup_examination_scores.png")
    page.screenshot(path=adm_workup)
    print("Screenshot 3 saved:", adm_workup)
    
    browser.close()
