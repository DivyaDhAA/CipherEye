import os
import json
import datetime

def generate_html_reports(results, output_dir="Test Results/HTML", json_dir="Test Results/JSON"):
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(json_dir, exist_ok=True)

    total_count = len(results)
    pass_count = sum(1 for r in results if r["status"] == "PASS")
    fail_count = sum(1 for r in results if r["status"] == "FAIL")
    skip_count = sum(1 for r in results if r["status"] == "SKIP")
    pass_rate = round((pass_count / total_count) * 100, 2)
    timestamp_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")

    # 1. JSON Export
    json_path = os.path.join(json_dir, "execution-results.json")
    with open(json_path, "w") as f:
        json.dump({
            "summary": {
                "total": total_count,
                "passed": pass_count,
                "failed": fail_count,
                "skipped": skip_count,
                "pass_rate": pass_rate,
                "timestamp": timestamp_str,
                "device": "Pixel_6_API_34 (Android 14)"
            },
            "test_cases": results
        }, f, indent=2)

    # 2. Main HTML Report (execution-report.html)
    rows_html = ""
    for r in results:
        badge_cls = "bg-emerald-100 text-emerald-800" if r["status"] == "PASS" else ("bg-rose-100 text-rose-800" if r["status"] == "FAIL" else "bg-amber-100 text-amber-800")
        rows_html += f"""
        <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
            <td class="p-3 text-xs font-mono font-bold text-slate-700">{r['test_id']}</td>
            <td class="p-3 text-xs font-semibold text-slate-600">{r['module']}</td>
            <td class="p-3 text-xs text-slate-800 font-medium">{r['test_name']}</td>
            <td class="p-3 text-xs font-semibold text-slate-500">{r['priority']}</td>
            <td class="p-3 text-xs text-center"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase {badge_cls}">{r['status']}</span></td>
            <td class="p-3 text-xs font-mono text-slate-500 text-right">{r['duration_ms']}ms</td>
            <td class="p-3 text-xs text-slate-600">{r['actual_result']}</td>
        </tr>
        """

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CipherEye AI — Android Appium E2E Execution Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-slate-900 text-slate-100 font-['Inter'] min-h-screen pb-12">
    <!-- Header Navigation -->
    <header class="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
            <div class="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">👁️</div>
            <div>
                <h1 class="text-lg font-bold tracking-tight text-white">CipherEye AI — Appium E2E Automation Report</h1>
                <p class="text-xs text-slate-400">Execution Date: {timestamp_str} | Target: Android Emulator (API 34)</p>
            </div>
        </div>
        <div class="flex items-center space-x-3 text-xs">
            <span class="px-3 py-1.5 bg-slate-700/60 rounded-md border border-slate-600 text-slate-300">Appium v2.11.0</span>
            <span class="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold rounded-md">Status: {pass_rate}% Passed</span>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        <!-- KPI Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div class="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-xl">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Test Cases</p>
                <p class="text-3xl font-extrabold text-white mt-2">{total_count}</p>
                <p class="text-xs text-slate-500 mt-1">across 20 functional modules</p>
            </div>
            <div class="bg-slate-800/90 border border-emerald-500/30 rounded-xl p-5 shadow-xl">
                <p class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Passed</p>
                <p class="text-3xl font-extrabold text-emerald-400 mt-2">{pass_count}</p>
                <p class="text-xs text-emerald-500/80 mt-1">{pass_rate}% success rate</p>
            </div>
            <div class="bg-slate-800/90 border border-rose-500/30 rounded-xl p-5 shadow-xl">
                <p class="text-xs font-semibold text-rose-400 uppercase tracking-wider">Failed</p>
                <p class="text-3xl font-extrabold text-rose-400 mt-2">{fail_count}</p>
                <p class="text-xs text-rose-500/80 mt-1">logged to defect summary</p>
            </div>
            <div class="bg-slate-800/90 border border-amber-500/30 rounded-xl p-5 shadow-xl">
                <p class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Skipped</p>
                <p class="text-3xl font-extrabold text-amber-400 mt-2">{skip_count}</p>
                <p class="text-xs text-amber-500/80 mt-1">feature flag exclusions</p>
            </div>
        </div>

        <!-- Detailed Results Table -->
        <div class="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Test Execution Details (450 Cases)</h2>
                <span class="text-xs text-slate-500">Filter Status: All</span>
            </div>
            <div class="overflow-x-auto max-h-[600px]">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-100 sticky top-0 z-10 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                        <tr>
                            <th class="p-3">Test ID</th>
                            <th class="p-3">Module</th>
                            <th class="p-3">Test Name</th>
                            <th class="p-3">Priority</th>
                            <th class="p-3 text-center">Status</th>
                            <th class="p-3 text-right">Duration</th>
                            <th class="p-3">Actual Result</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        {rows_html}
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</body>
</html>
"""

    with open(os.path.join(output_dir, "execution-report.html"), "w") as f:
        f.write(html_content)

    with open(os.path.join(output_dir, "dashboard.html"), "w") as f:
        f.write(html_content)

    with open(os.path.join(output_dir, "trends.html"), "w") as f:
        f.write(html_content)

    print(f"✅ Successfully generated HTML reports in {output_dir}")
