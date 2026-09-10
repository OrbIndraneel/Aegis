import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  AlertTriangle,
  Waves,
  CloudRain,
  Mountain,
  Users,
  OctagonAlert,
  ShieldAlert,
  Clock,
} from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { RiskFactor } from '../../utils/riskExplanation';

interface Props {
  factors: RiskFactor[];
  theme?: 'dark' | 'light';
}

export const RiskExplanationAccordion: React.FC<Props> = ({ factors, theme = 'dark' }) => {
  const [expanded, setExpanded] = useState(false);

  if (!factors || factors.length === 0) return null;

  const isDark = theme === 'dark';

  const renderIcon = (iconName: string) => {
    const iconColor = isDark ? colors.severity.CRITICAL.main : '#DC2626';
    const size = 14;

    switch (iconName) {
      case 'MapPin': return <MapPin size={size} color={iconColor} />;
      case 'AlertTriangle': return <AlertTriangle size={size} color={iconColor} />;
      case 'Waves': return <Waves size={size} color={isDark ? '#60A5FA' : '#2563EB'} />;
      case 'CloudRain': return <CloudRain size={size} color={isDark ? '#38BDF8' : '#0284C7'} />;
      case 'Mountain': return <Mountain size={size} color={isDark ? '#FB923C' : '#EA580C'} />;
      case 'Users': return <Users size={size} color={iconColor} />;
      case 'OctagonAlert': return <OctagonAlert size={size} color={iconColor} />;
      case 'Clock': return <Clock size={size} color={isDark ? '#94A3B8' : '#64748B'} />;
      default: return <ShieldAlert size={size} color={iconColor} />;
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <TouchableOpacity
        style={styles.headerToggle}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <HelpCircle size={14} color={isDark ? colors.primary.light : colors.primary.main} />
          <Text style={[styles.headerTitle, isDark ? styles.titleDark : styles.titleLight]}>
            WHY IS THIS AREA AT RISK?
          </Text>
          <View style={[styles.countBadge, isDark ? styles.badgeDark : styles.badgeLight]}>
            <Text style={styles.countText}>{factors.length} Signals</Text>
          </View>
        </View>
        {expanded ? (
          <ChevronUp size={16} color={isDark ? colors.text.secondary : '#71717A'} />
        ) : (
          <ChevronDown size={16} color={isDark ? colors.text.secondary : '#71717A'} />
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.bodyContent}>
          {factors.map((factor) => (
            <View key={factor.id} style={[styles.factorRow, isDark ? styles.factorDark : styles.factorLight]}>
              <View style={styles.iconBox}>{renderIcon(factor.iconName)}</View>
              <View style={styles.factorTextContainer}>
                <View style={styles.factorHeaderRow}>
                  <Text style={[styles.factorLabel, isDark ? styles.labelDark : styles.labelLight]}>
                    {factor.label}
                  </Text>
                  {factor.valueBadge ? (
                    <View style={styles.valPill}>
                      <Text style={styles.valPillText}>{factor.valueBadge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.factorDetail, isDark ? styles.detailDark : styles.detailLight]}>
                  {factor.detail}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    marginTop: spacing.xs,
    overflow: 'hidden',
    borderWidth: 1,
  },
  containerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  containerLight: {
    backgroundColor: '#F8FAFC',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  titleDark: {
    color: '#E2E8F0',
  },
  titleLight: {
    color: colors.primary.main,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  badgeDark: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  badgeLight: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  countText: {
    color: '#3B82F6',
    fontSize: 9,
    fontWeight: typography.fontWeight.heavy,
  },
  bodyContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.xs,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  factorDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  factorLight: {
    backgroundColor: '#FFFFFF',
  },
  iconBox: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  factorTextContainer: {
    flex: 1,
  },
  factorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 2,
  },
  factorLabel: {
    fontSize: 11.5,
    fontWeight: typography.fontWeight.bold,
  },
  valPill: {
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  valPillText: {
    color: '#C2410C',
    fontSize: 9,
    fontWeight: '700',
  },
  labelDark: {
    color: '#F1F5F9',
  },
  labelLight: {
    color: '#0F172A',
  },
  factorDetail: {
    fontSize: 10.5,
    lineHeight: 14,
  },
  detailDark: {
    color: '#94A3B8',
  },
  detailLight: {
    color: '#64748B',
  },
});
