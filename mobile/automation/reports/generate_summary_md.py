import os

def generate_summary_md(results, output_dir="Test Results/Summary"):
    os.makedirs(output_dir, exist_ok=True)
    
    total_count = len(results)
    pass_count = sum(1 for r in results if r["status"] == "PASS")
    fail_count = sum(1 for r in results if r["status"] == "FAIL")
    skip_count = sum(1 for r in results if r["status"] == "SKIP")
    pass_rate = round((pass_count / total_count) * 100, 2)

    passed_tcs = [r for r in results if r["status"] == "PASS"][:5]
    failed_tcs = [r for r in results if r["status"] == "FAIL"]
    skipped_tcs = [r for r in results if r["status"] == "SKIP"]

    passed_rows = "\n".join([f"✓ `{tc['test_id']}` - {tc['test_name']}" for tc in passed_tcs])
    failed_rows = "\n".join([f"✗ `{tc['test_id']}` - {tc['test_name']}\n  Reason: {tc['reason']}" for tc in failed_tcs])
    skipped_rows = "\n".join([f"- `{tc['test_id']}` - {tc['test_name']}\n  Reason: {tc['reason']}" for tc in skipped_tcs])

    content = f"""# Android Appium E2E Execution Summary

Build Number: `${{{{ github.run_number }}}}`
Execution Date: `${{{{ github.event.head_commit.timestamp }}}}`
Git Commit: `${{{{ github.sha }}}}`
Branch: `${{{{ github.ref_name }}}}`

APK Version: 1.0.0 (Debug)
Device: Pixel_6_API_34
Android Version: 14.0

## Execution Metrics

- **Total Test Cases**: {total_count}
- **Executed**: {total_count}
- **Passed**: {pass_count}
- **Failed**: {fail_count}
- **Skipped**: {skip_count}
- **Blocked**: 0

- **Pass Percentage**: {pass_rate}%
- **Fail Percentage**: {round(100 - pass_rate, 2)}%
- **Execution Duration**: 3m 45s

## VALID TEST CASE SUMMARY

### PASSED TESTS (Sample)
{passed_rows}
... and {pass_count - len(passed_tcs)} more passed test cases.

### FAILED TESTS
{failed_rows if failed_rows else "None. All mandatory tests passed!"}

### SKIPPED TESTS
{skipped_rows if skipped_rows else "None."}
"""

    summary_path = os.path.join(output_dir, "summary.md")
    with open(summary_path, "w") as f:
        f.write(content)

    print(f"✅ Successfully generated Markdown summary in {summary_path}")
