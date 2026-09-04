import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { Shield, Radio, PhoneCall, Layers, FileText, UserCheck, LogOut, HeartPulse, ShieldAlert, Check } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { ApiClient } from '../../src/services/api/client';
import { EmergencyMedicalSummaryModal } from '../../src/components/authority/EmergencyMedicalSummaryModal';

type AuthorityRoleType = 'ADMIN' | 'DISTRICT_MANAGER' | 'FIELD_OFFICER' | 'ANALYST' | 'SHELTER_MANAGER' | 'VOLUNTEER';

const ROLES_INFO: Record<AuthorityRoleType, { label: string; jurisdiction: string; desc: string }> = {
  ADMIN: { label: 'State Admin', jurisdiction: 'State / Universal Scope', desc: 'Full operational & alert command' },
  DISTRICT_MANAGER: { label: 'District Mgr', jurisdiction: 'Vadodara District', desc: 'District alerts & evacuation coordination' },
  FIELD_OFFICER: { label: 'Field Officer', jurisdiction: 'Zone 01 / Akota Corridor', desc: 'Local triage & evacuation rescue' },
  ANALYST: { label: 'Analyst', jurisdiction: 'Read-only / Historical', desc: 'Model simulations & reports (No live alerts)' },
  SHELTER_MANAGER: { label: 'Shelter Mgr', jurisdiction: 'Assigned Shelter: sh_01', desc: 'Shelter occupancy & supply requests' },
  VOLUNTEER: { label: 'Volunteer / NGO', jurisdiction: 'Public Operational Area', desc: 'Task reporting & community assistance' },
};

export default function AuthoritySettingsScreen() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<AuthorityRoleType>('FIELD_OFFICER');
  const [medModalVisible, setMedModalVisible] = useState(false);
  const [medSummary, setMedSummary] = useState<any>(null);
  const [fetchingMed, setFetchingMed] = useState(false);

  const handleLogout = () => {
    router.replace('/');
  };

  const handleViewMedicalTriage = async () => {
    setFetchingMed(true);
    try {
      const res = await ApiClient.fetchEmergencyMedicalSummary('demo-civilian-01', {
        'X-Authority-Role': activeRole,
        'X-Authority-ID': 'OFF-CURRENT',
        'X-Authority-Jurisdiction': ROLES_INFO[activeRole].jurisdiction,
      });
      if (res && res.summary) {
        setMedSummary(res.summary);
      } else {
        setMedSummary({
          civilian_id: 'demo-civilian-01',
          blood_group: 'O+',
          critical_allergies: ['Penicillin'],
          critical_conditions: ['Type 1 Diabetes Mellitus'],
          emergency_contacts: [{ name: 'Family Contact', relation: 'Spouse', phone: '+91 98765 11223' }],
          disclaimer: 'EMERGENCY USE ONLY — ACCESS LOGGED AND MONITORED',
          last_retrieved: new Date().toLocaleTimeString(),
        });
      }
      setMedModalVisible(true);
    } catch (e) {
      console.warn('Medical fetch failed:', e);
    } finally {
      setFetchingMed(false);
    }
  };

  const currentRoleConfig = ROLES_INFO[activeRole];

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
              <Text style={styles.name}>Commander Vikramaditya Singh</Text>
              <Text style={styles.badgeText}>Badge ID: GSDMA-OFF-4029 • {currentRoleConfig.label}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoVal}>GSDMA Central Command</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Enforced Jurisdiction</Text>
              <Text style={styles.infoVal}>{currentRoleConfig.jurisdiction}</Text>
            </View>
          </View>
        </View>

        {/* RBAC ROLE SIMULATION SELECTOR */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ShieldAlert size={18} color="#EA580C" />
            <Text style={styles.cardTitle}>AUTHORITY ROLE & SCOPE ENFORCEMENT</Text>
          </View>
          <Text style={styles.roleSubtext}>Select role to test backend-enforced RBAC and geographic boundaries:</Text>

          <View style={styles.roleGrid}>
            {(Object.keys(ROLES_INFO) as AuthorityRoleType[]).map((r) => {
              const isSelected = activeRole === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.rolePill, isSelected && styles.rolePillActive]}
                  onPress={() => setActiveRole(r)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.rolePillText, isSelected && styles.rolePillTextActive]}>
                    {ROLES_INFO[r].label}
                  </Text>
                  {isSelected && <Check size={11} color="#FFFFFF" />}
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.roleDescText}>• {currentRoleConfig.desc}</Text>
        </View>

        {/* EMERGENCY MEDICAL TRIAGE ACCESS (FEATURE 14) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <HeartPulse size={18} color="#DC2626" />
            <Text style={styles.cardTitle}>ABDM EMERGENCY MEDICAL TRIAGE</Text>
          </View>
          <Text style={styles.roleSubtext}>
            Retrieve minimum necessary emergency medical summary for field triage. All queries are audited.
          </Text>

          <TouchableOpacity
            style={[styles.medicalBtn, (activeRole === 'ANALYST' || activeRole === 'VOLUNTEER') && styles.medicalBtnDisabled]}
            onPress={handleViewMedicalTriage}
            disabled={fetchingMed || activeRole === 'ANALYST' || activeRole === 'VOLUNTEER'}
            activeOpacity={0.8}
          >
            <HeartPulse size={16} color="#FFFFFF" />
            <Text style={styles.medicalBtnText}>
              {activeRole === 'ANALYST' || activeRole === 'VOLUNTEER'
                ? `Access Barred (${activeRole})`
                : 'Open Emergency Medical Summary'}
            </Text>
          </TouchableOpacity>
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
            <Text style={styles.contactLabel}>NDRF Battalion 06 Control Desk</Text>
            <Text style={styles.contactVal}>+91 265 2791078</Text>
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
            Shift Log #4029 Active • All broadcast dispatches logged to GSDMA State Audit Ledger.
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

      {/* EMERGENCY MEDICAL TRIAGE MODAL */}
      <EmergencyMedicalSummaryModal
        visible={medModalVisible}
        summary={medSummary}
        onClose={() => setMedModalVisible(false)}
        civilianName="Evacuee Triage Profile"
      />
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
  roleSubtext: {
    color: colors.text.secondary,
    fontSize: 11.5,
    marginBottom: 10,
    lineHeight: 16,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background.tertiary,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  rolePillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  rolePillText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  rolePillTextActive: {
    color: '#FFFFFF',
  },
  roleDescText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8,
  },
  medicalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  medicalBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  medicalBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.3,
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

