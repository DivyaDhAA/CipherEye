import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface CyberButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'cyan' | 'violet' | 'rose' | 'primary' | 'secondary';
  testID?: string;
}

export const CyberButton: React.FC<CyberButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  testID
}) => {
  const getBgColor = () => {
    if (disabled) return '#CBD5E1';
    if (variant === 'violet') return Colors.accentViolet;
    if (variant === 'rose') return Colors.accentRose;
    if (variant === 'cyan') return Colors.accentCyan;
    if (variant === 'secondary') return Colors.accentLight;
    return Colors.accentPrimary;
  };

  const getTextColor = () => {
    if (disabled) return '#94A3B8';
    if (variant === 'secondary') return Colors.accentPrimary;
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button, 
        { backgroundColor: getBgColor() }, 
        variant === 'secondary' && { borderWidth: 1, borderColor: Colors.accentLightBorder },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  }
});
