from automation.pages.base_page import BasePage

class NotificationPage(BasePage):
    ENABLE_PROTECTION_SWITCH = "com.ciphereye.scamprotection:id/switch_protection"
    PERMISSION_STATUS_TXT = "com.ciphereye.scamprotection:id/txt_permission_status"
    REQUEST_PERMISSION_BTN = "com.ciphereye.scamprotection:id/btn_request_permission"
    SIMULATE_NOTIF_BTN = "com.ciphereye.scamprotection:id/btn_simulate_notification"

    def is_permission_granted(self):
        return self.is_displayed("id", self.PERMISSION_STATUS_TXT)

    def request_permission(self):
        self.click("id", self.REQUEST_PERMISSION_BTN)

    def trigger_simulated_scam(self):
        self.click("id", self.SIMULATE_NOTIF_BTN)
