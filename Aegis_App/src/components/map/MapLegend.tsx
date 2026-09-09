import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Info, ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors, radius, spacing, typography, shadows } from '../../theme';

export const MapLegend: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <Info size={14} color={colors.text.secondary} />
        <Text style={styles.headerTitle}>GIS Map Legend</Text>
        {expanded ? <ChevronUp size={14} color={colors.text.secondary} /> : <ChevronDown size={14} color={colors.text.secondary} />}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.legendBody}>
          <View style={styles.itemRow}>
            <View style={[styles.colorSquare, { backgroundColor: 'rgba(220, 38, 38, 0.6)' }]} />
            <Text style={styles.itemText}>Critical Hazard (Flood / Slide)</Text>
          </View>

          <View style={styles.itemRow}>
            <View style={[styles.colorSquare, { backgroundColor: 'rgba(245, 158, 11, 0.6)' }]} />
            <Text style={styles.itemText}>High Risk Warning Zone</Text>
          </View>

          <View style={styles.itemRow}>
            <View style={[styles.lineSample, { backgroundColor: colors.status.success }]} />
            <Text style={styles.itemText}>AI Safest Evacuation Route</Text>
          </View>

          <View style={styles.itemRow}>
            <View style={[styles.lineSample, { backgroundColor: colors.primary.main, borderStyle: 'dashed' }]} />
            <Text style={styles.itemText}>Alternative Detour Path</Text>
          </View>

          <View style={styles.itemRow}>
            <View style={[styles.dotSample, { backgroundColor: colors.severity.CRITICAL.main }]} />
            <Text style={styles.itemText}>Sealed Road Closure</Text>
          </View>

          <View style={styles.itemRow}>
            <View style={[styles.dotSample, { backgroundColor: colors.status.success }]} />
            <Text style={styles.itemText}>Open Relief Camp / Shelter</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
    zIndex: 15,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  legendBody: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  colorSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  lineSample: {
    width: 14,
    height: 3,
    borderRadius: 1,
  },
  dotSample: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemText: {
    color: colors.text.secondary,
    fontSize: 9,
  },
});
