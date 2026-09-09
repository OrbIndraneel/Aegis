import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { AlertCard } from '../../src/components/civilian/AlertCard';
import { useDisasterStore } from '../../src/store/useDisasterStore';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { Bell, ShieldAlert, AlertTriangle, Info } from 'lucide-react-native';

import { useTranslation } from '../../src/i18n';

export default function CivilianAlertsScreen() {
  const { alerts } = useDisasterStore();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'CRITICAL' | 'WARNINGS' | 'UPDATES'>('ALL');

  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH');
  const warningAlerts = alerts.filter((a) => a.severity === 'MODERATE');
  const updateAlerts = alerts.filter((a) => a.severity === 'LOW');

  const getFilteredAlerts = () => {
    switch (selectedTab) {
      case 'CRITICAL': return criticalAlerts;
      case 'WARNINGS': return warningAlerts;
      case 'UPDATES': return updateAlerts;
      default: return alerts;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('alertsTitle')} />
      <ConnectionStatus />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section Tabs Pill Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
          style={styles.tabsScrollView}
        >
          {[
            { id: 'ALL', label: t('filterAll'), count: alerts.length },
            { id: 'CRITICAL', label: t('filterCritical'), count: criticalAlerts.length },
            { id: 'WARNINGS', label: t('filterHigh'), count: warningAlerts.length },
            { id: 'UPDATES', label: t('filterModerate'), count: updateAlerts.length },
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
    backgroundColor: '#F4F4F7',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 110,
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
    borderColor: 'rgba(0,0,0,0.06)',
    ...shadows.sm,
  },
  tabChipActive: {
    backgroundColor: '#18181B',
    borderColor: '#18181B',
  },
  tabText: {
    color: '#71717A',
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
