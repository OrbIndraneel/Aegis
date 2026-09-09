import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, X, Crosshair, MapPin, PhoneCall, CheckCircle2, XCircle } from 'lucide-react-native';
import { colors, radius, spacing, typography, shadows } from '../../theme';
import { Shelter } from '../../types';

interface Props {
  shelter: Shelter;
  onClose: () => void;
  onNavigate: (shelter: Shelter) => void;
}

export const ShelterBottomSheet: React.FC<Props> = ({
  shelter,
  onClose,
  onNavigate,
}) => {
  const occupancyPercent = shelter.capacity?.occupancyPercentage || Math.min(100, Math.round((shelter.currentOccupancy / shelter.totalCapacity) * 100));

  const getCapacityColor = () => {
    if (occupancyPercent >= 90) return colors.severity.CRITICAL.main;
    if (occupancyPercent >= 70) return colors.severity.MODERATE.main;
    return colors.status.success;
  };

  return (
    <View style={styles.sheet}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Home size={20} color={colors.status.success} />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.title} numberOfLines={1}>
              {shelter.name}
            </Text>
            <Text style={styles.subtitle}>{shelter.distanceKm} km away • {shelter.address}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
          <X size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Capacity Progress Bar */}
      <View style={styles.capacityCard}>
        <View style={styles.capacityHeader}>
          <Text style={styles.capacityLabel}>LIVE SHELTER CAPACITY</Text>
          <Text style={styles.capacityVal}>
            {shelter.currentOccupancy} / {shelter.totalCapacity} Beds ({shelter.capacity?.availableBeds || 1400} Available)
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${occupancyPercent}%`, backgroundColor: getCapacityColor() },
            ]}
          />
        </View>
      </View>

      {/* Facilities Grid */}
      <Text style={styles.sectionTitle}>AVAILABLE SHELTER FACILITIES</Text>
      <View style={styles.amenitiesRow}>
        <View style={styles.chip}>
          {shelter.amenities.medicalKit ? <CheckCircle2 size={12} color={colors.status.success} /> : <XCircle size={12} color={colors.text.muted} />}
          <Text style={styles.chipText}>Medical Kit</Text>
        </View>
        <View style={styles.chip}>
          {shelter.amenities.foodSupplies ? <CheckCircle2 size={12} color={colors.status.success} /> : <XCircle size={12} color={colors.text.muted} />}
          <Text style={styles.chipText}>Food Packets</Text>
        </View>
        <View style={styles.chip}>
          {shelter.amenities.cleanWater ? <CheckCircle2 size={12} color={colors.status.success} /> : <XCircle size={12} color={colors.text.muted} />}
          <Text style={styles.chipText}>Clean Water</Text>
        </View>
        <View style={styles.chip}>
          {shelter.amenities.powerGenerator ? <CheckCircle2 size={12} color={colors.status.success} /> : <XCircle size={12} color={colors.text.muted} />}
          <Text style={styles.chipText}>Power Gen</Text>
        </View>
      </View>

      {/* Contact & NDRF Unit */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>📞 {shelter.contactNumber}</Text>
        <Text style={styles.metaText}>🛡️ {shelter.ndrfUnitId || 'NDRF Battalion 06'}</Text>
      </View>

      {/* Navigate CTA */}
      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => onNavigate(shelter)}
        activeOpacity={0.85}
      >
        <Crosshair size={16} color="#FFF" />
        <Text style={styles.ctaText}>START TURN-BY-TURN EVACUATION TO SHELTER</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.status.success,
    zIndex: 25,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  closeBtn: {
    padding: 4,
  },
  capacityCard: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginVertical: spacing.xs,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  capacityLabel: {
    color: colors.text.secondary,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
  },
  capacityVal: {
    color: colors.text.primary,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.background.primary,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  sectionTitle: {
    color: colors.text.secondary,
    fontSize: 9,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginVertical: spacing.xs,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    gap: 4,
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  metaText: {
    color: colors.text.muted,
    fontSize: 11,
  },
  ctaBtn: {
    backgroundColor: colors.primary.main,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    ...shadows.glowBlue,
  },
  ctaText: {
    color: '#FFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
});
