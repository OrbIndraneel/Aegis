import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Vibration,
  Platform,
} from 'react-native';
import {
  Radio,
  X,
  Target,
  Navigation,
  Heart,
  BatteryCharging,
  ShieldCheck,
  PhoneCall,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { RescueBeacon } from '../../types';
import { ApiClient } from '../../services/api/client';

const { width } = Dimensions.get('window');
const RADAR_SIZE = Math.min(width - 48, 320);

// Default seed beacons for Vadodara rescue operations
const DEFAULT_BEACONS: RescueBeacon[] = [
  {
    beaconId: 'BCN-VAD-01',
    userId: 'usr_patel_88',
    fullName: 'Kiran Patel',
    bloodGroup: 'O+',
    triagePriority: 'CRITICAL_RED',
    sosReason: 'Submerged Ground Floor / Trapped Under Debris',
    medicalNotes: 'Diabetic, Mobility Impaired',
    coordinate: { latitude: 22.3142, longitude: 73.1824 },
    batteryLevel: 42,
    signalStrengthDbm: -48,
    estimatedDistanceMeters: 2.1,
    proximityZone: 'NEAR',
    isActive: true,
    isTorchActive: true,
    isSirenActive: true,
    lastBroadcastTimestamp: Date.now(),
  },
  {
    beaconId: 'BCN-VAD-02',
    userId: 'usr_sharma_12',
    fullName: 'Meera Sharma',
    bloodGroup: 'B+',
    triagePriority: 'URGENT_YELLOW',
    sosReason: 'Rooftop Stranded / Floodwaters Rising',
    medicalNotes: 'Asthma, Requires Inhaler',
    coordinate: { latitude: 22.3190, longitude: 73.1780 },
    batteryLevel: 78,
    signalStrengthDbm: -72,
    estimatedDistanceMeters: 11.5,
    proximityZone: 'FAR',
    isActive: true,
    isTorchActive: true,
    isSirenActive: false,
    lastBroadcastTimestamp: Date.now(),
  },
  {
    beaconId: 'BCN-VAD-03',
    userId: 'usr_joshi_44',
    fullName: 'Ramesh Joshi',
    bloodGroup: 'AB+',
    triagePriority: 'CRITICAL_RED',
    sosReason: 'Collapsed Wall / Fractured Leg',
    medicalNotes: 'Senior Citizen, Severe Pain',
    coordinate: { latitude: 22.3088, longitude: 73.1895 },
    batteryLevel: 31,
    signalStrengthDbm: -38,
    estimatedDistanceMeters: 0.9,
    proximityZone: 'IMMEDIATE',
    isActive: true,
    isTorchActive: true,
    isSirenActive: true,
    lastBroadcastTimestamp: Date.now(),
  },
];

interface AuthorityBeaconRadarModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBeaconForDispatch?: (beacon: RescueBeacon) => void;
}

