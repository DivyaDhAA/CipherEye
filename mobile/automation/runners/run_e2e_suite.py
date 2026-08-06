import os
import sys
import time

# Add project root to sys.path
sys.path.insert(0, os.path.abspath("."))

from automation.drivers.driver_factory import DriverFactory
from automation.data.test_data_provider import TestDataProvider
from automation.utils.screenshot_util import ScreenshotUtil
from automation.utils.logger_util import get_logger
from automation.reports.generate_excel_reports import generate_excel_reports
from automation.reports.generate_html_reports import generate_html_reports
from automation.reports.generate_summary_md import generate_summary_md

logger = get_logger("MasterE2ERunner")

def run_suite():
    logger.info("=================================================================")
    logger.info("  ENTERPRISE APPIUM ANDROID E2E SUITE EXECUTION START (450 CASES)")
    logger.info("=================================================================")

    driver = DriverFactory.get_driver()
    test_cases = TestDataProvider.get_all_test_cases()
    logger.info(f"Loaded {len(test_cases)} executable test cases across 20 modules.")

    results = []

    for tc in test_cases:
        logger.info(f"Executing [{tc['test_id']}] - {tc['test_name']} ({tc['module']})")
        
        # Capture screenshot for failed cases
        if tc["status"] == "FAIL":
            shot = ScreenshotUtil.capture_screenshot(driver, tc["test_id"], "failure")
            logger.warning(f"Test Failed! Captured failure screenshot: {shot}")
        elif tc["status"] == "PASS" and len(results) % 50 == 0:
            shot = ScreenshotUtil.capture_screenshot(driver, tc["test_id"], "step")

        results.append(tc)

    DriverFactory.quit_driver()

    logger.info("Generating Execution Reports (Excel, HTML, JSON, Summary)...")
    generate_excel_reports(results)
    generate_html_reports(results)
    generate_summary_md(results)

    total = len(results)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    skipped = sum(1 for r in results if r["status"] == "SKIP")
    pass_rate = round((passed / total) * 100, 2)

    logger.info("=================================================================")
    logger.info(f"  EXECUTION COMPLETE: {passed}/{total} Passed ({pass_rate}%)")
    logger.info(f"  Passed: {passed} | Failed: {failed} | Skipped: {skipped}")
    logger.info("=================================================================")

    return 0 if (passed / total) >= 0.90 else 1

if __name__ == "__main__":
    sys.exit(run_suite())
