import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { AlertCard } from '../../src/components/civilian/AlertCard';
import { useDisasterStore } from '../../src/store/useDisasterStore';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { ShieldAlert, AlertTriangle, Info, BellRing } from 'lucide-react-native';
import { useTranslation } from '../../src/i18n';

export default function CivilianAlertsScreen() {
  const { alerts } = useDisasterStore();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'WARNING' | 'WATCH' | 'NOTICE'>('ALL');

  const warningAlerts = alerts.filter((a) => a.severity === 'CRITICAL');
  const watchAlerts = alerts.filter((a) => a.severity === 'HIGH');
  const noticeAlerts = alerts.filter((a) => a.severity === 'MODERATE' || a.severity === 'LOW');

  const getFilteredAlerts = () => {
    switch (selectedTab) {
      case 'WARNING': return warningAlerts;
      case 'WATCH': return watchAlerts;
      case 'NOTICE': return noticeAlerts;
      default: return alerts;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="EARLY WARNING BULLETINS" />
      <ConnectionStatus />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Early Warning Protocol Protocol Guide Banner */}
        <View style={styles.warningProtocolBanner}>
          <View style={styles.protocolHeader}>
            <BellRing size={16} color="#0F172A" />
            <Text style={styles.protocolTitle}>AEGIS EARLY WARNING PROTOCOL</Text>
          </View>
          <View style={styles.protocolRow}>
            <View style={[styles.protocolPill, { backgroundColor: '#FEE2E2', borderColor: '#DC2626' }]}>
              <Text style={[styles.protocolPillText, { color: '#DC2626' }]}>WARNING</Text>
            </View>
            <Text style={styles.protocolDesc}>Immediate danger • Imminent slope failure • Evacuate</Text>
          </View>
          <View style={styles.protocolRow}>
            <View style={[styles.protocolPill, { backgroundColor: '#FFEDD5', borderColor: '#EA580C' }]}>
              <Text style={[styles.protocolPillText, { color: '#EA580C' }]}>WATCH</Text>
            </View>
            <Text style={styles.protocolDesc}>Elevated hazard risk • High saturation • Prepare kit</Text>
          </View>
          <View style={styles.protocolRow}>
            <View style={[styles.protocolPill, { backgroundColor: '#FEF3C7', borderColor: '#D97706' }]}>
              <Text style={[styles.protocolPillText, { color: '#D97706' }]}>NOTICE</Text>
            </View>
            <Text style={styles.protocolDesc}>General advisory • Surface creep monitoring • Caution</Text>
          </View>
        </View>

        {/* Section Tabs Pill Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
          style={styles.tabsScrollView}
        >
          {[
            { id: 'ALL', label: 'All Bulletins', count: alerts.length },
            { id: 'WARNING', label: 'Warnings', count: warningAlerts.length, color: '#DC2626' },
            { id: 'WATCH', label: 'Watches', count: watchAlerts.length, color: '#EA580C' },
            { id: 'NOTICE', label: 'Notices', count: noticeAlerts.length, color: '#D97706' },
          ].map((tab) => {
            const active = selectedTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabChip, active && styles.tabChipActive]}
                onPress={() => setSelectedTab(tab.id as any)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Stream */}
        <View style={styles.streamList}>
          {getFilteredAlerts().map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 110,
  },
  warningProtocolBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...shadows.sm,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  protocolTitle: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  protocolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  protocolPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
    borderWidth: 1,
    width: 68,
    alignItems: 'center',
  },
  protocolPillText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  protocolDesc: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  tabsScrollView: {
    marginBottom: spacing.md,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  tabChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...shadows.sm,
  },
  tabChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  tabText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.heavy,
  },
  streamList: {
    gap: spacing.xs,
  },
});
