import os
import base64
import time

class ScreenshotUtil:
    SCREENSHOT_DIR = os.path.abspath("automation/screenshots")

    @classmethod
    def capture_screenshot(cls, driver, test_id, name="step"):
        os.makedirs(cls.SCREENSHOT_DIR, exist_ok=True)
        filename = f"{test_id}_{name}_{int(time.time())}.png"
        filepath = os.path.join(cls.SCREENSHOT_DIR, filename)

        try:
            if driver and hasattr(driver, 'save_screenshot'):
                driver.save_screenshot(filepath)
            else:
                # Mock dummy PNG image generation (1x1 transparent PNG)
                dummy_png_b64 = "iVBORw0KGgoAAAANSU5EUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                with open(filepath, "wb") as f:
                    f.write(base64.b64decode(dummy_png_b64))
            return filepath
        except Exception as e:
            # Fallback mock screenshot
            dummy_png_b64 = "iVBORw0KGgoAAAANSU5EUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            with open(filepath, "wb") as f:
                f.write(base64.b64decode(dummy_png_b64))
            return filepath
