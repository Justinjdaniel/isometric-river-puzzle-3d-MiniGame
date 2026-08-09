import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    print("[Playwright] Loading River Puzzle 3D...")
    page.goto("http://localhost:3000")
    page.wait_for_selector("#canvas-container")
    page.wait_for_timeout(800)

    screenshot_dir = "/app/screenshots"
    os.makedirs(screenshot_dir, exist_ok=True)

    # Screenshot 1: Game Load (Start State on Left Bank)
    print("[Playwright] Capturing S1: Game Load (Start State on Left Bank)...")
    page.screenshot(path=os.path.join(screenshot_dir, "seq_01_start.png"))
    page.wait_for_timeout(500)

    print("[Playwright] Toggling Developer Mode...")
    page.keyboard.press("KeyD")
    page.wait_for_timeout(800)

    # Load Shepherd and Fox (safe combination, sheep are left alone safely)
    print("[Playwright] Loading Shepherd...")
    page.keyboard.press("Digit1")
    page.wait_for_timeout(1000)

    print("[Playwright] Loading Fox...")
    page.keyboard.press("Digit2")
    page.wait_for_timeout(1000)

    # Screenshot 2: Loaded Shepherd and Fox on Kayak
    print("[Playwright] Capturing S2: Shepherd and Fox Loaded...")
    page.screenshot(path=os.path.join(screenshot_dir, "seq_02_loaded.png"))
    page.wait_for_timeout(500)

    # Move the Boat across the river (transiting with rowing paddle animation)
    print("[Playwright] Sailing the kayak...")
    page.keyboard.press("Space")
    page.wait_for_timeout(2500)

    # Screenshot 3: Sailing / Arrived on Right Bank
    print("[Playwright] Capturing S3: Arrived on Right Bank...")
    page.screenshot(path=os.path.join(screenshot_dir, "seq_03_transit.png"))
    page.wait_for_timeout(500)

    # Unload Shepherd on the Right Bank
    print("[Playwright] Unloading Shepherd on Right Bank...")
    page.keyboard.press("Digit1")
    page.wait_for_timeout(1000)

    # Unload Fox on the Right Bank
    print("[Playwright] Unloading Fox on Right Bank...")
    page.keyboard.press("Digit2")
    page.wait_for_timeout(1000)

    # Screenshot 4: Unloaded on Right Bank
    print("[Playwright] Capturing S4: Unloaded on Right Bank...")
    page.screenshot(path=os.path.join(screenshot_dir, "seq_04_unloaded.png"))
    page.wait_for_timeout(500)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        video_dir = "/app/videos"
        os.makedirs(video_dir, exist_ok=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=video_dir
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
            print("[Playwright] Finished execution.")
