import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CornerUpLeft } from 'lucide-react-native';
import { useTranslation } from '../../i18n';

interface Props {
  onSosPress?: () => void;
  onNavigationPress?: () => void;
}

export const SafeguardBottomSheet: React.FC<Props> = ({
  onSosPress,
  onNavigationPress,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.sheetContainer}>
      {/* Top Drag Handle */}
      <View style={styles.dragHandleContainer}>
        <View style={styles.dragHandle} />
      </View>

      {/* 1. Navigation Instruction Card */}
      <TouchableOpacity
        style={styles.navCard}
        onPress={onNavigationPress}
        activeOpacity={0.85}
      >
        <View style={styles.navIconCircle}>
          <CornerUpLeft size={22} color="#FFFFFF" />
        </View>
        <View style={styles.navTextContainer}>
          <Text style={styles.navTitle}>{t('turnLeft')}</Text>
          <Text style={styles.navSubtitle}>{t('proceedSafeHaven')}</Text>
        </View>
      </TouchableOpacity>

      {/* 2. Dominant Emergency SOS Button */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={onSosPress}
        activeOpacity={0.85}
        accessibilityLabel={t('emergencySosButton')}
      >
        <View style={styles.sosContentRow}>
          <Text style={styles.sosFullText}>EMERGENCY</Text>
        </View>
      </TouchableOpacity>

      {/* 3. Offline Local Cache Status Card */}
      <View style={styles.offlineStatusCard}>
        <View style={styles.statusDot} />
        <Text style={styles.offlineStatusText}>
          {t('offlineStatus')}
        </Text>
      </View>
    </View>
  );
};

export const SurakshaBottomSheet = SafeguardBottomSheet;

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: 'rgba(13, 20, 32, 0.94)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 16,
  },
  navIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#243044',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTextContainer: {
    flex: 1,
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  navSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  sosButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  sosContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sosBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  sosFullText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  offlineStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  offlineStatusText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
