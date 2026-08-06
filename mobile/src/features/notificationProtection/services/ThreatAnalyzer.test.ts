import { ThreatAnalyzer } from './ThreatAnalyzer';
import { classifyApp } from '../utils/appClassifier';

describe('Notification ThreatAnalyzer Unit Tests', () => {
  it('should detect OTP requests and phishing URLs in SMS', () => {
    const result = ThreatAnalyzer.analyze(
      'URGENT: State Bank Account Blocked',
      'Your account has been locked. Verify OTP immediately at http://bit.ly/sbi-verify or your funds will be frozen.',
      'com.google.android.apps.messaging'
    );
    expect(result.threatScore).toBeGreaterThanOrEqual(70);
    expect(['High Risk', 'Critical Scam']).toContain(result.riskLevel);
    expect(result.reasons.some(r => r.includes('OTP'))).toBe(true);
    expect(result.reasons.some(r => r.includes('shortened URL'))).toBe(true);
  });

  it('should detect email phishing scams with fake invoices & urgency', () => {
    const result = ThreatAnalyzer.analyze(
      'Security Alert: Unusual Sign-in Activity Detected',
      'Action required! Your account has been suspended due to overdue invoice payment. Verify your account immediately at http://verify-security.xyz/login',
      'com.google.android.gm'
    );
    expect(result.threatScore).toBeGreaterThanOrEqual(60);
    expect(['High Risk', 'Critical Scam']).toContain(result.riskLevel);
    expect(result.reasons.some(r => r.toLowerCase().includes('invoice') || r.toLowerCase().includes('urgency') || r.toLowerCase().includes('url'))).toBe(true);
  });

  it('should detect fake courier delivery fee traps', () => {
    const result = ThreatAnalyzer.analyze(
      'DHL Delivery Failed',
      'Your package delivery failed due to unpaid customs fee. Track your package and update address at http://bit.ly/dhl-customs',
      'com.delhivery'
    );
    expect(result.threatScore).toBeGreaterThanOrEqual(60);
    expect(['High Risk', 'Critical Scam']).toContain(result.riskLevel);
    expect(result.reasons.some(r => r.toLowerCase().includes('delivery') || r.toLowerCase().includes('courier'))).toBe(true);
  });

  it('should classify safe banking notifications cleanly', () => {
    const result = ThreatAnalyzer.analyze(
      'Account Statement Ready',
      'Your monthly e-statement for account ending in 4921 is ready for viewing in the official SBI app.',
      'com.sbi.upi'
    );
    expect(result.threatScore).toBeLessThan(40);
    expect(result.riskLevel).toBe('Safe');
  });

  it('should properly classify app package categories', () => {
    expect(classifyApp('com.google.android.gm').category).toBe('Gmail');
    expect(classifyApp('org.telegram.messenger').category).toBe('Telegram');
    expect(classifyApp('com.instagram.android').category).toBe('Instagram');
    expect(classifyApp('net.one97.paytm').category).toBe('UPI');
    expect(classifyApp('com.bluedart').category).toBe('Courier');
  });
});

