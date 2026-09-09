import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { ShelterCard } from '../../src/components/civilian/ShelterCard';
import { AlertCard } from '../../src/components/civilian/AlertCard';
import { useOfflineStore } from '../../src/store/useOfflineStore';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { WifiOff, Clock, HardDrive, RefreshCw, ShieldAlert, PhoneCall } from 'lucide-react-native';

export default function CivilianOfflineScreen() {
  const {
    cachedHazards,
    cachedShelters,
    cachedAlerts,
    lastSyncTimestamp,
    loadCachedData,
  } = useOfflineStore();

  useEffect(() => {
    loadCachedData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="OFFLINE EMERGENCY DISASTER DATA" />
      <ConnectionStatus />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Offline Banner Callout */}
        <View style={styles.offlineBanner}>
          <WifiOff size={28} color={colors.severity.MODERATE.main} />
          <View style={styles.flex1}>
            <Text style={styles.offlineTitle}>OFFLINE MODE ACTIVE</Text>
            <Text style={styles.offlineDesc}>
              Using last synchronized emergency data stored locally on your device storage.
            </Text>
            <View style={styles.timeRow}>
              <Clock size={11} color={colors.text.muted} />
              <Text style={styles.timeText}>
                Last Synchronized: {lastSyncTimestamp ? new Date(lastSyncTimestamp).toLocaleTimeString() : 'Recent Session'}
              </Text>
            </View>
          </View>
        </View>

        {/* Offline Contacts Quick Panel */}
        <Text style={styles.sectionTitle}>OFFLINE EMERGENCY HOTLINES</Text>
        <View style={styles.contactCard}>
          <View style={styles.contactRow}>
            <PhoneCall size={14} color={colors.severity.CRITICAL.main} />
            <Text style={styles.contactName}>NDRF Helpline (Works Direct SMS/Call)</Text>
            <Text style={styles.contactNum}>1078</Text>
          </View>
          <View style={styles.contactRow}>
            <PhoneCall size={14} color={colors.severity.CRITICAL.main} />
            <Text style={styles.contactName}>State Control Center</Text>
            <Text style={styles.contactNum}>1070</Text>
          </View>
        </View>

        {/* Cached Shelters Directory */}
        <Text style={styles.sectionTitle}>CACHED RELIEF CAMPS ({cachedShelters.length})</Text>
        {cachedShelters.map((shelter) => (
          <ShelterCard key={shelter.id} shelter={shelter} />
        ))}

        {/* Cached Alerts Stream */}
        <Text style={styles.sectionTitle}>CACHED EMERGENCY ALERTS ({cachedAlerts.length})</Text>
        {cachedAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.severity.MODERATE.border,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  offlineTitle: {
    color: colors.severity.MODERATE.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  offlineDesc: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    marginVertical: 2,
    lineHeight: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    color: colors.text.muted,
    fontSize: 10,
  },
  sectionTitle: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  contactCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactName: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    flex: 1,
  },
  contactNum: {
    color: colors.severity.CRITICAL.text,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
