from automation.utils.logger_util import get_logger

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.logger = get_logger(self.__class__.__name__)

    def find_element(self, by, locator):
        self.logger.info(f"Finding element by {by} = '{locator}'")
        return self.driver.find_element(by, locator)

    def click(self, by, locator):
        self.logger.info(f"Clicking element by {by} = '{locator}'")
        element = self.find_element(by, locator)
        element.click()

    def type_text(self, by, locator, text):
        self.logger.info(f"Typing '{text}' into element by {by} = '{locator}'")
        element = self.find_element(by, locator)
        element.send_keys(text)

    def is_displayed(self, by, locator):
        try:
            return self.find_element(by, locator).is_displayed()
        except Exception:
            return False
