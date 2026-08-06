import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  Alert, ActivityIndicator, TextInput, Switch, Dimensions, Platform, 
  NativeModules
} from 'react-native';
import { Colors } from '../constants/Colors';
import { CyberInput } from '../components/CyberInput';
import { CyberButton } from '../components/CyberButton';
import { ThreatCard } from '../components/ThreatCard';
import {
  useNotificationProtection,
  NotificationHistoryScreen,
  NotificationSettingsScreen,
  NotificationAnalysisScreen,
  NotificationScanResult,
} from '../features/notificationProtection';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  user: any;
  token: string;
  apiBaseUrl: string;
  onLogout: () => void;
  onUpdateServerIp: (ip: string) => Promise<string>;
}

interface ThreatReport {
  id: string;
  type: string;
  inputData: string;
  threatScore: number;
  riskLevel: string;
  confidence: number;
  explanation: string;
  createdAt: string;
}

interface ChatMsg {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  token,
  apiBaseUrl,
  onLogout,
  onUpdateServerIp
}) => {
  // Navigation: 'home' | 'scanner' | 'ai-chat' | 'threats' | 'profile' | 'notif-protection'
  const [activeTab, setActiveTab] = useState<'home' | 'scanner' | 'ai-chat' | 'threats' | 'profile' | 'notif-protection'>('home');
  const [notifSubView, setNotifSubView] = useState<'history' | 'settings' | 'analysis'>('history');
  const [selectedNotifReport, setSelectedNotifReport] = useState<NotificationScanResult | null>(null);

  const notifProtection = useNotificationProtection(apiBaseUrl);
  console.log(
  "NotificationListenerModule =",
  NativeModules.NotificationListenerModule
);

useEffect(() => {
  console.log(
    "Permission =",
    notifProtection.permissionGranted
  );
}, [notifProtection.permissionGranted]);

  // Scanner workspace state: 'website' | 'link' | 'qr' | 'sms' | 'email'
  const [activeScanner, setActiveScanner] = useState<'website' | 'link' | 'qr' | 'sms' | 'email'>('website');

  // Interactive Scan Inputs
  const [websiteInput, setWebsiteInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [qrInputText, setQrInputText] = useState('');
  const [smsInputText, setSmsInputText] = useState('');
  const [emailInputText, setEmailInputText] = useState('');

  // Scan Results & History States
  const [scanLoading, setScanLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ThreatReport | null>(null);
  const [scanHistory, setScanHistory] = useState<ThreatReport[]>([
    {
      id: 'CE-9402',
      type: 'Website',
      inputData: 'https://login-verify-paypal.secure-update.xyz/signin',
      threatScore: 87,
      riskLevel: 'High',
      confidence: 94,
      explanation: 'Domain matches high-risk pattern hijacks. SSL certificate issued recently (<30 days). IP blocklisted in spam registries.',
      createdAt: '1h ago'
    },
    {
      id: 'CE-2081',
      type: 'SMS',
      inputData: 'URGENT: SecureChecking account deactivated. Unlock credential logs: http://capitalone-account-verify.info',
      threatScore: 92,
      riskLevel: 'High',
      confidence: 98,
      explanation: 'SMS templates use high-urgency keywords to coerce credential entries.',
      createdAt: '3h ago'
    },
    {
      id: 'CE-4402',
      type: 'Link',
      inputData: 'https://google.com',
      threatScore: 4,
      riskLevel: 'Safe',
      confidence: 99,
      explanation: 'Domain age is >20 years. Certified SSL records checked. Safe status.',
      createdAt: 'Yesterday'
    }
  ]);

  // AI Chat Bot Advisor states
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { id: '1', sender: 'assistant', text: 'Hello! I am Cypher AI, your mobile threat advisor. Audit links, SMS text logs, EML files, or QR redirects here.', time: '2:15 PM' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Live Threats Incident Feed
  const [liveIncidents, setLiveIncidents] = useState<Array<{ id: string; time: string; origin: string; type: string; risk: 'High' | 'Medium' | 'Low' }>>([
    { id: '1', time: '14:13:02', origin: 'Beijing, CN (221.4.18.9)', type: 'SQL Injection block', risk: 'High' },
    { id: '2', time: '14:13:10', origin: 'Sofia, BG (193.102.1.88)', type: 'Quishing QR decoded', risk: 'Medium' },
    { id: '3', time: '14:13:18', origin: 'Moscow, RU (185.12.4.9)', type: 'SMS threat quarantined', risk: 'High' },
    { id: '4', time: '14:13:24', origin: 'Dallas, US (74.200.12.4)', type: 'Clean SSL Audit', risk: 'Low' }
  ]);
  const [attackPulse, setAttackPulse] = useState(0);

  // Settings states
  const [settingsDarkMode, setSettingsDarkMode] = useState(false);
  const [settingsMFA, setSettingsMFA] = useState(true);
  const [settingsAlerts, setSettingsAlerts] = useState(true);
  const [settingsScanner, setSettingsScanner] = useState<'Standard' | 'Strict' | 'Heuristic'>('Standard');
  const [serverUrl, setServerUrl] = useState(apiBaseUrl.replace('/api/v1', ''));
  const [updatingIp, setUpdatingIp] = useState(false);

  const highRiskCount = scanHistory.filter(r => r.riskLevel === 'High').length;

  // Global Threat Map Tick Effect
  useEffect(() => {
    const interval = setInterval(() => {
      const origins = [
        { name: 'Shenzhen, CN', ip: '202.43.18.9' },
        { name: 'St. Petersburg, RU', ip: '95.101.44.18' },
        { name: 'Sofia, BG', ip: '82.200.10.4' },
        { name: 'Frankfurt, DE', ip: '94.103.1.20' }
      ];
      const types = ['Phishing URL decoded', 'Malicious EML attachment blocked', 'XSS Injection quarantined', 'Suspicious SMS traced'];
      const risks: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

      const randomOrigin = origins[Math.floor(Math.random() * origins.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomRisk = risks[Math.floor(Math.random() * risks.length)];
      const timestamp = new Date().toTimeString().split(' ')[0];

      setLiveIncidents(prev => [
        {
          id: Math.random().toString(),
          time: timestamp,
          origin: `${randomOrigin.name} (${randomOrigin.ip})`,
          type: randomType,
          risk: randomRisk
        },
        ...prev.slice(0, 5)
      ]);
      setAttackPulse(prev => (prev + 1) % 4);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Password / scan indicator calculators
  const getMockScanResult = (type: string, input: string) => {
    const lowInput = input.toLowerCase();
    let score = 6;
    let risk = 'Safe';
    let explanation = 'Asset checked. Reputation score is clear. Certified SSL configurations matched safety credentials.';

    if (lowInput.includes('paypal') || lowInput.includes('verify') || lowInput.includes('secure') || lowInput.includes('locked') || lowInput.includes('urgent') || lowInput.includes('bank') || lowInput.includes('win') || lowInput.includes('xyz')) {
      score = 91;
      risk = 'High';
      explanation = 'Brand keywords hijacked. Top-level domains represent high fraud risks (.xyz). Blacklisted IP host matched.';
    } else if (lowInput.includes('warning') || lowInput.includes('check')) {
      score = 48;
      risk = 'Medium';
      explanation = 'Redirect chain detected. Registrar domain age is under 90 days. Exercise caution.';
    }

    return {
      id: 'CE-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
      type,
      inputData: input,
      threatScore: score,
      riskLevel: risk,
      confidence: 96,
      explanation,
      createdAt: 'Just now'
    };
  };

  // Launch Scanners
  const handleLaunchScan = (type: string, input: string) => {
    if (!input) {
      Alert.alert('Scan Failed', 'Please input content to analyze.');
      return;
    }
    setScanLoading(true);
    setCurrentResult(null);

    setTimeout(() => {
      const result = getMockScanResult(type, input);
      setCurrentResult(result);
      setScanHistory(prev => [result, ...prev]);
      setScanLoading(false);
      triggerScansToast(result.riskLevel, result.threatScore);
    }, 1800);
  };

  const triggerScansToast = (risk: string, score: number) => {
    Alert.alert(
      risk === 'High' ? '🚨 Threat Detected' : (risk === 'Medium' ? '⚠️ Warning Triggered' : '🛡️ Safe Verdict'),
      `Diagnostic finished. Risk Level: ${risk} (${score}% score). View report below.`
    );
  };

  // Chat advisor message handler
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMsg = {
      id: Math.random().toString(),
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    const query = chatInput;
    setChatInput('');
    setAiTyping(true);

    setTimeout(() => {
      let reply = 'I have evaluated your threat vector queries. Let me know if you would like me to audit a link or text message.';
      const lowQuery = query.toLowerCase();

      if (lowQuery.includes('quishing') || lowQuery.includes('qr')) {
        reply = 'Quishing involves hacking QR code links. Attackers overlay fake QR stickers on payment terminals. Scan them in the Scanner tab before loading.';
      } else if (lowQuery.includes('phishing') || lowQuery.includes('link')) {
        reply = 'Phishing links redirect to credentials spoof clones. Always check for HTTPS status, registrar creation dates, and domain name character typos.';
      } else if (lowQuery.includes('deepfake')) {
        reply = 'Deepfakes use synthetic networks. CypherEye audits facial mesh pixel blending vectors and spectral voice clones.';
      }

      const assistantMsg: ChatMsg = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, assistantMsg]);
      setAiTyping(false);
    }, 1500);
  };

  // Settings update
  const handleUpdateIp = async () => {
    if (!serverUrl) return;
    setUpdatingIp(true);
    try {
      const newUrl = await onUpdateServerIp(serverUrl);
      setServerUrl(newUrl);
      Alert.alert('Success', 'Backend API configurations saved.');
    } catch (err) {
      Alert.alert('Error', 'Failed to update server.');
    } finally {
      setUpdatingIp(false);
    }
  };

  const renderFormattedMarkdown = (rawText: string, textStyle: any, isUser: boolean) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');

    return (
      <View style={{ gap: 4 }}>
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <View key={lineIdx} style={{ height: 4 }} />;
          }

          const headerMatch = trimmed.match(/^(#{1,3})\s+(.*)/);
          if (headerMatch) {
            const headerText = headerMatch[2];
            return (
              <Text
                key={lineIdx}
                style={[
                  textStyle,
                  {
                    fontSize: (textStyle?.fontSize || 13) + 2,
                    fontWeight: '800',
                    color: isUser ? '#FFFFFF' : '#0F172A',
                    marginTop: 4,
                    marginBottom: 2
                  }
                ]}
              >
                {headerText}
              </Text>
            );
          }

          const bulletMatch = trimmed.match(/^([•\-\*])\s+(.*)/);
          const numberMatch = trimmed.match(/^(\d+\.)\s+(.*)/);

          const isList = !!(bulletMatch || numberMatch);
          const prefix = bulletMatch ? '•' : numberMatch ? numberMatch[1] : '';
          const content = bulletMatch ? bulletMatch[2] : numberMatch ? numberMatch[2] : trimmed;

          const parts: { text: string; bold: boolean }[] = [];
          const regex = /\*\*(.*?)\*\*/g;
          let lastIndex = 0;
          let match;

          while ((match = regex.exec(content)) !== null) {
            if (match.index > lastIndex) {
              parts.push({ text: content.substring(lastIndex, match.index), bold: false });
            }
            parts.push({ text: match[1], bold: true });
            lastIndex = regex.lastIndex;
          }
          if (lastIndex < content.length) {
            parts.push({ text: content.substring(lastIndex), bold: false });
          }

          return (
            <View key={lineIdx} style={isList ? { flexDirection: 'row', alignItems: 'flex-start' } : undefined}>
              {isList && (
                <Text
                  style={[
                    textStyle,
                    {
                      marginRight: 6,
                      fontWeight: '800',
                      color: isUser ? '#FFFFFF' : '#0F172A'
                    }
                  ]}
                >
                  {prefix}
                </Text>
              )}
              <Text style={[textStyle, isList ? { flex: 1 } : undefined]}>
                {parts.map((part, pIdx) => (
                  <Text
                    key={pIdx}
                    style={part.bold ? { fontWeight: '800', color: isUser ? '#FFFFFF' : '#0F172A' } : undefined}
                  >
                    {part.text}
                  </Text>
                ))}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      
      {/* ---------------- A. CORE APP PAGE RENDERER ---------------- */}
      <ScrollView contentContainerStyle={styles.mainScroll} keyboardShouldPersistTaps="handled">
        
        {/* TAB 1: HOME WORKSPACE */}
        {activeTab === 'home' && (
          <View style={styles.tabContent}>
            
            {/* Header user details */}
            <View style={styles.homeHeader}>
              <View>
                <Text style={styles.greetingText}>Good Morning,</Text>
                <Text style={styles.usernameText}>{user.username} Analyst</Text>
              </View>
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 18, color: Colors.accentPrimary, fontWeight: '700' }}>AS</Text>
              </View>
            </View>

            {/* Device secure banner card */}
            <View style={styles.shieldBannerCard}>
              <View style={styles.shieldBannerRow}>
                <Text style={{ fontSize: 34, marginRight: 12 }}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shieldBannerTitle}>Your Device is Protected</Text>
                  <Text style={styles.shieldBannerSubtitle}>Real-time fraud interceptors active</Text>
                </View>
              </View>
              
              {/* Scan Trigger */}
              <TouchableOpacity 
                style={styles.homeScanBtn} 
                onPress={() => {
                  Alert.alert('Radar Diagnostic', 'Scanning active connections, files, and links...', [
                    { text: 'Cancel' },
                    { text: 'Diagnostics finished', onPress: () => Alert.alert('Secure Verdict', '0 malicious assets quarantined. Security level remains Master.') }
                  ]);
                }}
              >
                <Text style={styles.homeScanBtnText}>Audit Local Connections</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Actions Grid */}
            <Text style={styles.sectionTitle}>Security Modules Launcher</Text>
            <View style={styles.actionsGrid}>
              {[
                { tab: 'website', name: 'Website Scanner', icon: '🌐' },
                { tab: 'link', name: 'Link Chain Trace', icon: '🔗' },
                { tab: 'qr', name: 'QR Code Decoder', icon: '📷' },
                { tab: 'sms', name: 'SMS scam classifier', icon: '💬' },
                { tab: 'email', name: 'EML Email Auditor', icon: '✉️' }
              ].map(action => (
                <TouchableOpacity 
                  key={action.tab} 
                  style={styles.gridActionItem}
                  onPress={() => {
                    setActiveScanner(action.tab as any);
                    setActiveTab('scanner');
                    setCurrentResult(null);
                  }}
                >
                  <Text style={{ fontSize: 26, marginBottom: 8 }}>{action.icon}</Text>
                  <Text style={styles.gridActionText}>{action.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={styles.gridActionItem}
                onPress={() => setActiveTab('ai-chat')}
              >
                <Text style={{ fontSize: 26, marginBottom: 8 }}>🤖</Text>
                <Text style={styles.gridActionText}>AI Cyber Advisor</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.gridActionItem}
                onPress={() => {
                  setNotifSubView('history');
                  setActiveTab('notif-protection');
                }}
              >
                <Text style={{ fontSize: 26, marginBottom: 8 }}>🔔</Text>
                <Text style={styles.gridActionText}>Notification Protection</Text>
              </TouchableOpacity>
            </View>

            {/* Metric charts bar graph */}
            <Text style={styles.sectionTitle}>Weekly Intercepts Statistics</Text>
            <View style={styles.chartPanel}>
              <View style={styles.chartBarsRow}>
                {[
                  { day: 'M', val: 12 },
                  { day: 'T', val: 18 },
                  { day: 'W', val: 8 },
                  { day: 'T', val: 24 },
                  { day: 'F', val: 15 },
                  { day: 'S', val: 6 },
                  { day: 'S', val: 14 }
                ].map((item, idx) => (
                  <View key={idx} style={styles.chartBarCol}>
                    <View style={[styles.chartBarValue, { height: item.val * 3, backgroundColor: idx === 3 ? Colors.accentRose : Colors.accentPrimary }]} />
                    <Text style={styles.chartBarLabel}>{item.day}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.chartPanelDesc}>Average intercept rate: 14 scam vectors/day</Text>
            </View>

            {/* Scan History list */}
            <Text style={styles.sectionTitle}>Recent Security logs</Text>
            <View style={{ gap: 12, marginBottom: 24 }}>
              {scanHistory.map((report, idx) => (
                <View key={idx} style={styles.historyListItem}>
                  <View style={styles.historyIconBox}>
                    <Text style={{ fontSize: 18 }}>
                      {report.type === 'Website' ? '🌐' : (report.type === 'SMS' ? '💬' : '🔗')}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.historyListTitle} numberOfLines={1}>{report.inputData}</Text>
                    <Text style={styles.historyListMeta}>Module: {report.type} • {report.createdAt}</Text>
                  </View>
                  <View style={[
                    styles.historyListBadge, 
                    { backgroundColor: report.riskLevel === 'High' ? Colors.bgRoseLight : Colors.bgEmeraldLight }
                  ]}>
                    <Text style={[
                      styles.historyListBadgeText,
                      { color: report.riskLevel === 'High' ? Colors.accentRose : Colors.accentEmerald }
                    ]}>
                      {report.riskLevel}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

          </View>
        )}

        {/* TAB 2: SCANNER WORKSPACE */}
        {activeTab === 'scanner' && (
          <View style={styles.tabContent}>
            
            {/* Top segment tabs selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scannerSelectorScroll}>
              {[
                { key: 'website', name: 'Website', icon: '🌐' },
                { key: 'link', name: 'Link Redir', icon: '🔗' },
                { key: 'qr', name: 'QR code', icon: '📷' },
                { key: 'sms', name: 'SMS Classifier', icon: '💬' },
                { key: 'email', name: 'EML Email', icon: '✉️' }
              ].map(item => (
                <TouchableOpacity 
                  key={item.key}
                  style={[styles.scannerSelectorBtn, activeScanner === item.key && styles.scannerSelectorBtnActive]}
                  onPress={() => {
                    setActiveScanner(item.key as any);
                    setCurrentResult(null);
                  }}
                >
                  <Text style={{ marginRight: 6 }}>{item.icon}</Text>
                  <Text style={[styles.scannerSelectorText, activeScanner === item.key && styles.scannerSelectorTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* SCANNER VIEW 1: WEBSITE SCANNER */}
            {activeScanner === 'website' && (
              <View style={styles.scannerModuleCard}>
                <Text style={styles.moduleTitle}>Domain Reputation audit</Text>
                <Text style={styles.moduleDesc}>Inspects SSL registration, blacklists, and layout phishing indicators.</Text>
                
                <CyberInput
                  placeholder="https://paypal-update-logins.xyz"
                  value={websiteInput}
                  onChangeText={setWebsiteInput}
                  keyboardType="url"
                />
                
                <CyberButton
                  title={scanLoading ? 'Auditing domain...' : 'Inspect Domain'}
                  onPress={() => handleLaunchScan('Website', websiteInput)}
                  loading={scanLoading}
                />
              </View>
            )}

            {/* SCANNER VIEW 2: LINK REDIR */}
            {activeScanner === 'link' && (
              <View style={styles.scannerModuleCard}>
                <Text style={styles.moduleTitle}>Heuristic redirect chain trace</Text>
                <Text style={styles.moduleDesc}>Decrypts short links, auditing redirection chains and blacklist verification logs.</Text>
                
                <CyberInput
                  placeholder="http://shorturl.at/redir-ref-signin"
                  value={linkInput}
                  onChangeText={setLinkInput}
                  keyboardType="url"
                />
                
                <CyberButton
                  title={scanLoading ? 'Tracing URL hops...' : 'Trace URL Redirect'}
                  onPress={() => handleLaunchScan('Link', linkInput)}
                  loading={scanLoading}
                />
              </View>
            )}

            {/* SCANNER VIEW 3: QR DECODER */}
            {activeScanner === 'qr' && (
              <View style={styles.scannerModuleCard}>
                <Text style={styles.moduleTitle}>QR Code Obfuscation Decryption</Text>
                <Text style={styles.moduleDesc}>Audit decoded QR text redirects, bypassing physical terminal spoof sticker vectors.</Text>
                
                {/* Camera Scanner View Overlay simulation */}
                <View style={styles.cameraSimulator}>
                  <View style={styles.cameraScanningBar} />
                  <View style={styles.cameraFrame}>
                    <Text style={{ fontSize: 40, color: 'rgba(255,255,255,0.3)' }}>📷</Text>
                  </View>
                  <Text style={styles.cameraMetaText}>Camera Stream Emulator Active</Text>
                </View>

                <CyberInput
                  placeholder="Or paste decoded URL: http://signin-bank.xyz"
                  value={qrInputText}
                  onChangeText={setQrInputText}
                />
                
                <CyberButton
                  title={scanLoading ? 'Decoding QR...' : 'Audit QR Redirect Link'}
                  onPress={() => handleLaunchScan('QR', qrInputText || 'http://verify-ref-account.signin.info/code')}
                  loading={scanLoading}
                />
              </View>
            )}

            {/* SCANNER VIEW 4: SMS CLASSIFIER */}
            {activeScanner === 'sms' && (
              <View style={styles.scannerModuleCard}>
                <Text style={styles.moduleTitle}>SMS NLP text analysis</Text>
                <Text style={styles.moduleDesc}>NLP transformers audit message semantics, syntax, and urgency triggers to check scams.</Text>
                
                <TextInput
                  style={styles.textareaControl}
                  multiline
                  numberOfLines={4}
                  placeholder="Paste SMS content: URGENT Capital One alert. Your secure login is disabled. Verify immediately at http://fake-capitalone.xyz"
                  value={smsInputText}
                  onChangeText={setSmsInputText}
                  placeholderTextColor={Colors.textMuted}
                />
                
                <CyberButton
                  title={scanLoading ? 'Analyzing text...' : 'Analyze Message Content'}
                  onPress={() => handleLaunchScan('SMS', smsInputText)}
                  loading={scanLoading}
                  style={{ marginTop: 14 }}
                />
              </View>
            )}

            {/* SCANNER VIEW 5: EMAIL AUDITOR */}
            {activeScanner === 'email' && (
              <View style={styles.scannerModuleCard}>
                <Text style={styles.moduleTitle}>EML Email header auditor</Text>
                <Text style={styles.moduleDesc}>Inspects SPF/DKIM validation tags, headers, and attachment risk parameters.</Text>
                
                <TextInput
                  style={styles.textareaControl}
                  multiline
                  numberOfLines={4}
                  placeholder="Paste raw EML content or invoice layout context..."
                  value={emailInputText}
                  onChangeText={setEmailInputText}
                  placeholderTextColor={Colors.textMuted}
                />
                
                <CyberButton
                  title={scanLoading ? 'Auditing headers...' : 'Audit Email Context'}
                  onPress={() => handleLaunchScan('Email', emailInputText)}
                  loading={scanLoading}
                  style={{ marginTop: 14 }}
                />
              </View>
            )}

            {/* Result Report displays */}
            {currentResult && (
              <ThreatCard
                type={currentResult.type}
                inputData={currentResult.inputData}
                threatScore={currentResult.threatScore}
                riskLevel={currentResult.riskLevel}
                confidence={currentResult.confidence}
                explanation={currentResult.explanation}
                style={{ marginTop: 24, marginBottom: 24 }}
              />
            )}

          </View>
        )}

        {/* TAB 3: AI ADVISOR CHAT */}
        {activeTab === 'ai-chat' && (
          <View style={styles.tabContent}>
            
            {/* Chat header */}
            <View style={styles.chatHeader}>
              <View style={styles.botAvatar}>
                <Text style={{ fontSize: 18 }}>🤖</Text>
              </View>
              <View>
                <Text style={styles.botTitle}>Cypher AI</Text>
                <Text style={styles.botStatus}>Online • Cyber Security Advisor</Text>
              </View>
            </View>

            {/* Message logs view */}
            <View style={styles.chatMessageLog}>
              {chatMessages.map(msg => (
                <View 
                  key={msg.id} 
                  style={[
                    styles.messageBubbleContainer,
                    msg.sender === 'user' ? styles.bubbleUserContainer : styles.bubbleBotContainer
                  ]}
                >
                  <View style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.bubbleUser : styles.bubbleBot
                  ]}>
                    {renderFormattedMarkdown(
                      msg.text,
                      [
                        styles.messageText,
                        msg.sender === 'user' ? { color: '#FFFFFF' } : { color: Colors.textPrimary }
                      ],
                      msg.sender === 'user'
                    )}
                  </View>
                  <Text style={styles.messageTime}>{msg.time}</Text>
                </View>
              ))}

              {aiTyping && (
                <View style={[styles.messageBubbleContainer, styles.bubbleBotContainer]}>
                  <View style={[styles.messageBubble, styles.bubbleBot, { width: 60, alignItems: 'center' }]}>
                    <ActivityIndicator size="small" color={Colors.accentPrimary} />
                  </View>
                </View>
              )}
            </View>

            {/* Suggestions Prompts Row */}
            <View style={styles.chatSuggestionsRow}>
              {[
                'What is Quishing?',
                'Explain Phishing links',
                'Deepfake anomalies'
              ].map(prompt => (
                <TouchableOpacity 
                  key={prompt} 
                  style={styles.chatSuggestionPill}
                  onPress={() => setChatInput(prompt)}
                >
                  <Text style={styles.chatSuggestionText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Chat Input row */}
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInputControl}
                placeholder="Ask Cypher AI advisor..."
                placeholderTextColor={Colors.textMuted}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={sendChatMessage}
              />
              <TouchableOpacity style={styles.chatSendBtn} onPress={sendChatMessage}>
                <Text style={styles.chatSendBtnText}>Send</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}

        {/* TAB 4: LIVE THREATS CENTER */}
        {activeTab === 'threats' && (
          <View style={styles.tabContent}>
            <View style={styles.threatCenterHeader}>
              <Text style={styles.threatCenterTitle}>Global Security Incident feed</Text>
              <Text style={styles.threatCenterDesc}>Ongoing autonomous intercepts tracked by corporate machine learning gates.</Text>
            </View>

            {/* incidents items logs */}
            <View style={{ gap: 14, marginBottom: 30 }}>
              {liveIncidents.map(inc => {
                const isHigh = inc.risk === 'High';
                const isMed = inc.risk === 'Medium';
                const badgeBg = isHigh ? 'rgba(239, 68, 68, 0.1)' : (isMed ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)');
                const badgeBorder = isHigh ? 'rgba(239, 68, 68, 0.25)' : (isMed ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)');
                const badgeColor = isHigh ? '#EF4444' : (isMed ? '#F59E0B' : '#10B981');
                const icon = isHigh ? '🛑' : (isMed ? '⚠️' : '🛡️');

                return (
                  <View key={inc.id} style={styles.incidentListItem}>
                    <View style={styles.incidentHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                        <Text style={{ fontSize: 16, marginRight: 8 }}>{icon}</Text>
                        <Text style={styles.incidentTitleText} numberOfLines={2}>{inc.type}</Text>
                      </View>
                      <View style={[styles.incidentBadge, { backgroundColor: badgeBg, borderColor: badgeBorder, borderWidth: 1 }]}>
                        <Text style={[styles.incidentBadgeText, { color: badgeColor }]}>
                          {inc.risk} SEVERITY
                        </Text>
                      </View>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B' }}>🕒 Time: </Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B' }}>{inc.time}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B' }}>🌐 IP: </Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B' }}>{inc.origin}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                      <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500' }}>Status: Intercepted successfully</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#2563EB' }}>✓ Intercepted</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 5: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <View style={styles.tabContent}>
            
            {/* profile stats */}
            <View style={styles.profileHeaderCard}>
              <View style={styles.profileHeaderRow}>
                <View style={styles.avatarLarge}>
                  <Text style={{ fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' }}>ES</Text>
                </View>
                <View>
                  <Text style={styles.profileName}>{user.fullName || user.username}</Text>
                  <Text style={styles.profileRole}>Clearance Tier: {user.role}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.profileStatsRow}>
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatVal}>94</Text>
                  <Text style={styles.profileStatLabel}>Security Score</Text>
                </View>
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatVal}>{scanHistory.length}</Text>
                  <Text style={styles.profileStatLabel}>Logs Run</Text>
                </View>
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatVal}>{highRiskCount}</Text>
                  <Text style={styles.profileStatLabel}>Quarantined</Text>
                </View>
              </View>
            </View>

            {/* settings card panel */}
            <Text style={styles.sectionTitle}>System Settings</Text>
            <View style={styles.settingsCard}>
              
              <View style={styles.settingsRow}>
                <View>
                  <Text style={styles.settingsRowTitle}>Console Dark Mode</Text>
                  <Text style={styles.settingsRowDesc}>Swap visual theme configurations</Text>
                </View>
                <Switch
                  value={settingsDarkMode}
                  onValueChange={setSettingsDarkMode}
                  trackColor={{ false: '#E2E8F0', true: Colors.accentPrimary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingsRow}>
                <View>
                  <Text style={styles.settingsRowTitle}>Real-time email Alerts</Text>
                  <Text style={styles.settingsRowDesc}>Dispatch alerts logs to inbox</Text>
                </View>
                <Switch
                  value={settingsAlerts}
                  onValueChange={setSettingsAlerts}
                  trackColor={{ false: '#E2E8F0', true: Colors.accentPrimary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingsRow}>
                <View>
                  <Text style={styles.settingsRowTitle}>Enforce OTP verification (2FA)</Text>
                  <Text style={styles.settingsRowDesc}>Require OTP tokens at console signin</Text>
                </View>
                <Switch
                  value={settingsMFA}
                  onValueChange={setSettingsMFA}
                  trackColor={{ false: '#E2E8F0', true: Colors.accentPrimary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* server IP setup config */}
            <View style={styles.settingsCard}>
              <Text style={styles.cardHeaderTitle}>Console Gateway Config</Text>
              <CyberInput
                label="Backend Console API URL"
                value={serverUrl}
                onChangeText={setServerUrl}
                autoCapitalize="none"
              />
              <CyberButton
                title={updatingIp ? 'Updating server connection...' : 'Update Console IP'}
                onPress={handleUpdateIp}
                loading={updatingIp}
                variant="secondary"
              />
            </View>

            {/* Logout button */}
            <CyberButton
              title="Logout Secure Session"
              onPress={onLogout}
              variant="rose"
              style={{ marginTop: 12, marginBottom: 24 }}
            />

          </View>
        )}

        {/* ---------------- 6. NOTIFICATION PROTECTION MODULE TAB ---------------- */}
        {activeTab === 'notif-protection' && (
          <View style={{ flex: 1, padding: 16 }}>
            {/* Top Sub-Navigation Bar */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: notifSubView === 'history' ? Colors.accentPrimary : Colors.cardBg,
                  borderWidth: 1,
                  borderColor: Colors.cardBorder,
                }}
                onPress={() => setNotifSubView('history')}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: notifSubView === 'history' ? '#FFFFFF' : Colors.textPrimary }}>
                  📜 Scan History ({notifProtection.history.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: notifSubView === 'settings' ? Colors.accentPrimary : Colors.cardBg,
                  borderWidth: 1,
                  borderColor: Colors.cardBorder,
                }}
                onPress={() => setNotifSubView('settings')}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: notifSubView === 'settings' ? '#FFFFFF' : Colors.textPrimary }}>
                  ⚙️ Settings & Access
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: Colors.bgEmeraldLight,
                  borderWidth: 1,
                  borderColor: Colors.accentEmerald,
                }}
                onPress={async () => {
                  const testRes = await notifProtection.simulateNotification(
                    'Google Messages',
                    'com.google.android.apps.messaging',
                    'URGENT: Bank Account Suspended',
                    'Your State Bank account has been locked due to suspicious activity. Verify KYC immediately at http://bit.ly/sbi-verify-kyc or your funds will be lost.'
                  );
                  if (testRes) {
                    setSelectedNotifReport(testRes);
                    setNotifSubView('analysis');
                  }
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.accentEmerald }}>
                  🧪 Test Scam Alert
                </Text>
              </TouchableOpacity>
            </View>

            {/* Live Protection Status Bar */}
            <View style={{
              backgroundColor: notifProtection.permissionGranted ? Colors.bgEmeraldLight : Colors.bgRoseLight,
              padding: 14,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: notifProtection.permissionGranted ? Colors.accentEmerald : Colors.accentRose,
              marginBottom: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textPrimary }}>
                  {notifProtection.permissionGranted ? '🟢 Live Protection Active' : '🔴 Protection Access Required'}
                </Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
                  {notifProtection.permissionGranted
                    ? 'Monitoring incoming SMS, Banking, Telegram, and App notifications in background.'
                    : 'Grant Notification Access permission in Android Settings to activate monitoring.'}
                </Text>
              </View>
              {!notifProtection.permissionGranted && (
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.accentPrimary,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 12
                  }}
                  onPress={notifProtection.requestPermission}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>Grant Access</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Subview Content */}
            {notifSubView === 'history' && (
              <NotificationHistoryScreen
                history={notifProtection.history}
                onSelectResult={(res) => {
                  setSelectedNotifReport(res);
                  setNotifSubView('analysis');
                }}
                onDeleteItem={notifProtection.deleteItem}
                onClearHistory={notifProtection.clearHistory}
              />
            )}

            {notifSubView === 'settings' && (
              <NotificationSettingsScreen
                settings={notifProtection.settings}
                permissionGranted={notifProtection.permissionGranted}
                onUpdateSettings={notifProtection.updateSettings}
                onRequestPermission={notifProtection.requestPermission}
              />
            )}

            {notifSubView === 'analysis' && selectedNotifReport && (
              <NotificationAnalysisScreen
                result={selectedNotifReport}
                onGoBack={() => setNotifSubView('history')}
              />
            )}
          </View>
        )}

      </ScrollView>

      {/* ---------------- B. MATERIAL 3 BOTTOM NAVIGATION BAR ---------------- */}
      <View style={styles.bottomTabBar}>
        {Platform.OS === 'web' && (
          <View style={styles.webLogoContainer}>
            <Text style={styles.webLogoIcon}>👁️‍🗨️</Text>
            <Text style={styles.webLogoText}>CypherEye</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.tabBarItem, activeTab === 'home' && styles.tabBarItemActive]}
          onPress={() => setActiveTab('home')}
        >
          {Platform.OS === 'web' && activeTab === 'home' && (
            <View style={styles.activeTabIndicator} />
          )}
          <Text style={styles.tabBarIcon}>🏠</Text>
          <Text style={[styles.tabBarLabel, activeTab === 'home' && styles.tabBarLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabBarItem, activeTab === 'scanner' && styles.tabBarItemActive]}
          onPress={() => setActiveTab('scanner')}
        >
          {Platform.OS === 'web' && activeTab === 'scanner' && (
            <View style={styles.activeTabIndicator} />
          )}
          <Text style={styles.tabBarIcon}>📷</Text>
          <Text style={[styles.tabBarLabel, activeTab === 'scanner' && styles.tabBarLabelActive]}>Scanner</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabBarItem, activeTab === 'ai-chat' && styles.tabBarItemActive]}
          onPress={() => setActiveTab('ai-chat')}
        >
          {Platform.OS === 'web' && activeTab === 'ai-chat' && (
            <View style={styles.activeTabIndicator} />
          )}
          <Text style={styles.tabBarIcon}>🤖</Text>
          <Text style={[styles.tabBarLabel, activeTab === 'ai-chat' && styles.tabBarLabelActive]}>Cypher AI</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabBarItem, activeTab === 'threats' && styles.tabBarItemActive]}
          onPress={() => setActiveTab('threats')}
        >
          {Platform.OS === 'web' && activeTab === 'threats' && (
            <View style={styles.activeTabIndicator} />
          )}
          <Text style={styles.tabBarIcon}>🚨</Text>
          <Text style={[styles.tabBarLabel, activeTab === 'threats' && styles.tabBarLabelActive]}>Threats</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabBarItem, activeTab === 'notif-protection' && styles.tabBarItemActive]}
          onPress={() => {
            setNotifSubView('history');
            setActiveTab('notif-protection');
          }}
        >
          {Platform.OS === 'web' && activeTab === 'notif-protection' && (
            <View style={styles.activeTabIndicator} />
          )}
          <Text style={styles.tabBarIcon}>🔔</Text>
          <Text style={[styles.tabBarLabel, activeTab === 'notif-protection' && styles.tabBarLabelActive]}>Notif Protection</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabBarItem, activeTab === 'profile' && styles.tabBarItemActive]}
          onPress={() => setActiveTab('profile')}
        >
          {Platform.OS === 'web' && activeTab === 'profile' && (
            <View style={styles.activeTabIndicator} />
          )}
          <Text style={styles.tabBarIcon}>👤</Text>
          <Text style={[styles.tabBarLabel, activeTab === 'profile' && styles.tabBarLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    paddingLeft: Platform.OS === 'web' ? 90 : 0,
  },
  mainScroll: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'web' ? 20 : 90,
  },
  tabContent: {
    padding: 20,
  },

  // Home screen workspace
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  greetingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  usernameText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accentLightBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldBannerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 24,
    padding: 20,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 24,
  },
  shieldBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  shieldBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  shieldBannerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  homeScanBtn: {
    height: 44,
    backgroundColor: Colors.accentPrimary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeScanBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridActionItem: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  gridActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  
  // Graph Weekly stats styles
  chartPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  chartBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  chartBarCol: {
    alignItems: 'center',
  },
  chartBarValue: {
    width: 14,
    borderRadius: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 6,
  },
  chartPanelDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Recent History lists
  historyListItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  historyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyListTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  historyListMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  historyListBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  historyListBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Tab 2: Scanner Styles
  scannerSelectorScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  scannerSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 99,
    marginRight: 10,
  },
  scannerSelectorBtnActive: {
    backgroundColor: Colors.accentPrimary,
    borderColor: Colors.accentPrimary,
  },
  scannerSelectorText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  scannerSelectorTextActive: {
    color: '#FFFFFF',
  },
  scannerModuleCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 24,
    padding: 20,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  moduleDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 16,
  },
  textareaControl: {
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: 'rgba(79, 124, 255, 0.15)',
    borderRadius: 14,
    padding: 14,
    height: 100,
    color: Colors.textPrimary,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  cameraSimulator: {
    height: 160,
    backgroundColor: '#0A0E1A',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  cameraScanningBar: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: 3,
    backgroundColor: Colors.accentPrimary,
    top: '40%',
  },
  cameraFrame: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraMetaText: {
    position: 'absolute',
    bottom: 8,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },

  // Tab 3: Chatbot Styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgTertiary,
    paddingBottom: 12,
    marginBottom: 14,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accentLightBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  botStatus: {
    fontSize: 11,
    color: Colors.accentEmerald,
    fontWeight: '600',
  },
  chatMessageLog: {
    flex: 1,
    minHeight: 280,
    justifyContent: 'flex-end',
    gap: 12,
    paddingRight: 4,
  },
  messageBubbleContainer: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  bubbleUserContainer: {
    alignSelf: 'flex-end',
  },
  bubbleBotContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    fontSize: 14,
  },
  bubbleUser: {
    backgroundColor: Colors.accentPrimary,
    borderBottomRightRadius: 2,
  },
  bubbleBot: {
    backgroundColor: Colors.bgTertiary,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 18,
  },
  messageTime: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatSuggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 14,
  },
  chatSuggestionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.bgTertiary,
    backgroundColor: '#FFFFFF',
  },
  chatSuggestionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  chatInputControl: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 24,
    paddingHorizontal: 16,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  chatSendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatSendBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Tab 4: Threats Incident styles
  threatCenterHeader: {
    marginBottom: 20,
  },
  threatCenterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  threatCenterDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
  incidentListItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 20,
    padding: 16,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  incidentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  incidentTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  incidentTimeText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  incidentMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  incidentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  incidentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // Tab 5: Profile Styles
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 24,
    padding: 20,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.bgTertiary,
    marginVertical: 12,
    opacity: 0.5,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  profileStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  profileStatLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgTertiary,
    paddingBottom: 14,
    marginBottom: 14,
  },
  settingsRowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  settingsRowDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  // bottom tabs bar items navigation
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: Platform.OS === 'web' ? undefined : 0,
    top: Platform.OS === 'web' ? 0 : undefined,
    width: Platform.OS === 'web' ? 90 : '100%',
    height: Platform.OS === 'web' ? '100%' : 72,
    backgroundColor: Platform.OS === 'web' ? '#0F172A' : '#FFFFFF',
    borderTopWidth: Platform.OS === 'web' ? 0 : 1,
    borderTopColor: Colors.cardBorder,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: Platform.OS === 'web' ? 'column' : 'row',
    justifyContent: Platform.OS === 'web' ? 'flex-start' : 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 0 : 12,
    paddingTop: Platform.OS === 'web' ? 30 : 0,
    zIndex: 999,
  },
  tabBarItem: {
    flex: Platform.OS === 'web' ? 0 : 1,
    height: Platform.OS === 'web' ? 70 : '100%',
    width: Platform.OS === 'web' ? '84%' : '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
    flexDirection: 'column',
    marginVertical: Platform.OS === 'web' ? 6 : 0,
    borderRadius: Platform.OS === 'web' ? 12 : 0,
    paddingVertical: Platform.OS === 'web' ? 8 : 0,
  },
  tabBarItemActive: {
    opacity: 1,
    backgroundColor: Platform.OS === 'web' ? 'rgba(79, 124, 255, 0.08)' : undefined,
  },
  tabBarIcon: {
    fontSize: 20,
    marginBottom: Platform.OS === 'web' ? 2 : 4,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Platform.OS === 'web' ? '#94A3B8' : Colors.textSecondary,
  },
  tabBarLabelActive: {
    color: Colors.accentPrimary,
    fontWeight: '700',
  },
  webLogoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 6,
  },
  webLogoIcon: {
    fontSize: 24,
  },
  webLogoText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  activeTabIndicator: {
    position: 'absolute',
    left: 0,
    top: 15,
    bottom: 15,
    width: 3,
    backgroundColor: Colors.accentPrimary,
    borderRadius: 2,
  }
});
