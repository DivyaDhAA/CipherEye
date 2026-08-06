import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ScamRiskLevel } from '../types';

interface RiskBadgeProps {
  level: ScamRiskLevel;
  size?: 'small' | 'medium' | 'large';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'medium' }) => {
  const getBadgeStyle = () => {
    switch (level) {
      case 'Critical Scam':
      case 'High Risk':
        return { bg: '#FEE2E2', border: '#FCA5A5', text: '#EF4444', icon: '🔴' };
      case 'Medium Risk':
        return { bg: '#FEF3C7', border: '#FDE68A', text: '#D97706', icon: '🟡' };
      case 'Low Risk':
        return { bg: '#E0F2FE', border: '#BAE6FD', text: '#0284C7', icon: '🔵' };
      case 'Safe':
      default:
        return { bg: '#DCFCE7', border: '#86EFAC', text: '#16A34A', icon: '🟢' };
    }
  };

  const styleConfig = getBadgeStyle();
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
          paddingHorizontal: isSmall ? 8 : isLarge ? 14 : 10,
          paddingVertical: isSmall ? 3 : isLarge ? 6 : 4,
        },
      ]}
    >
      <Text style={[styles.iconText, isSmall && { fontSize: 10 }, isLarge && { fontSize: 14 }]}>
        {styleConfig.icon}
      </Text>
      <Text
        style={[
          styles.text,
          { color: styleConfig.text },
          isSmall && { fontSize: 10 },
          isLarge && { fontSize: 13 },
        ]}
      >
        {level}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  iconText: {
    fontSize: 12,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
