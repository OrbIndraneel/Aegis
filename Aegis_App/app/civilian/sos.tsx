import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertOctagon, PhoneCall, X, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { Header } from '../../src/components/common/Header';
import { ConnectionStatus } from '../../src/components/common/ConnectionStatus';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { useUserStore } from '../../src/store/useUserStore';
import { MockSosService, SosReason, SosDispatchRecord } from '../../src/services/mock/mockSosService';
import { useTranslation } from '../../src/i18n';

export default function CivilianSosScreen() {
  const router = useRouter();
  const { profile } = useUserStore();
  const { t } = useTranslation();

  const [selectedReason, setSelectedReason] = useState<SosReason>('Submerged House');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [activeRecord, setActiveRecord] = useState<SosDispatchRecord | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);

  const handleConfirmSos = async () => {
    setIsTransmitting(true);
    const record = await MockSosService.triggerSos(
      selectedReason,
      profile.currentLocation || { latitude: 22.3072, longitude: 73.1812 },
      profile.fullName,
      profile.phoneNumber,
      profile.bloodGroup,
      profile.medicalConditions
    );
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
});
