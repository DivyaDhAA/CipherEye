import { AppCategory } from '../types';

export interface AppInfo {
  name: string;
  category: AppCategory;
  isExcluded: boolean;
  icon: string;
}

const KNOWN_PACKAGES: Record<string, { name: string; category: AppCategory; icon: string }> = {
  // Messaging Apps
  'com.whatsapp': { name: 'WhatsApp', category: 'WhatsApp' as AppCategory, icon: '💬' },
  'com.whatsapp.w4b': { name: 'WhatsApp Business', category: 'WhatsApp' as AppCategory, icon: '💼' },

  // SMS & Messaging
  'com.google.android.apps.messaging': { name: 'Google Messages', category: 'Google Messages', icon: '💬' },
  'com.samsung.android.messaging': { name: 'Samsung Messages', category: 'Phone Messages', icon: '💬' },
  'com.android.mms': { name: 'SMS', category: 'SMS', icon: '✉️' },
  'org.telegram.messenger': { name: 'Telegram', category: 'Telegram', icon: '✈️' },
  'com.instagram.android': { name: 'Instagram', category: 'Instagram', icon: '📸' },
  'com.facebook.katana': { name: 'Facebook', category: 'Facebook', icon: '📘' },
  'com.facebook.orca': { name: 'Messenger', category: 'Messenger', icon: '⚡' },

  // Email
  'com.google.android.gm': { name: 'Gmail', category: 'Gmail', icon: '📧' },
  'com.microsoft.office.outlook': { name: 'Outlook', category: 'Outlook', icon: '📨' },

  // Banking & UPI Apps
  'com.google.android.apps.nfc.phone': { name: 'Google Pay', category: 'UPI', icon: '💳' },
  'net.one97.paytm': { name: 'Paytm', category: 'UPI', icon: '💰' },
  'com.phonepe.app': { name: 'PhonePe', category: 'UPI', icon: '💸' },
  'in.org.npci.upiapp': { name: 'BHIM UPI', category: 'UPI', icon: '🏦' },
  'com.sbi.upi': { name: 'YONO SBI', category: 'Banking', icon: '🏛️' },
  'com.hdfcbank.payzapp': { name: 'HDFC MobileBanking', category: 'Banking', icon: '🏛️' },
  'com.csam.icici.bank.imobile': { name: 'iMobile ICICI', category: 'Banking', icon: '🏛️' },
  'com.axis.mobile': { name: 'Axis Mobile', category: 'Banking', icon: '🏛️' },

  // Shopping Apps
  'com.amazon.mShop.android.shopping': { name: 'Amazon', category: 'Shopping', icon: '🛍️' },
  'com.flipkart.android': { name: 'Flipkart', category: 'Shopping', icon: '📦' },
  'com.myntra.android': { name: 'Myntra', category: 'Shopping', icon: '👗' },
  'com.meesho.supply': { name: 'Meesho', category: 'Shopping', icon: '🛒' },

  // Courier & Delivery Apps
  'com.bluedart': { name: 'BlueDart', category: 'Courier', icon: '🚚' },
  'com.delhivery': { name: 'Delhivery', category: 'Courier', icon: '📦' },
  'com.dtcd.express': { name: 'DTDC', category: 'Courier', icon: '🚚' },
  'com.application.zomato': { name: 'Zomato', category: 'Courier', icon: '🍔' },
  'com.swiggy.android': { name: 'Swiggy', category: 'Courier', icon: '🛵' },
};

export const classifyApp = (packageName: string): AppInfo => {
  const pkgLower = (packageName || '').toLowerCase().trim();

  if (pkgLower.includes('whatsapp')) {
    return {
      name: pkgLower.includes('w4b') ? 'WhatsApp Business' : 'WhatsApp',
      category: 'WhatsApp' as AppCategory,
      isExcluded: false,
      icon: '💬',
    };
  }

  if (KNOWN_PACKAGES[pkgLower]) {
    const info = KNOWN_PACKAGES[pkgLower];
    return {
      ...info,
      isExcluded: info.category === 'Excluded',
    };
  }

  // Fallback pattern matching
  if (pkgLower.includes('sms') || pkgLower.includes('message') || pkgLower.includes('mms')) {
    return { name: 'SMS / Messages', category: 'SMS', isExcluded: false, icon: '💬' };
  }
  if (pkgLower.includes('mail') || pkgLower.includes('email')) {
    return { name: 'Email App', category: 'Gmail', isExcluded: false, icon: '📧' };
  }
  if (pkgLower.includes('bank') || pkgLower.includes('pay') || pkgLower.includes('upi') || pkgLower.includes('wallet')) {
    return { name: 'Banking App', category: 'Banking', isExcluded: false, icon: '🏛️' };
  }
  if (pkgLower.includes('shop') || pkgLower.includes('cart') || pkgLower.includes('store')) {
    return { name: 'Shopping App', category: 'Shopping', isExcluded: false, icon: '🛒' };
  }
  if (pkgLower.includes('express') || pkgLower.includes('courier') || pkgLower.includes('delivery')) {
    return { name: 'Courier Service', category: 'Courier', isExcluded: false, icon: '📦' };
  }

  // Formatted fallback for unknown apps
  const parts = pkgLower.split('.');
  const rawName = parts.length > 1 ? parts[parts.length - 1] : pkgLower;
  const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  return {
    name: formattedName || 'Application',
    category: 'Unknown',
    isExcluded: false,
    icon: '📱',
  };
};
