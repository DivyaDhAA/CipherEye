from automation.pages.base_page import BasePage

class LoginPage(BasePage):
    USERNAME_FIELD = "com.ciphereye.scamprotection:id/input_username"
    PASSWORD_FIELD = "com.ciphereye.scamprotection:id/input_password"
    LOGIN_BUTTON = "com.ciphereye.scamprotection:id/btn_login"
    BIOMETRIC_BUTTON = "com.ciphereye.scamprotection:id/btn_biometric"

    def login(self, username, password):
        self.type_text("id", self.USERNAME_FIELD, username)
        self.type_text("id", self.PASSWORD_FIELD, password)
        self.click("id", self.LOGIN_BUTTON)

    def trigger_biometric_login(self):
        self.click("id", self.BIOMETRIC_BUTTON)
