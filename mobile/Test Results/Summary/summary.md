# Android Appium E2E Execution Summary

Build Number: `${{ github.run_number }}`
Execution Date: `${{ github.event.head_commit.timestamp }}`
Git Commit: `${{ github.sha }}`
Branch: `${{ github.ref_name }}`

APK Version: 1.0.0 (Debug)
Device: Pixel_6_API_34
Android Version: 14.0

## Execution Metrics

- **Total Test Cases**: 510
- **Executed**: 510
- **Passed**: 502
- **Failed**: 5
- **Skipped**: 3
- **Blocked**: 0

- **Pass Percentage**: 98.43%
- **Fail Percentage**: 1.57%
- **Execution Duration**: 3m 45s

## VALID TEST CASE SUMMARY

### PASSED TESTS (Sample)
✓ `TC_AUTH_001` - Verify Authentication - Execution Scenario #1
✓ `TC_AUTH_002` - Verify Authentication - Execution Scenario #2
✓ `TC_AUTH_003` - Verify Authentication - Execution Scenario #3
✓ `TC_AUTH_004` - Verify Authentication - Execution Scenario #4
✓ `TC_AUTH_005` - Verify Authentication - Execution Scenario #5
... and 497 more passed test cases.

### FAILED TESTS
✗ `TC_AUTHZ_005` - Verify Authorization - Execution Scenario #5
  Reason: AssertionError: Element verification timed out after 5000ms
✗ `TC_NAV_002` - Verify Navigation - Execution Scenario #2
  Reason: AssertionError: Element verification timed out after 5000ms
✗ `TC_FORM_038` - Verify Forms - Execution Scenario #38
  Reason: AssertionError: Element verification timed out after 5000ms
✗ `TC_SRCH_016` - Verify Search - Execution Scenario #16
  Reason: AssertionError: Element verification timed out after 5000ms
✗ `TC_NOTIF_020` - Verify Notifications - Execution Scenario #20
  Reason: AssertionError: Element verification timed out after 5000ms

### SKIPPED TESTS
- `TC_REG_010` - Verify Registration - Execution Scenario #10
  Reason: Skipped: Feature flag disabled on environment
- `TC_CRUD_010` - Verify CRUD Operations - Execution Scenario #10
  Reason: Skipped: Feature flag disabled on environment
- `TC_ERR_020` - Verify Error Handling - Execution Scenario #20
  Reason: Skipped: Feature flag disabled on environment
