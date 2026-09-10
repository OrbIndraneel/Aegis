import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Radio, Zap, Volume2, ShieldCheck, MapPin, CheckCircle2, PhoneCall } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { SosDispatchRecord } from '../../services/mock/mockSosService';
import { BeaconService } from '../../services/beacon/beaconService';

interface Props {
  record: SosDispatchRecord;
  onClose?: () => void;
}

export const RescueBeaconBanner: React.FC<Props> = ({ record, onClose }) => {
  const [torchActive, setTorchActive] = useState(false);
  const [torchStatusMsg, setTorchStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    // Activate audio siren & vibration pattern
    BeaconService.startBeaconAlert();
    return () => {
      BeaconService.stopBeaconAlert();
    };
  }, []);

  const handleToggleTorch = async () => {
    const res = await BeaconService.toggleLocalTorch(!torchActive);
    setTorchActive(res.active);
    setTorchStatusMsg(res.message);
  };

  return (
    <View style={styles.container}>
      {/* High Intensity Strobe Header */}
      <View style={styles.strobeHeader}>
        <View style={styles.pulseDot} />
        <Radio size={20} color="#FFF" />
        <Text style={styles.strobeTitle}>AUTHORITY RESCUE BEACON ACTIVE</Text>
      </View>

      <View style={styles.contentBox}>
        {/* Status Callout */}
        <View style={styles.statusRow}>
          <View style={styles.badgeEnRoute}>
            <ShieldCheck size={14} color="#10B981" />
            <Text style={styles.badgeText}>{record.status || 'EN ROUTE'}</Text>
          </View>
          <Text style={styles.trackingText}>ID: {record.sosId}</Text>
        </View>

        <Text style={styles.rescueUnitText}>Assigned Unit: {record.assignedUnit}</Text>
        <Text style={styles.evacueeText}>Evacuee: {record.userName} ({record.userPhone})</Text>

        {/* GPS Transmitted Location */}
        <View style={styles.locBox}>
          <MapPin size={14} color="#3B82F6" />
          <Text style={styles.locText}>
            Transmitted Coordinates: {record.coordinate.latitude.toFixed(4)}° N, {record.coordinate.longitude.toFixed(4)}° E
          </Text>
        </View>

        {/* Flashlight / Torch Capability Callout */}
        <View style={styles.torchBox}>
          <TouchableOpacity
            style={[styles.torchBtn, torchActive && styles.torchBtnActive]}
            onPress={handleToggleTorch}
            activeOpacity={0.85}
          >
            <Zap size={16} color={torchActive ? '#FFF' : '#F59E0B'} />
            <Text style={[styles.torchBtnText, torchActive && styles.torchBtnTextActive]}>
              {torchActive ? 'FLASHING TORCH ACTIVE' : 'TOGGLE DEVICE FLASHLIGHT STROBE'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.torchDisclosure}>
            * Audio/Visual Beacon active. Flashlight control subject to hardware capability & Android OS background permissions.
          </Text>
          {torchStatusMsg && <Text style={styles.torchStatusMsg}>{torchStatusMsg}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0F1D',
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: '#F59E0B',
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  strobeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B45309',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FEF08A',
  },
  strobeTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
    flex: 1,
  },
  contentBox: {
    padding: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  badgeEnRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 4,
  },
  badgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: typography.fontWeight.heavy,
  },
  trackingText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  rescueUnitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
  },
  evacueeText: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
  },
  locBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: radius.sm,
    padding: spacing.xs,
    gap: spacing.xs,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  locText: {
    color: '#93C5FD',
    fontSize: 11,
    flex: 1,
  },
  torchBox: {
    marginTop: spacing.xs,
  },
  torchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: spacing.xs,
  },
  torchBtnActive: {
    backgroundColor: '#D97706',
    borderColor: '#F59E0B',
  },
  torchBtnText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  torchBtnTextActive: {
    color: '#FFFFFF',
  },
  torchDisclosure: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 6,
    lineHeight: 12,
    fontStyle: 'italic',
  },
  torchStatusMsg: {
    color: '#F59E0B',
    fontSize: 10,
    marginTop: 4,
  },
});
