import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    print("[Playwright] Loading River Puzzle 3D...")
    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)

    print("[Playwright] Toggling Developer Mode...")
    page.keyboard.press("KeyD")
    page.wait_for_timeout(800)

    # Load Shepherd and Fox (safe combination, sheep are left alone safely)
    print("[Playwright] Loading Shepherd...")
    page.keyboard.press("Digit1")
    page.wait_for_timeout(800)

    print("[Playwright] Loading Fox...")
    page.keyboard.press("Digit2")
    page.wait_for_timeout(800)

    # Click the Bank Layout Card header to collapse it smoothly
    print("[Playwright] Collapsing Bank Layout Card...")
    page.locator("#header-layout").click()
    page.wait_for_timeout(1000)

    # Move the Boat across the river (transiting with rowing paddle animation)
    print("[Playwright] Sailing the kayak...")
    page.keyboard.press("Space")
    page.wait_for_timeout(2500)

    # Unload Shepherd on the Right Bank
    print("[Playwright] Unloading Shepherd on Right Bank...")
    page.keyboard.press("Digit1")
    page.wait_for_timeout(800)

    # Unload Fox on the Right Bank
    print("[Playwright] Unloading Fox on Right Bank...")
    page.keyboard.press("Digit2")
    page.wait_for_timeout(1000)

    # Take final screenshot
    print("[Playwright] Capturing screenshot...")
    screenshot_dir = "/app/screenshots"
    os.makedirs(screenshot_dir, exist_ok=True)
    screenshot_path = os.path.join(screenshot_dir, "verification.png")
    page.screenshot(path=screenshot_path)
    print(f"[Playwright] Screenshot successfully captured at: {screenshot_path}")
    page.wait_for_timeout(1000)

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
