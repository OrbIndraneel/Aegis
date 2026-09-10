import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { Shield, Radio, PhoneCall, Layers, FileText, UserCheck, LogOut } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';

import { useUserStore } from '../../src/store/useUserStore';

export default function AuthoritySettingsScreen() {
  const router = useRouter();
  const { logout } = useUserStore();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="OFFICER COMMAND PROFILE" />
      <ConnectionStatus />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Officer Credentials Card */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconBox}>
              <UserCheck size={20} color={colors.safety.main} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.name}>Commander Tenzing Dorjee</Text>
              <Text style={styles.badgeText}>Badge ID: SDMA-NER-4029 • Operations Chief</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoVal}>Sikkim SDMA & MDoNER Operations</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Jurisdiction Zone</Text>
              <Text style={styles.infoVal}>East Sikkim & NH-10 Corridor</Text>
            </View>
          </View>
        </View>

        {/* Control Room Emergency Hotlines */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <PhoneCall size={18} color={colors.primary.main} />
            <Text style={styles.cardTitle}>CONTROL ROOM HOTLINES</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>State Emergency Operation Center</Text>
            <Text style={styles.contactVal}>1070</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>SDRF 2nd Mountain Battalion Desk</Text>
            <Text style={styles.contactVal}>+91 3592 202112</Text>
          </View>
        </View>

        {/* Tactical Display Preferences */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Layers size={18} color={colors.status.success} />
            <Text style={styles.cardTitle}>TACTICAL GIS DISPLAY PREFERENCES</Text>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Auto-Refresh Satellite Telemetry (15s)</Text>
            <Switch value={true} trackColor={{ true: colors.safety.main }} thumbColor="#FFF" />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>High-Contrast Night Operations GIS</Text>
            <Switch value={true} trackColor={{ true: colors.safety.main }} thumbColor="#FFF" />
          </View>
        </View>

        {/* Audit Log Banner */}
        <View style={styles.auditCard}>
          <FileText size={16} color={colors.text.secondary} />
          <Text style={styles.auditText}>
            Shift Log #4029 Active • All broadcast dispatches logged to Sikkim SDMA & MDoNER Audit Ledger.
          </Text>
        </View>

        {/* LOG OUT / SWITCH PORTAL CARD */}
        <View style={[styles.card, styles.logoutCard]}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={18} color="#DC2626" />
            <Text style={styles.logoutText}>Log Out / Switch Access Portal</Text>
          </TouchableOpacity>
        </View>
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
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  name: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
  },
  badgeText: {
    color: colors.safety.main,
    fontSize: 11,
    marginTop: 2,
    fontWeight: typography.fontWeight.semibold,
  },
  infoGrid: {
    gap: spacing.sm,
  },
  infoBox: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  infoLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  infoVal: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  contactLabel: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
  },
  contactVal: {
    color: colors.primary.light,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  switchLabel: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
  },
  auditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  auditText: {
    color: colors.text.secondary,
    fontSize: 11,
    flex: 1,
  },
  logoutCard: {
    borderColor: 'rgba(220, 38, 38, 0.25)',
    backgroundColor: 'rgba(220, 38, 38, 0.04)',
    marginBottom: spacing.xxl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});
