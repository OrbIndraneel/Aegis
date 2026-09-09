import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, MapPin, Phone, Crosshair, CheckCircle2, XCircle } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { Shelter } from '../../types/disaster';

interface Props {
  shelter: Shelter;
  onNavigate?: (shelter: Shelter) => void;
}

export const ShelterCard: React.FC<Props> = ({ shelter, onNavigate }) => {
  const occupancyPercent = Math.min(
    100,
    Math.round((shelter.currentOccupancy / shelter.totalCapacity) * 100)
  );

  const getCapacityColor = () => {
    if (occupancyPercent >= 90) return colors.severity.CRITICAL.main;
    if (occupancyPercent >= 70) return colors.severity.MODERATE.main;
    return colors.status.success;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Home size={18} color={colors.status.success} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {shelter.name}
            </Text>
            <View style={styles.addressRow}>
              <MapPin size={12} color={colors.text.secondary} />
              <Text style={styles.address} numberOfLines={1}>
                {shelter.distanceKm} km away • {shelter.address}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor:
                shelter.status === 'OPEN'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: shelter.status === 'OPEN' ? colors.status.success : colors.status.error },
            ]}
          >
            {shelter.status}
          </Text>
        </View>
      </View>

      {/* Occupancy Progress Bar */}
      <View style={styles.capacitySection}>
        <View style={styles.capacityHeader}>
          <Text style={styles.capacityLabel}>LIVE CAPACITY OCCUPANCY</Text>
          <Text style={styles.capacityStats}>
            {shelter.currentOccupancy} / {shelter.totalCapacity} ({occupancyPercent}%)
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${occupancyPercent}%`, backgroundColor: getCapacityColor() },
            ]}
          />
        </View>
      </View>

      {/* Amenities Icons */}
      <View style={styles.amenitiesRow}>
        <View style={styles.amenityChip}>
          {shelter.amenities.medicalKit ? <CheckCircle2 size={12} color={colors.status.success} /> : <XCircle size={12} color={colors.text.muted} />}
          <Text style={styles.amenityText}>Medical</Text>
        </View>
        <View style={styles.amenityChip}>
          {shelter.amenities.foodSupplies ? <CheckCircle2 size={12} color={colors.status.success} /> : <XCircle size={12} color={colors.text.muted} />}
          <Text style={styles.amenityText}>Food</Text>
        </View>
        <View style={styles.amenityChip}>
          {shelter.amenities.cleanWater ? <CheckCircle2 size={12} color={colors.status.success} /> : <XCircle size={12} color={colors.text.muted} />}
          <Text style={styles.amenityText}>Clean Water</Text>
        </View>
        <View style={styles.amenityChip}>
          {shelter.amenities.powerGenerator ? <CheckCircle2 size={12} color={colors.status.success} /> : <XCircle size={12} color={colors.text.muted} />}
          <Text style={styles.amenityText}>Power Gen</Text>
        </View>
      </View>

      {/* Action Footer */}
      {onNavigate && shelter.status === 'OPEN' && (
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => onNavigate(shelter)}
          activeOpacity={0.8}
        >
          <Crosshair size={14} color="#FFF" />
          <Text style={styles.navButtonText}>Route to Shelter</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  address: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
  },
  statusPill: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  capacitySection: {
    marginVertical: spacing.xs,
  },
  capacityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  capacityLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
  },
  capacityStats: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  amenitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.sm,
    flexWrap: 'wrap',
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    gap: 4,
  },
  amenityText: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  navButton: {
    backgroundColor: colors.primary.main,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  navButtonText: {
    color: '#FFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
