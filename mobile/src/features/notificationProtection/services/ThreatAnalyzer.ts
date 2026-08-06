import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScamRiskLevel, NotificationScanResult, SensitivityLevel } from '../types';
import { classifyApp } from '../utils/appClassifier';

export interface ThreatAnalysisOutput {
  threatScore: number;
  confidence: number;
  riskLevel: ScamRiskLevel;
  explanation: string;
  reasons: string[];
  recommendedAction: string;
}

const STORAGE_KEY_TOKEN = 'ciphereye_token';

const SUSPICIOUS_PATTERNS = [
  // OTP & Credentials
  { pattern: /\b(otp|one time password|verification code|security code|2fa code|passcode)\b/i, weight: 25, reason: 'Requests sensitive OTP / Verification Code' },
  { pattern: /\b(do not share|dont share|never share)\b/i, weight: -10, reason: 'Contains standard OTP security caution text' },

  // Psychological Urgency & Account Status Traps
  { pattern: /\b(urgent|immediately|action required|suspended|locked|blocked|deactivated|expire|expiration|24 hours|limited time|unusual sign-in|unusual activity|security alert|unauthorized access)\b/i, weight: 25, reason: 'Uses high-urgency psychological pressure tactics or fake account lock alerts' },

  // Email Phishing, Fake Invoices & Billing Traps
  { pattern: /\b(verify your account|update billing|payment (failed|overdue|due)|invoice (attached|pending|#?\d+)|order confirmation|receipt attached|subscription renewal|billing statement)\b/i, weight: 25, reason: 'Employs fake email invoice, billing, or account verification triggers' },

  // Lottery, Prize & Reward Scams
  { pattern: /\b(win|winner|won|congratulations|congrats|lottery|lucky draw|kbc|prize|reward|claim|claimed|bonus|free gift|jackpot|car|nexon)\b/i, weight: 45, reason: 'Promotes fake lottery, car prize, or lucky draw claims' },

  // Banking & Financial Impersonation
  { pattern: /\b(bank|account|kyc|pancard|pan card|aadhaar|update details|verify identity|netbanking)\b/i, weight: 20, reason: 'Impersonates banking / KYC compliance queries' },
  { pattern: /\b(refund|cashback|amount credited|debited|transaction failed|unauthorized transaction)\b/i, weight: 20, reason: 'Mentions financial refund / unauthorized debit triggers' },

  // Shortened URLs & High-Risk TLDs
  { pattern: /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly|xyz|top|work|click|site|online|live|club|info|tech|vip|cc|tk|gq|ml)\b/i, weight: 35, reason: 'Contains suspicious or shortened URL link redirect' },
  { pattern: /https?:\/\/[^\s]+/i, weight: 15, reason: 'Directs user to an external web link' },

  // Crypto & Investment Scams
  { pattern: /\b(crypto|bitcoin|usdt|investment|double your money|guaranteed returns|forex|trader)\b/i, weight: 30, reason: 'Promotes high-risk cryptocurrency or fake investment schemes' },

  // Fake Courier & Package Delivery Traps
  { pattern: /\b(package|courier|delivery failed|customs fee|address update|track your package|dhl|fedex|usps|shipment pending)\b/i, weight: 25, reason: 'Fake courier / package delivery fee trap' },

  // Tech Support & Virus Warning Scams
  { pattern: /\b(virus detected|system infected|compromised|call support|helpline|support team|microsoft support|apple support)\b/i, weight: 30, reason: 'Fake tech support or malware alert trap' },

  // Government & Tax Impersonation
  { pattern: /\b(tax refund|irs|income tax|penalty|fine|court summons|government subsidy)\b/i, weight: 25, reason: 'Impersonates government tax / penalty authority' },
];

export class ThreatAnalyzer {
  static analyze(
    title: string,
    body: string,
    packageName: string,
    sensitivity: SensitivityLevel = 'Medium'
  ): ThreatAnalysisOutput {
    const combinedText = `${title || ''} ${body || ''}`.trim();
    const appInfo = classifyApp(packageName);

    if (appInfo.isExcluded) {
      return {
        threatScore: 0,
        confidence: 100,
        riskLevel: 'Safe',
        explanation: 'App is excluded from monitoring',
        reasons: ['App excluded from security scans'],
        recommendedAction: 'No action needed.',
      };
    }

    if (!combinedText) {
      return {
        threatScore: 0,
        confidence: 90,
        riskLevel: 'Safe',
        explanation: 'Empty notification content',
        reasons: ['No text content detected'],
        recommendedAction: 'Safe to dismiss.',
      };
    }

    let score = 5; // Base minimum baseline
    const detectedReasons: string[] = [];

    // Evaluate heuristic patterns
    SUSPICIOUS_PATTERNS.forEach(({ pattern, weight, reason }) => {
      if (pattern.test(combinedText)) {
        score += weight;
        if (weight > 0 && !detectedReasons.includes(reason)) {
          detectedReasons.push(reason);
        }
      }
    });

    // Sensitivity multiplier adjustment
    if (sensitivity === 'High') {
      score = Math.round(score * 1.25);
    } else if (sensitivity === 'Low') {
      score = Math.round(score * 0.85);
    }

    // Cap score within 0-100 range
    score = Math.min(100, Math.max(0, score));

    // Calculate confidence rating based on reason density
    let confidence = 75 + Math.min(20, detectedReasons.length * 7);

    // Risk level classification mapping
    let riskLevel: ScamRiskLevel = 'Safe';
    let recommendedAction = 'No threat detected. Proceed as normal.';

    if (score >= 80) {
      riskLevel = 'Critical Scam';
      recommendedAction = '⚠️ HIGH RISK SCAM DETECTED: Do NOT click any links, do NOT share OTPs or send money. Block sender immediately.';
    } else if (score >= 60) {
      riskLevel = 'High Risk';
      recommendedAction = '⚠️ POTENTIAL PHISHING: Inspect sender identity carefully. Avoid opening included links or sharing credentials.';
    } else if (score >= 40) {
      riskLevel = 'Medium Risk';
      recommendedAction = '⚡ SUSPICIOUS NOTIFICATION: Verify source authenticity directly via official app or phone number.';
    } else if (score >= 30) {
      riskLevel = 'Low Risk';
      recommendedAction = 'Low risk detected. Exercise standard caution with unfamiliar senders.';
    }

    if (detectedReasons.length === 0) {
      detectedReasons.push('No known fraud or phishing indicators detected');
    }

    const explanation = detectedReasons.join(' • ');

    return {
      threatScore: score,
      confidence,
      riskLevel,
      explanation,
      reasons: detectedReasons,
      recommendedAction,
    };
  }

  static async analyzeWithBackend(
    title: string,
    body: string,
    packageName: string,
    apiBaseUrl?: string,
    sensitivity: SensitivityLevel = 'Medium'
  ): Promise<ThreatAnalysisOutput> {
    // Run local heuristic analysis as baseline
    const localResult = this.analyze(title, body, packageName, sensitivity);

    if (!apiBaseUrl) {
      return localResult;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Fetch stored JWT token if available for authenticated scan recording
      const token = await AsyncStorage.getItem(STORAGE_KEY_TOKEN).catch(() => null);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/scans/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'Message',
          inputData: `${title}: ${body}`,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.threatScore === 'number') {
          const remoteScore = data.threatScore;
          const blendedScore = Math.round((localResult.threatScore * 0.4) + (remoteScore * 0.6));
          
          let blendedRisk: ScamRiskLevel = 'Safe';
          if (blendedScore >= 80) blendedRisk = 'Critical Scam';
          else if (blendedScore >= 60) blendedRisk = 'High Risk';
          else if (blendedScore >= 40) blendedRisk = 'Medium Risk';
          else if (blendedScore >= 30) blendedRisk = 'Low Risk';

          return {
            ...localResult,
            threatScore: blendedScore,
            riskLevel: blendedRisk,
            confidence: Math.max(localResult.confidence, Math.round((data.confidence || 0.85) * 100)),
            explanation: data.explanation || localResult.explanation,
          };
        }
      }
    } catch (err) {
      // Fallback cleanly to local analysis result
    }

    return localResult;
  }
}

