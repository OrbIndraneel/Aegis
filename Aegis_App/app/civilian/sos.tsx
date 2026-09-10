import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertOctagon, PhoneCall, X, MapPin, CheckCircle2, AlertTriangle, Radio, Flashlight, Volume2 } from 'lucide-react-native';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { useUserStore } from '../../src/store/useUserStore';
import { MockSosService, SosReason, SosDispatchRecord } from '../../src/services/mock/mockSosService';
import { ApiClient } from '../../src/services/api/client';
import { triggerCriticalHapticPulse } from '../../src/utils/emergencyAlertSound';
import { useTranslation } from '../../src/i18n';
import { NativeRescueBeaconModal } from '../../src/components/beacon/NativeRescueBeaconModal';
import { TriVectorBeaconService } from '../../src/services/beacon/triVectorBeaconService';

export default function CivilianSosScreen() {
  const router = useRouter();
  const { profile } = useUserStore();
  const { t } = useTranslation();

  const [selectedReason, setSelectedReason] = useState<SosReason>('Submerged House');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [activeRecord, setActiveRecord] = useState<SosDispatchRecord | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);
  const [isBeaconModalVisible, setIsBeaconModalVisible] = useState(false);

  const handleConfirmSos = async () => {
    setIsTransmitting(true);
    triggerCriticalHapticPulse();

    // 1. Dispatch through centralized ApiClient (Live FastAPI -> Supabase -> Local Offline Queue)
    const dispatchResult = await ApiClient.triggerEmergencySos({
      reason: selectedReason,
      location: profile.currentLocation || { latitude: 22.3072, longitude: 73.1812 },
      fullName: profile.fullName || 'Citizen User',
      phoneNumber: profile.phoneNumber || '+91 00000 00000',
      bloodGroup: profile.bloodGroup,
      medicalConditions: profile.medicalConditions,
    });
    setIsOfflineQueued(dispatchResult.isOfflineQueued);

    // 2. Keep local mock dispatch UI record active for presentation & countdown
    const record = await MockSosService.triggerSos(
      selectedReason,
      profile.currentLocation || { latitude: 22.3072, longitude: 73.1812 },
      profile.fullName,
      profile.phoneNumber,
      profile.bloodGroup,
      profile.medicalConditions
    );

    // 3. Automatically activate Native Tri-Vector Rescue Beacon (Torch + Siren + BLE)
    await TriVectorBeaconService.activateBeacon({
      userId: profile.id,
      fullName: profile.fullName || 'Citizen User',
      bloodGroup: profile.bloodGroup || 'O+',
      sosReason: selectedReason,
      medicalNotes: profile.medicalConditions,
      coordinate: profile.currentLocation,
      language: profile.language || 'EN',
      mode: 'TURBO_CRITICAL',
    });

    setIsTransmitting(false);
    setActiveRecord(record);
    setIsConfirmed(true);
  };

  const handleCancelSos = async () => {
    Alert.alert(
      'Cancel SOS Emergency Broadcast?',
      'Are you sure you want to cancel the active rescue request sent to NDRF Command?',
      [
        { text: 'Keep Active SOS', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: async () => {
            await MockSosService.cancelSos();
            await TriVectorBeaconService.deactivateBeacon();
            setIsConfirmed(false);
            setActiveRecord(null);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('emergencySosDispatch') || 'EMERGENCY BEACON'} />
      <ConnectionStatus />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {!isConfirmed ? (
          /* PRE-ACTIVATION: SELECT REASON & CONFIRM */
          <View>
            <View style={styles.headerBox}>
              <View style={styles.sosIconBox}>
                <AlertOctagon size={36} color="#DC2626" />
              </View>
              <Text style={styles.headerTitle}>{t('distressBeaconTitle')}</Text>
              <Text style={styles.headerSubtitle}>
                {t('distressBeaconSub')}
              </Text>
            </View>

            {/* Current GPS Coordinates Card */}
            <View style={styles.gpsCard}>
              <MapPin size={16} color="#2563EB" />
              <View style={styles.flex1}>
                <Text style={styles.gpsTitle}>{t('transmittingGps')}</Text>
                <Text style={styles.gpsCoords}>
                  {profile.currentLocation?.latitude.toFixed(4)}° N, {profile.currentLocation?.longitude.toFixed(4)}° E
                </Text>
              </View>
            </View>

            {/* Emergency Reason Selector */}
            <Text style={styles.sectionTitle}>{t('emergencyReason')}</Text>
            <View style={styles.reasonsList}>
              {([
                'Submerged House',
                'Medical Emergency',
                'Trapped in Vehicle',
                'Landslide Blockade',
                'General Rescue',
              ] as SosReason[]).map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonChip,
                    selectedReason === reason && styles.reasonActive,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <AlertTriangle
                    size={14}
                    color={selectedReason === reason ? '#FFFFFF' : '#71717A'}
                  />
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason && styles.reasonTextActive,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CONFIRM SOS BUTTON */}
            <TouchableOpacity
              style={styles.confirmSosBtn}
              onPress={handleConfirmSos}
              disabled={isTransmitting}
              activeOpacity={0.85}
            >
              <AlertOctagon size={20} color="#FFF" />
              <Text style={styles.confirmSosText}>
                {isTransmitting ? t('transmittingBeacon') : t('confirmDispatchSos')}
              </Text>
            </TouchableOpacity>

            {/* TRI-VECTOR RESCUE BEACON BUTTON */}
            <TouchableOpacity
              style={styles.triVectorBtn}
              onPress={() => setIsBeaconModalVisible(true)}
              activeOpacity={0.85}
            >
              <View style={styles.triVectorIconCircle}>
                <Radio size={20} color="#EF4444" />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.triVectorTitle}>Launch Tri-Vector Rescue Beacon</Text>
                <Text style={styles.triVectorSub}>Camera Torch • Speaker Siren • Offline BLE</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          /* ACTIVE SOS DISPATCHED STATE */
          <View>
            <View style={styles.activeBanner}>
              <View style={styles.pulseOuter}>
                <View style={styles.pulseInner}>
                  <CheckCircle2 size={32} color="#FFF" />
                </View>
              </View>
              <Text style={styles.activeTitle}>{t('activeRescueBeaconDispatched')}</Text>
              <Text style={styles.trackingId}>{t('trackingId')}: {activeRecord?.sosId}</Text>
              <Text style={styles.assignedUnit}>{t('assignedUnit')}: {activeRecord?.assignedUnit}</Text>
            </View>

            {/* ACTIVE BEACON CONTROLLER BANNER */}
            <TouchableOpacity
              style={styles.triVectorActiveCard}
              onPress={() => setIsBeaconModalVisible(true)}
              activeOpacity={0.85}
            >
              <View style={styles.triVectorActiveHeader}>
                <Radio size={18} color="#EF4444" />
                <Text style={styles.triVectorActiveTitle}>Tri-Vector Beacon Active</Text>
                <View style={styles.liveBeaconBadge}>
                  <Text style={styles.liveBeaconBadgeText}>LIVE</Text>
                </View>
              </View>
              <Text style={styles.triVectorActiveSub}>
                Hardware torch Morse pulse & loudspeaker announcements running. Tap to manage or mute.
              </Text>
            </TouchableOpacity>

            {isOfflineQueued && (
              <View style={styles.offlineSyncNotice}>
                <AlertTriangle size={16} color="#D97706" />
                <Text style={styles.offlineSyncText}>
                  Distress signal cached in local offline storage. Will automatically sync to NDRF Command when signal is restored.
                </Text>
              </View>
            )}

            <View style={styles.profileCard}>
              <Text style={styles.cardHeaderTitle}>Transmitted Evacuee Profile</Text>
              <Text style={styles.profileText}>Evacuee: {profile.fullName} ({profile.phoneNumber})</Text>
              <Text style={styles.profileText}>Reason: {activeRecord?.reason}</Text>
              <Text style={styles.profileText}>Blood Group: {profile.bloodGroup}</Text>
              <Text style={styles.profileText}>Medical Notes: {profile.medicalConditions}</Text>
            </View>

            {/* CANCEL SOS BUTTON */}
            <TouchableOpacity
              style={styles.cancelSosBtn}
              onPress={handleCancelSos}
              activeOpacity={0.8}
            >
              <X size={16} color="#DC2626" />
              <Text style={styles.cancelSosText}>{t('cancelActiveSos')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 1-Tap Emergency Hotlines */}
        <Text style={styles.sectionTitle}>{t('emergencyHotlines')}</Text>
        <View style={styles.hotlinesGrid}>
          {[
            { name: 'NDRF Disaster Helpline', number: '1078' },
            { name: 'State Control Room', number: '1070' },
            { name: 'Ambulance Response', number: '108' },
            { name: 'Police Helpline', number: '100' },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.hotlineChip} activeOpacity={0.8}>
              <PhoneCall size={14} color="#DC2626" />
              <View style={styles.flex1}>
                <Text style={styles.hotlineName}>{item.name}</Text>
              </View>
              <Text style={styles.hotlineNumber}>{item.number}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Tri-Vector Rescue Beacon Modal */}
      <NativeRescueBeaconModal
        visible={isBeaconModalVisible}
        onClose={() => setIsBeaconModalVisible(false)}
        sosReason={selectedReason}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  scrollContainer: {
    paddingBottom: 110,
  },
  headerBox: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  sosIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    color: '#18181B',
    fontSize: 20,
    fontWeight: typography.fontWeight.heavy,
  },
  headerSubtitle: {
    color: '#71717A',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    marginVertical: spacing.sm,
    ...shadows.sm,
  },
  flex1: {
    flex: 1,
  },
  gpsTitle: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  gpsCoords: {
    color: '#18181B',
    fontSize: 13,
    fontWeight: typography.fontWeight.heavy,
    marginTop: 2,
  },
  sectionTitle: {
    color: '#18181B',
    fontSize: 16,
    fontWeight: typography.fontWeight.heavy,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  reasonsList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    gap: spacing.sm,
    ...shadows.sm,
  },
  reasonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  reasonText: {
    color: '#18181B',
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
  },
  reasonTextActive: {
    color: '#FFFFFF',
  },
  confirmSosBtn: {
    backgroundColor: '#DC2626',
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    ...shadows.glowRed,
  },
  confirmSosText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: typography.fontWeight.heavy,
  },
  activeBanner: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: radius.xxl,
    borderWidth: 1.5,
    borderColor: '#10B981',
    marginVertical: spacing.md,
    ...shadows.sm,
  },
  pulseOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  pulseInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTitle: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: typography.fontWeight.heavy,
  },
  trackingId: {
    color: '#18181B',
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    marginTop: 4,
  },
  assignedUnit: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 2,
  },
  offlineSyncNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  offlineSyncText: {
    flex: 1,
    color: '#92400E',
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeaderTitle: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 4,
  },
  profileText: {
    color: '#18181B',
    fontSize: 12,
    marginVertical: 2,
  },
  cancelSosBtn: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  cancelSosText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: typography.fontWeight.heavy,
  },
  hotlinesGrid: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  hotlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  hotlineName: {
    color: '#18181B',
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
  },
  hotlineNumber: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: typography.fontWeight.heavy,
  },
  triVectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293B',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  triVectorIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triVectorTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
  },
  triVectorSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  triVectorActiveCard: {
    backgroundColor: '#1E293B',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  triVectorActiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  triVectorActiveTitle: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
  },
  liveBeaconBadge: {
    backgroundColor: '#DC2626',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.sm,
  },
  liveBeaconBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
  },
  triVectorActiveSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
});
