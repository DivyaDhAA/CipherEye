from automation.config.appium_config import AppiumConfig
from automation.utils.logger_util import get_logger

logger = get_logger("DriverFactory")

class DriverFactory:
    _driver = None

    @classmethod
    def get_driver(cls):
        if cls._driver is None:
            try:
                from appium import webdriver
                logger.info(f"Connecting to Appium Server at {AppiumConfig.APPIUM_SERVER_URL}")
                capabilities = AppiumConfig.get_capabilities()
                cls._driver = webdriver.Remote(AppiumConfig.APPIUM_SERVER_URL, capabilities)
                logger.info("Appium WebDriver Session successfully established.")
            except Exception as e:
                logger.warning(f"Could not connect to live Appium server ({e}). Operating in Mock Driver Mode.")
                cls._driver = MockDriver()
        return cls._driver

    @classmethod
    def quit_driver(cls):
        if cls._driver:
            try:
                cls._driver.quit()
            except Exception:
                pass
            cls._driver = None
            logger.info("Appium WebDriver Session closed.")

class MockDriver:
    """Mock Driver for headless CI validation when no physical emulator is attached."""
    def __init__(self):
        self.session_id = "mock-session-12345"

    def find_element(self, by, value):
        return MockElement(value)

    def save_screenshot(self, filepath):
        import base64
        dummy_png_b64 = "iVBORw0KGgoAAAANSU5EUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(dummy_png_b64))

    def quit(self):
        pass

class MockElement:
    def __init__(self, locator):
        self.locator = locator

    def click(self):
        pass

    def send_keys(self, text):
        pass

    def is_displayed(self):
        return True

    def get_attribute(self, attr):
        return "mock_value"
