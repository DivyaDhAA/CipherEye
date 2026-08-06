import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { Text, Platform, View, TouchableOpacity, StyleSheet } from 'react-native';

function WebTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.webTabBarContainer}>
      <View style={styles.webLogoContainer}>
        <Text style={styles.webLogoIcon}>👁️‍🗨️</Text>
        <Text style={styles.webLogoText}>CypherEye</Text>
      </View>

      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        
        const getIcon = (name: string) => {
          switch (name) {
            case 'home': return '🏠';
            case 'scanner': return '📷';
            case 'chat': return '🤖';
            case 'threats': return '🚨';
            case 'profile': return '👤';
            default: return '❓';
          }
        };

        const label =
          options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[
              styles.webTabItem,
              isFocused && styles.webTabItemActive
            ]}
          >
            {isFocused && (
              <View style={styles.webActiveIndicator} />
            )}
            <Text style={styles.webTabIcon}>{getIcon(route.name)}</Text>
            <Text style={[styles.webTabLabel, isFocused && styles.webTabLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Spacer to push tips card to bottom */}
      <View style={{ flex: 1 }} />

      {/* Cyber Safety Tips Card */}
      <View style={styles.webTipCard}>
        <Text style={styles.webTipTitle}>🛡️ Security Tip</Text>
        <Text style={styles.webTipBody}>Always double check domain suffixes (.xyz vs .com) before entering passwords.</Text>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    // @ts-ignore
    <Tabs
      tabBar={Platform.OS === 'web' ? (props) => <WebTabBar {...props} /> : undefined}
      screenOptions={{
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: Colors.accentPrimary,
        tabBarInactiveTintColor: Platform.OS === 'web' ? '#64748B' : Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 8,
        },
        tabBarStyle: {
          height: 72,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: 'rgba(79, 124, 255, 0.12)',
          paddingTop: 8,
        },
      }}
      // @ts-ignore
      sceneContainerStyle={Platform.OS === 'web' ? { backgroundColor: '#F8FAFC' } : undefined}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📷</Text>,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Cypher AI',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🤖</Text>,
        }}
      />
      <Tabs.Screen
        name="threats"
        options={{
          title: 'Threats',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🚨</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  webTabBarContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 260,
    height: '100%',
    backgroundColor: '#0F172A',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 30,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 999,
  },
  webLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
    width: '100%',
  },
  webLogoIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  webLogoText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  webTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    width: '90%',
    opacity: 0.7,
    marginVertical: 4,
    borderRadius: 8,
    paddingHorizontal: 16,
    position: 'relative',
  },
  webTabItemActive: {
    opacity: 1,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  webTabIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  webTabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  webTabLabelActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  webActiveIndicator: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  webTipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  webTipTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  webTipBody: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
  },
});
