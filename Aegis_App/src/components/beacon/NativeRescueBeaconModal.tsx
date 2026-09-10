import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Radio,
  Flashlight,
  Volume2,
  VolumeX,
  ShieldAlert,
  BatteryCharging,
  Clock,
  Heart,
  X,
  CheckCircle2,
  Zap,
} from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useUserStore } from '../../store/useUserStore';
import { TriVectorBeaconService } from '../../services/beacon/triVectorBeaconService';
import { TriVectorBeaconState } from '../../types';
import { CameraTorchHost } from './CameraTorchHost';

interface NativeRescueBeaconModalProps {
  visible: boolean;
  onClose: () => void;
  sosReason?: string;
}

export const NativeRescueBeaconModal: React.FC<NativeRescueBeaconModalProps> = ({
  visible,
  onClose,
  sosReason = 'Disaster Extraction',
}) => {
  const { profile } = useUserStore();
  const [beaconState, setBeaconState] = useState<TriVectorBeaconState>(
    TriVectorBeaconService.getState()
  );

  useEffect(() => {
    const unsubscribe = TriVectorBeaconService.subscribe((state) => {
      setBeaconState(state);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-activate when opened if not active
  useEffect(() => {
    if (visible && !beaconState.isActive) {
      TriVectorBeaconService.activateBeacon({
        userId: profile.id,
        fullName: profile.fullName || 'Citizen User',
        bloodGroup: profile.bloodGroup || 'O+',
        sosReason,
        medicalNotes: profile.medicalConditions,
        coordinate: profile.currentLocation,
        language: profile.language || 'EN',
        mode: 'TURBO_CRITICAL',
      });
    }
  }, [visible]);

  const handleToggleTorch = () => {
    TriVectorBeaconService.toggleTorch();
  };

  const handleToggleMute = () => {
    TriVectorBeaconService.toggleMute();
  };

  const handleToggleMode = () => {
    const nextMode =
      beaconState.operatingMode === 'TURBO_CRITICAL'
        ? 'ENDURANCE_SAVER'
        : 'TURBO_CRITICAL';
    TriVectorBeaconService.setOperatingMode(nextMode);
  };

  const handleStopBeacon = () => {
    Alert.alert(
      'Deactivate Rescue Beacon?',
      'This will stop the physical camera flashlight, speaker siren, and radio beacon broadcasts.',
      [
        { text: 'Keep Active', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            await TriVectorBeaconService.deactivateBeacon();
            onClose();
          },
        },
      ]
    );
  };

  const formatElapsed = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Invisible host enabling Camera torch */}
        <CameraTorchHost />

        {/* Tactical Header */}
        <View style={styles.header}>
          <View style={styles.beaconPill}>
            <Radio size={16} color="#DC2626" />
            <Text style={styles.beaconPillText}>TRI-VECTOR RESCUE BEACON</Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityLabel="Minimize Beacon"
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Status Hero */}
          <View style={styles.heroCard}>
            <View style={styles.radarPulseRing}>
              <View style={styles.radarCore}>
                <Radio size={36} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.heroTitle}>
              {beaconState.isActive ? 'BEACON TRANSMITTING' : 'STANDBY'}
            </Text>
            <Text style={styles.heroSubtitle}>
              Hardware Flashlight • Loudspeaker Siren • BLE Radio
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Clock size={14} color="#94A3B8" />
                <Text style={styles.metaText}>
                  Active: {formatElapsed(beaconState.activeSeconds)}
                </Text>
              </View>
              <View style={styles.metaChip}>
                <BatteryCharging size={14} color="#10B981" />
                <Text style={styles.metaText}>
                  {beaconState.operatingMode === 'TURBO_CRITICAL'
                    ? 'Est. 12h'
                    : 'Est. 28h (Saver)'}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Mode Switcher */}
          <View style={styles.modeCard}>
            <View style={styles.flex1}>
              <Text style={styles.modeTitle}>Operating Profile</Text>
              <Text style={styles.modeDesc}>
                {beaconState.operatingMode === 'TURBO_CRITICAL'
                  ? 'Turbo: Rapid strobe & 8s audio interval'
                  : 'Endurance: Morse SOS & 16s battery saver'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.modeBtn,
                beaconState.operatingMode === 'ENDURANCE_SAVER' && styles.modeBtnSaver,
              ]}
              onPress={handleToggleMode}
            >
              <Zap size={14} color="#FFFFFF" />
              <Text style={styles.modeBtnText}>
                {beaconState.operatingMode === 'TURBO_CRITICAL' ? 'Switch to Saver' : 'Switch to Turbo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tri-Vector Hardware Channels */}
          <Text style={styles.sectionHeader}>Hardware Transmission Vectors</Text>

          {/* 1. Flashlight Strobe */}
          <View style={styles.vectorCard}>
            <View
              style={[
                styles.vectorIconBox,
                beaconState.isTorchActive && styles.vectorIconActiveYellow,
              ]}
            >
              <Flashlight
                size={22}
                color={beaconState.isTorchActive ? '#F59E0B' : '#64748B'}
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.vectorTitle}>Physical Camera Flashlight</Text>
              <Text style={styles.vectorStatus}>
                {beaconState.isTorchActive
                  ? 'Morse SOS Strobe (... --- ...)'
                  : 'Torch Paused (Conserving Power)'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                !beaconState.isTorchActive && styles.toggleBtnInactive,
              ]}
              onPress={handleToggleTorch}
            >
              <Text style={styles.toggleBtnText}>
                {beaconState.isTorchActive ? 'Pause Torch' : 'Start Torch'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 2. Loudspeaker Siren & Voice */}
          <View style={styles.vectorCard}>
            <View
              style={[
                styles.vectorIconBox,
                !beaconState.isMuted && styles.vectorIconActiveRed,
              ]}
            >
              {!beaconState.isMuted ? (
                <Volume2 size={22} color="#EF4444" />
              ) : (
                <VolumeX size={22} color="#64748B" />
              )}
            </View>
            <View style={styles.flex1}>
              <Text style={styles.vectorTitle}>Loudspeaker Siren & Speech</Text>
              <Text style={styles.vectorStatus}>
                {!beaconState.isMuted
                  ? `Announcing Distress Every ${beaconState.broadcastIntervalMs / 1000}s`
                  : 'Audio Muted (Silent Listening Mode)'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                beaconState.isMuted && styles.toggleBtnMuted,
              ]}
              onPress={handleToggleMute}
            >
              <Text style={styles.toggleBtnText}>
                {beaconState.isMuted ? 'Unmute Speaker' : '1-Tap Mute'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3. Zero-Internet BLE Radio Frame */}
          <View style={styles.vectorCard}>
            <View style={[styles.vectorIconBox, styles.vectorIconActiveBlue]}>
              <Radio size={22} color="#3B82F6" />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.vectorTitle}>Offline Radio Beacon Frame</Text>
              <Text style={styles.vectorStatus}>
                ID: {beaconState.beaconId} • Triage: CRITICAL
              </Text>
            </View>
            <View style={styles.liveBadge}>
              <CheckCircle2 size={12} color="#10B981" />
              <Text style={styles.liveBadgeText}>BROADCASTING</Text>
            </View>
          </View>

          {/* Transmitted Medical & Vitals Profile */}
          <View style={styles.medicalCard}>
            <View style={styles.medicalHeader}>
              <Heart size={16} color="#DC2626" />
              <Text style={styles.medicalTitle}>Broadcasted Evacuee Vitals</Text>
              <View style={styles.bloodBadge}>
                <Text style={styles.bloodBadgeText}>{profile.bloodGroup || 'O+'}</Text>
              </View>
            </View>
            <Text style={styles.medicalLine}>
              Name: <Text style={styles.boldText}>{profile.fullName || 'Evacuee'}</Text>
            </Text>
            <Text style={styles.medicalLine}>
              Emergency Reason: <Text style={styles.boldText}>{sosReason}</Text>
            </Text>
            {profile.medicalConditions ? (
              <Text style={styles.medicalLine}>
                Medical Alerts: <Text style={styles.boldText}>{profile.medicalConditions}</Text>
              </Text>
            ) : null}
            <Text style={styles.medicalLine}>
              Emergency Contact: <Text style={styles.boldText}>{profile.phoneNumber || 'NDRF Central'}</Text>
            </Text>
          </View>

          {/* STOP BEACON BUTTON */}
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={handleStopBeacon}
            activeOpacity={0.85}
          >
            <ShieldAlert size={20} color="#DC2626" />
            <Text style={styles.stopBtnText}>Deactivate Rescue Beacon</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  beaconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  beaconPillText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  radarPulseRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  radarCore: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  metaText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#334155',
  },
  flex1: {
    flex: 1,
  },
  modeTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
  },
  modeDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  modeBtnSaver: {
    backgroundColor: '#059669',
  },
  modeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
  },
  sectionHeader: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  vectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  vectorIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vectorIconActiveYellow: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  vectorIconActiveRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  vectorIconActiveBlue: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  vectorTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
  },
  vectorStatus: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  toggleBtn: {
    backgroundColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  toggleBtnInactive: {
    backgroundColor: '#475569',
  },
  toggleBtnMuted: {
    backgroundColor: '#DC2626',
  },
  toggleBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
  },
  liveBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
  },
  medicalCard: {
    backgroundColor: '#1E293B',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginVertical: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  medicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: 6,
  },
  medicalTitle: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
  },
  bloodBadge: {
    backgroundColor: '#DC2626',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
  },
  bloodBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: typography.fontWeight.heavy,
  },
  medicalLine: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 3,
  },
  boldText: {
    color: '#F1F5F9',
    fontWeight: typography.fontWeight.semibold,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.35)',
    marginTop: spacing.sm,
  },
  stopBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
  },
});
