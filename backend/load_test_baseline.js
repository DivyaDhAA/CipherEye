const http = require('http');

const TARGET_HOST = 'localhost';
const TARGET_PORT = 5001;
const CONCURRENT_USERS = 100;
const DURATION_SECONDS = 60;

const PAYLOADS = [
  { type: 'Message', inputData: 'Dear Customer, your bank account has been blocked due to missing KYC update. Click http://sbi-verify.xyz immediately.' },
  { type: 'Message', inputData: 'Congratulations! You won a Tata Nexon car in KBC Lucky Draw 2026! Claim your reward now.' },
  { type: 'Link', inputData: 'http://efejfhunfipfo.com' },
  { type: 'URL', inputData: 'https://paypal-verify.xyz/login' },
  { type: 'URL', inputData: 'https://google.com' },
  { type: 'Message', inputData: 'Your OTP for login is 482910. Do not share with anyone.' }
];

let totalRequests = 0;
let successRequests = 0;
let failedRequests = 0;
const responseTimes = [];
const statusCodes = {};

let stopTesting = false;

function makeRequest(userId) {
  if (stopTesting) return;

  const payload = PAYLOADS[Math.floor(Math.random() * PAYLOADS.length)];
  const postData = JSON.stringify(payload);

  const startTime = process.hrtime.bigint();

  const req = http.request({
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: '/api/v1/scans/analyze',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 5000
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const endTime = process.hrtime.bigint();
      const latencyMs = Number(endTime - startTime) / 1e6;

      totalRequests++;
      statusCodes[res.statusCode] = (statusCodes[res.statusCode] || 0) + 1;

      if (res.statusCode >= 200 && res.statusCode < 300) {
        successRequests++;
        responseTimes.push(latencyMs);
      } else {
        failedRequests++;
      }

      // Immediately queue next request for this virtual user loop
      if (!stopTesting) {
        setImmediate(() => makeRequest(userId));
      }
    });
  });

  req.on('error', (err) => {
    const endTime = process.hrtime.bigint();
    const latencyMs = Number(endTime - startTime) / 1e6;

    totalRequests++;
    failedRequests++;
    statusCodes['ERR'] = (statusCodes['ERR'] || 0) + 1;

    if (!stopTesting) {
      setTimeout(() => makeRequest(userId), 100);
    }
  });

  req.on('timeout', () => {
    req.destroy();
  });

  req.write(postData);
  req.end();
}

console.log(`====================================================`);
console.log(`🚀 STARTING BASELINE / LOAD TEST`);
console.log(`====================================================`);
console.log(`• Virtual Concurrent Users : ${CONCURRENT_USERS}`);
console.log(`• Duration                  : ${DURATION_SECONDS} seconds (1 minute)`);
console.log(`• Target Endpoint           : http://${TARGET_HOST}:${TARGET_PORT}/api/v1/scans/analyze`);
console.log(`====================================================\n`);

const testStartTime = Date.now();

// Launch 100 concurrent virtual users
for (let i = 0; i < CONCURRENT_USERS; i++) {
  makeRequest(i);
}

// Progress reporter every 10 seconds
const progressInterval = setInterval(() => {
  const elapsed = Math.floor((Date.now() - testStartTime) / 1000);
  const currentRps = (totalRequests / (elapsed || 1)).toFixed(1);
  console.log(`⏱️ [${elapsed}s / ${DURATION_SECONDS}s] Total Requests: ${totalRequests} | Current RPS: ${currentRps} req/sec | Success: ${successRequests}`);
}, 10000);

// Stop test after 60 seconds
setTimeout(() => {
  stopTesting = true;
  clearInterval(progressInterval);

  const totalTimeSeconds = (Date.now() - testStartTime) / 1000;
  const rps = (totalRequests / totalTimeSeconds).toFixed(2);

  responseTimes.sort((a, b) => a - b);

  const min = responseTimes.length > 0 ? responseTimes[0].toFixed(2) : 0;
  const max = responseTimes.length > 0 ? responseTimes[responseTimes.length - 1].toFixed(2) : 0;
  const avg = responseTimes.length > 0 ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2) : 0;
  const p50 = responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.50)].toFixed(2) : 0;
  const p95 = responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.95)].toFixed(2) : 0;
  const successRate = ((successRequests / (totalRequests || 1)) * 100).toFixed(2);

  console.log(`\n====================================================`);
  console.log(`📊 LOAD TEST RESULTS (1 MINUTE BASELINE)`);
  console.log(`====================================================`);
  console.log(`• Total Requests Sent : ${totalRequests}`);
  console.log(`• Successful Requests  : ${successRequests} (${successRate}%)`);
  console.log(`• Failed Requests      : ${failedRequests}`);
  console.log(`• Requests Per Sec     : ${rps} req/sec`);
  console.log(`----------------------------------------------------`);
  console.log(`⚡ RESPONSE TIME METRICS`);
  console.log(`----------------------------------------------------`);
  console.log(`• Fastest (Min)       : ${min} ms`);
  console.log(`• Average              : ${avg} ms`);
  console.log(`• Median (p50)         : ${p50} ms`);
  console.log(`• 95th Percentile (p95): ${p95} ms`);
  console.log(`• Slowest (Max)        : ${max} ms`);
  console.log(`----------------------------------------------------`);
  console.log(`HTTP Status Code Distribution:`, statusCodes);
  console.log(`====================================================\n`);

  const results = {
    testName: "Baseline / Load Testing (100 Concurrent Users)",
    concurrentUsers: CONCURRENT_USERS,
    durationSeconds: totalTimeSeconds,
    totalRequests,
    successRequests,
    failedRequests,
    requestsPerSecond: parseFloat(rps),
    responseTime: {
      minMs: parseFloat(min),
      avgMs: parseFloat(avg),
      p50Ms: parseFloat(p50),
      p95Ms: parseFloat(p95),
      maxMs: parseFloat(max)
    },
    statusCodes
  };

  const fs = require('fs');
  fs.writeFileSync('./load_test_baseline_results.json', JSON.stringify(results, null, 2));
  console.log(`Results saved to load_test_baseline_results.json`);
}, DURATION_SECONDS * 1000);
