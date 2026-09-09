import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { ShelterCard } from '../../src/components/civilian/ShelterCard';
import { useDisasterStore } from '../../src/store/useDisasterStore';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { Home, Radio, AlertTriangle, ShieldCheck, Truck } from 'lucide-react-native';

export default function AuthoritySheltersMgmtScreen() {
  const { shelters, loadDisasterData } = useDisasterStore();

  React.useEffect(() => {
    loadDisasterData();
  }, []);

  const totalShelters = shelters.length;
  const openShelters = shelters.filter((s) => s.status === 'OPEN').length;
  const totalBeds = shelters.reduce((acc, s) => acc + s.totalCapacity, 0);
  const totalOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const occupancyPercent = Math.round((totalOccupancy / totalBeds) * 100);

  const criticalShelters = shelters.filter((s) => (s.currentOccupancy / s.totalCapacity) >= 0.9);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="SHELTER & RESOURCE CONTROL" />
      <ConnectionStatus />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* State Shelter Summary Grid */}
        <Text style={styles.sectionTitle}>STATE RELIEF CAMP OVERVIEW</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{openShelters} / {totalShelters}</Text>
            <Text style={styles.statLabel}>OPEN RELIEF CAMPS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{totalOccupancy} / {totalBeds}</Text>
            <Text style={styles.statLabel}>BEDS OCCUPIED</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: colors.status.success }]}>{occupancyPercent}%</Text>
            <Text style={styles.statLabel}>UTILIZATION RATE</Text>
          </View>
        </View>

        {/* Critical Capacity Warning Callout */}
        {criticalShelters.length > 0 && (
          <View style={styles.warningBanner}>
            <AlertTriangle size={16} color={colors.severity.CRITICAL.main} />
            <Text style={styles.warningText}>
              CRITICAL CAPACITY WARNING: {criticalShelters.length} Shelter(s) exceeded 90% occupancy ({criticalShelters.map((s) => s.name).join(', ')})
            </Text>
          </View>
        )}

        {/* Quick Resource Dispatch Actions Bar */}
        <Text style={styles.sectionTitle}>NDRF & RELIEF SUPPLY DISPATCH</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
            <Truck size={18} color={colors.primary.main} />
            <Text style={styles.actionTitle}>Dispatch Water Tanker</Text>
            <Text style={styles.actionSub}>2 Tankers Standby</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
            <Radio size={18} color={colors.safety.main} />
            <Text style={styles.actionTitle}>Deploy NDRF Unit</Text>
            <Text style={styles.actionSub}>BN06 Battalion</Text>
          </TouchableOpacity>
        </View>

        {/* Shelter Control List */}
        <Text style={styles.sectionTitle}>SHELTER CAPACITY & STATUS CONTROL</Text>
        {shelters.map((shelter) => (
          <View key={shelter.id} style={styles.mgmtWrapper}>
            <ShelterCard shelter={shelter} />
            <View style={styles.controlBar}>
              <Text style={styles.unitText}>Assigned NDRF Unit: {shelter.ndrfUnitId || 'Local NDRF-BN06'}</Text>
              <TouchableOpacity style={styles.updateBtn} activeOpacity={0.7}>
                <ShieldCheck size={12} color="#FFF" />
                <Text style={styles.updateBtnText}>Update Status</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  sectionTitle: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
    marginVertical: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    ...shadows.sm,
  },
  statVal: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
  },
  statLabel: {
    color: colors.text.muted,
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
    textAlign: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.severity.CRITICAL.border,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  warningText: {
    color: colors.severity.CRITICAL.text,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: 4,
    ...shadows.sm,
  },
  actionTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  actionSub: {
    color: colors.text.muted,
    fontSize: 10,
  },
  mgmtWrapper: {
    marginBottom: spacing.sm,
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  unitText: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  updateBtn: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  updateBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
});