export const AuthorityBeaconRadarModal: React.FC<AuthorityBeaconRadarModalProps> = ({
  visible,
  onClose,
  onSelectBeaconForDispatch,
}) => {
  const [beacons, setBeacons] = useState<RescueBeacon[]>(DEFAULT_BEACONS);
  const [selectedBeacon, setSelectedBeacon] = useState<RescueBeacon>(DEFAULT_BEACONS[0]);
  const [radarAngle, setRadarAngle] = useState(0);
  const [isAudioTicking, setIsAudioTicking] = useState(true);

  // Rotate radar sweep beam
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 6) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [visible]);

  // Avalanche-transceiver style proximity ticking based on selected beacon distance
  useEffect(() => {
    if (!visible || !selectedBeacon || !isAudioTicking) return;

    // Faster ticks for closer beacons (Immediate: 250ms, Near: 600ms, Far: 1400ms)
    let tickDelay = 1400;
    if (selectedBeacon.proximityZone === 'IMMEDIATE') {
      tickDelay = 250;
    } else if (selectedBeacon.proximityZone === 'NEAR') {
      tickDelay = 650;
    }

    const tickInterval = setInterval(() => {
      if (Platform.OS !== 'web') {
        Vibration.vibrate(40);
      }
    }, tickDelay);

    return () => clearInterval(tickInterval);
  }, [visible, selectedBeacon, isAudioTicking]);

  // Fetch active beacons from backend if available
  useEffect(() => {
    if (!visible) return;
    const fetchBeacons = async () => {
      try {
        const liveBeacons = await ApiClient.fetchBeacons();
        if (liveBeacons && liveBeacons.length > 0) {
          setBeacons(liveBeacons);
        }
      } catch {}
    };
    fetchBeacons();
  }, [visible]);

  // Convert RSSI dBm (-30 to -95) to percentage (100% to 0%)
  const calculateSignalPercentage = (dbm: number) => {
    const clamped = Math.max(-95, Math.min(-30, dbm));
    return Math.round(((clamped - -95) / (-30 - -95)) * 100);
  };

  const getTriageColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL_RED':
        return '#EF4444';
      case 'URGENT_YELLOW':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  const getProximityText = (beacon: RescueBeacon) => {
    if (beacon.estimatedDistanceMeters < 1.5) {
      return '🔥 IMMEDIATE REACH — Victim within 1.5m under debris';
    }
    if (beacon.estimatedDistanceMeters < 5) {
      return '⚡ APPROACHING — Signal strong (Within 5m)';
    }
    return '📡 ACQUIRED — Directional beacon detected';
  };

  // Fixed angular coordinates for seed blips inside radar
  const blipPositions = [
    { angle: 45, radiusRatio: 0.35 },
    { angle: 210, radiusRatio: 0.8 },
    { angle: 320, radiusRatio: 0.18 },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Radar Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.radarLiveDot} />
            <Text style={styles.headerTitle}>TACTICAL RESCUE RADAR</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setIsAudioTicking(!isAudioTicking)}
            >
              {isAudioTicking ? (
                <Volume2 size={18} color="#10B981" />
              ) : (
                <VolumeX size={18} color="#64748B" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Radar Sweep Container */}
          <View style={styles.radarContainer}>
            <View style={[styles.radarDisc, { width: RADAR_SIZE, height: RADAR_SIZE }]}>
              {/* Outer Ring (> 10m) */}
              <View style={[styles.ring, styles.ringOuter]} />
              {/* Middle Ring (2 - 10m) */}
              <View style={[styles.ring, styles.ringMiddle]} />
              {/* Inner Ring (< 2m) */}
              <View style={[styles.ring, styles.ringInner]} />

              {/* Crosshairs */}
              <View style={styles.crosshairVertical} />
              <View style={styles.crosshairHorizontal} />

              {/* Rotating Sweep Line */}
              <View
                style={[
                  styles.sweepLineContainer,
                  { transform: [{ rotate: `${radarAngle}deg` }] },
                ]}
              >
                <View style={styles.sweepLine} />
              </View>

              {/* Radar Center (Rescuer Position) */}
              <View style={styles.rescuerCenter}>
                <Target size={14} color="#FFFFFF" />
              </View>

              {/* Beacon Blips */}
              {beacons.map((beacon, idx) => {
                const pos = blipPositions[idx % blipPositions.length];
                const r = (RADAR_SIZE / 2) * pos.radiusRatio;
                const rad = (pos.angle * Math.PI) / 180;
                const x = RADAR_SIZE / 2 + r * Math.cos(rad) - 12;
                const y = RADAR_SIZE / 2 + r * Math.sin(rad) - 12;
                const isSelected = selectedBeacon.beaconId === beacon.beaconId;

                return (
                  <TouchableOpacity
                    key={beacon.beaconId}
                    style={[
                      styles.blip,
                      {
                        left: x,
                        top: y,
                        backgroundColor: getTriageColor(beacon.triagePriority),
                        borderColor: isSelected ? '#FFFFFF' : 'transparent',
                        transform: [{ scale: isSelected ? 1.3 : 1.0 }],
                      },
                    ]}
                    onPress={() => setSelectedBeacon(beacon)}
                  >
                    <View style={styles.blipInner} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Radar Legend */}
            <View style={styles.radarLegend}>
              <Text style={styles.legendText}>
                Inner: &lt;2m • Middle: 2-10m • Outer: &gt;10m
              </Text>
            </View>
          </View>

          {/* Selected Beacon Vitals & Proximity Guidance */}
          <View style={styles.targetCard}>
            <View style={styles.targetHeader}>
              <View style={styles.targetTitleGroup}>
                <Text style={styles.targetId}>{selectedBeacon.beaconId}</Text>
                <Text style={styles.targetName}>{selectedBeacon.fullName}</Text>
              </View>
              <View
                style={[
                  styles.triageBadge,
                  { backgroundColor: getTriageColor(selectedBeacon.triagePriority) },
                ]}
              >
                <Text style={styles.triageBadgeText}>
                  {selectedBeacon.triagePriority.replace('_', ' ')}
                </Text>
              </View>
            </View>

            {/* Hot/Cold Guidance Bar */}
            <View style={styles.guidanceBanner}>
              <Text style={styles.guidanceText}>{getProximityText(selectedBeacon)}</Text>
            </View>

            {/* RSSI Signal Strength Meter */}
            <View style={styles.rssiSection}>
              <View style={styles.rssiHeader}>
                <Text style={styles.rssiTitle}>Signal Strength (RSSI)</Text>
                <Text style={styles.rssiValue}>
                  {selectedBeacon.signalStrengthDbm} dBm (
                  {calculateSignalPercentage(selectedBeacon.signalStrengthDbm)}%)
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${calculateSignalPercentage(selectedBeacon.signalStrengthDbm)}%`,
                      backgroundColor:
                        selectedBeacon.proximityZone === 'IMMEDIATE'
                          ? '#EF4444'
                          : selectedBeacon.proximityZone === 'NEAR'
                          ? '#F59E0B'
                          : '#3B82F6',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Metric Chips */}
            <View style={styles.metricGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Distance</Text>
                <Text style={styles.metricBig}>
                  ~{selectedBeacon.estimatedDistanceMeters.toFixed(1)} m
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Blood Group</Text>
                <View style={styles.bloodRow}>
                  <Heart size={14} color="#EF4444" />
                  <Text style={styles.metricBig}>{selectedBeacon.bloodGroup || 'O+'}</Text>
                </View>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Battery</Text>
                <View style={styles.bloodRow}>
                  <BatteryCharging size={14} color="#10B981" />
                  <Text style={styles.metricBig}>{selectedBeacon.batteryLevel}%</Text>
                </View>
              </View>
            </View>

            {/* Trapped Reason & Medical Notes */}
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Distress Cause:</Text>
              <Text style={styles.notesValue}>{selectedBeacon.sosReason}</Text>
              {selectedBeacon.medicalNotes ? (
                <Text style={styles.notesAlert}>
                  ⚠️ Alerts: {selectedBeacon.medicalNotes}
                </Text>
              ) : null}
            </View>

            {/* Rescuer Actions */}
            <TouchableOpacity
              style={styles.dispatchBtn}
              onPress={() => {
                if (onSelectBeaconForDispatch) {
                  onSelectBeaconForDispatch(selectedBeacon);
                }
                onClose();
              }}
              activeOpacity={0.85}
            >
              <Navigation size={18} color="#FFFFFF" />
              <Text style={styles.dispatchBtnText}>
                Lock On & Dispatch Rescue Team
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radarLiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
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
  radarContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  radarDisc: {
    borderRadius: 999,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  ringOuter: {
    width: '90%',
    height: '90%',
  },
  ringMiddle: {
    width: '60%',
    height: '60%',
  },
  ringInner: {
    width: '30%',
    height: '30%',
  },
  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  crosshairHorizontal: {
    position: 'absolute',
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  sweepLineContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sweepLine: {
    width: 2,
    height: '50%',
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  rescuerCenter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  blip: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  blipInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  radarLegend: {
    marginTop: spacing.sm,
  },
  legendText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
  },
  targetCard: {
    backgroundColor: '#131C2E',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  targetTitleGroup: {
    flex: 1,
  },
  targetId: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
  },
  targetName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: typography.fontWeight.heavy,
    marginTop: 2,
  },
  triageBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
  },
  triageBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: typography.fontWeight.heavy,
  },
  guidanceBanner: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  guidanceText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
  },
  rssiSection: {
    marginBottom: spacing.md,
  },
  rssiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rssiTitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  rssiValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  metricBig: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: typography.fontWeight.heavy,
    marginTop: 2,
  },
  bloodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: '#0F172A',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  notesLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  notesValue: {
    color: '#F1F5F9',
    fontSize: 13,
    marginTop: 2,
  },
  notesAlert: {
    color: '#F59E0B',
    fontSize: 12,
    marginTop: 6,
    fontWeight: typography.fontWeight.semibold,
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: radius.lg,
  },
  dispatchBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
  },
});
