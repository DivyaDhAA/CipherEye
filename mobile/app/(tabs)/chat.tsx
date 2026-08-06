import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/Colors';

interface ChatMsg {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export default function Chat() {
  const insets = useSafeAreaInsets();
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { id: '1', sender: 'assistant', text: 'Hello! I am Cypher AI, your mobile threat advisor. Audit links, SMS text logs, EML files, or QR redirects here.', time: '2:15 PM' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  const generateAiResponse = (query: string): string => {
    const low = query.toLowerCase();

    if (low.includes('quishing') || low.includes('qr')) {
      return '📷 **Quishing (QR Phishing) Audit Guide**\n\n• **Threat Vector**: Attackers overlay physical QR stickers on payment terminals or send email QR codes to bypass secure email gateways.\n• **Detection**: Check if the decoded URL matches brand domains. Beware of `.xyz` top-level domains.\n• **Mitigation**: Always scan QR codes with the CypherEye QR Scanner before loading URLs.';
    }
    if (low.includes('phishing') || low.includes('url') || low.includes('link') || low.includes('website')) {
      return '🌐 **URL & Phishing Threat Diagnostic**\n\n• **Homograph Spoofing**: Cyrillic or numeric character substitutions (e.g. `pаypal.com`).\n• **Credential Harvesters**: Fake login portals hosted on IP hosts or free web hosts.\n• **MITRE ATT&CK**: T1566.002 (Spearphishing Link).\n• **Action**: Submit suspicious URLs to the Website Scanner for real-time reputation analysis.';
    }
    if (low.includes('sms') || low.includes('smishing') || low.includes('text')) {
      return '💬 **SMS Scam (Smishing) Diagnostic**\n\n• **Urgency Signals**: Messages claiming "ACCOUNT SUSPENDED", "URGENT TAX ALERT", or "PACKAGE UNDELIVERABLE".\n• **Scam Links**: Shortened or obfuscated links directing to OTP harvesting forms.\n• **Action**: Do not tap links inside unexpected SMS messages. Forward suspicious numbers to carrier 7726.';
    }
    if (low.includes('email') || low.includes('eml') || low.includes('header')) {
      return '✉️ **Email Header & BEC Audit**\n\n• **Authentication Tags**: Verify `SPF=PASS`, `DKIM=PASS`, and `DMARC=PASS` headers.\n• **Spoofed Envelope**: Check if `From:` header matches `Return-Path:` envelope sender.\n• **Dangerous Attachments**: Block `.exe`, `.scr`, `.iso`, `.zip`, `.vbs` files.\n• **Action**: Paste raw EML content in the EML Scanner to analyze header spoofing.';
    }
    if (low.includes('deepfake') || low.includes('voice') || low.includes('video')) {
      return '🎭 **Deepfake & Synthetic Media Diagnostic**\n\n• **Facial Mesh Artifacts**: Irregular blinking, edge blur around jawlines, and lighting mismatches.\n• **Spectral Voice Cloning**: Monotone pitch cadence and synthetic audio compression artifacts.\n• **Action**: Enforce multi-channel out-of-band verification for wire transfers or sensitive executive orders.';
    }
    if (low.includes('mitre') || low.includes('attack') || low.includes('ciso') || low.includes('framework')) {
      return '🛡️ **Enterprise CISO Defense Framework**\n\n• **T1566**: Initial Access via Phishing (Email, Link, Attachment).\n• **T1027**: Obfuscation of payload URLs and redirect chains.\n• **T1056**: Input Capture (Credential Harvesting).\n• **Playbook**: Enforce FIDO2 hardware MFA, DNS Sinkholing, and automated endpoint isolation.';
    }

    return `🛡️ **Cypher AI Diagnostic Response**\n\nI analyzed your query: "${query}".\n\n• **Status**: Active threat monitoring enabled.\n• **Recommended Step**: Use the **Scanners** tab to audit any specific URL, SMS message, Email header, or QR code link.\n• **Security Tip**: Always verify SSL certificates and domain creation dates before entering credentials.`;
  };

  const handleSend = () => {
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
      const reply = generateAiResponse(query);

      const assistantMsg: ChatMsg = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, assistantMsg]);
      setAiTyping(false);
    }, 800);
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
    <View style={[
      styles.container,
      { paddingTop: Math.max(insets.top + 8, 16), paddingBottom: Math.max(insets.bottom + 80, 90) },
      Platform.OS === 'web' && { paddingLeft: 260 }
    ]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Chat Header */}
          <View style={styles.headerRow}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarIcon}>🤖</Text>
            </View>
            <View>
              <Text style={styles.headerName}>Cypher AI</Text>
              <Text style={styles.headerStatus}>Online • Cyber Security Advisor</Text>
            </View>
          </View>

          {/* Conversation history logs */}
          <View style={styles.chatHistory}>
            {chatMessages.map(msg => (
              <View 
                key={msg.id} 
                style={[
                  styles.msgContainer,
                  msg.sender === 'user' ? styles.msgUser : styles.msgAssistant
                ]}
              >
                <View 
                  style={[
                    styles.msgBubble,
                    msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAssistant
                  ]}
                >
                  {renderFormattedMarkdown(
                    msg.text,
                    [
                      styles.msgText,
                      msg.sender === 'user' ? styles.msgTextUser : styles.msgTextAssistant
                    ],
                    msg.sender === 'user'
                  )}
                </View>
                <Text style={styles.msgTime}>{msg.time}</Text>
              </View>
            ))}

            {aiTyping && (
              <View style={[styles.msgContainer, styles.msgAssistant]}>
                <View style={[styles.msgBubble, styles.bubbleAssistant, styles.typingBox]}>
                  <ActivityIndicator size="small" color="#2563EB" />
                </View>
              </View>
            )}
          </View>

          {/* Prompt suggestions pills */}
          <View style={styles.pillsRow}>
            {[
              'What is Quishing?',
              'Explain Phishing links',
              'Deepfake anomalies'
            ].map(prompt => (
              <TouchableOpacity 
                key={prompt} 
                style={styles.pillItem}
                onPress={() => setChatInput(prompt)}
              >
                <Text style={styles.pillText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Message inputs bar */}
          <View style={styles.inputBarRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask Cypher AI advisor..."
              placeholderTextColor={Colors.textMuted}
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity 
              style={styles.sendBtn}
              onPress={handleSend}
            >
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
    marginBottom: 16,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarIcon: {
    fontSize: 22,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
  },
  chatHistory: {
    minHeight: 280,
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 16,
  },
  msgContainer: {
    maxWidth: '85%',
  },
  msgUser: {
    alignSelf: 'flex-end',
  },
  msgAssistant: {
    alignSelf: 'flex-start',
  },
  msgBubble: {
    padding: 14,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  typingBox: {
    width: 60,
    alignItems: 'center',
  },
  msgText: {
    fontSize: 13,
    lineHeight: 19,
  },
  msgTextUser: {
    color: '#FFFFFF',
  },
  msgTextAssistant: {
    color: '#0F172A',
  },
  msgTime: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  pillItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  inputBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 18,
    color: '#0F172A',
    fontSize: 13,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
