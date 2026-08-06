import unittest
from automation.data.test_data_provider import TestDataProvider

class TestDashboard(unittest.TestCase):
    """Dashboard Suite (20 Test Cases)"""
    def setUp(self):
        self.tests = [tc for tc in TestDataProvider.get_all_test_cases() if tc["module"] == "Dashboard"]

    def test_run_dashboard_suite(self):
        self.assertEqual(len(self.tests), 20)
        for tc in self.tests:
            with self.subTest(tc=tc["test_id"]):
                self.assertEqual(tc["status"], "PASS")

if __name__ == "__main__":
    unittest.main()
