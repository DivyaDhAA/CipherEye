import unittest
from automation.data.test_data_provider import TestDataProvider

class TestAuthentication(unittest.TestCase):
    """Authentication Suite (40 Test Cases)"""
    def setUp(self):
        self.tests = [tc for tc in TestDataProvider.get_all_test_cases() if tc["module"] == "Authentication"]

    def test_run_auth_suite(self):
        self.assertEqual(len(self.tests), 40)
        for tc in self.tests:
            with self.subTest(tc=tc["test_id"]):
                if tc["status"] == "FAIL":
                    self.fail(tc["reason"])
                elif tc["status"] == "SKIP":
                    self.skipTest(tc["reason"])
                self.assertEqual(tc["status"], "PASS")

if __name__ == "__main__":
    unittest.main()
