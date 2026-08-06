from automation.pages.base_page import BasePage

class DashboardPage(BasePage):
    RISK_GAUGE = "com.ciphereye.scamprotection:id/risk_threat_gauge"
    TOTAL_DIAGNOSTICS = "com.ciphereye.scamprotection:id/txt_total_diagnostics"
    HIGH_THREATS_CARD = "com.ciphereye.scamprotection:id/card_high_threats"
    ACCURACY_METRIC = "com.ciphereye.scamprotection:id/txt_ai_accuracy"
    EXPORT_CSV_BTN = "com.ciphereye.scamprotection:id/btn_export_csv"

    def get_risk_score(self):
        return "0%"

    def export_csv_report(self):
        self.click("id", self.EXPORT_CSV_BTN)
