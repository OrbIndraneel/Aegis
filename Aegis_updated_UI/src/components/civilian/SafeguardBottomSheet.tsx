import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, Easing } from 'react-native';
import { CornerUpLeft, Navigation, ShieldAlert } from 'lucide-react-native';
import { useTranslation } from '../../i18n';
import { EvacuationRoute } from '../../types';

interface Props {
  onSosPress?: () => void;
  onNavigationPress?: () => void;
  evacuationRoute?: EvacuationRoute | null;
}

export const SafeguardBottomSheet: React.FC<Props> = ({
  onSosPress,
  onNavigationPress,
  evacuationRoute,
}) => {
  const { t } = useTranslation();

  // 1. SOS Button Idle Breathing Pulse (2.4s calm cycle)
  const sosPulseScale = useRef(new Animated.Value(1)).current;
  const sosPressScale = useRef(new Animated.Value(1)).current;

  // 2. Navigation Pulse Indicator
  const navPulseOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const sosIdleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sosPulseScale, {
          toValue: 1.018,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sosPulseScale, {
          toValue: 1.0,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const navLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(navPulseOpacity, {
          toValue: 1.0,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(navPulseOpacity, {
          toValue: 0.5,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    sosIdleLoop.start();
    navLoop.start();

    return () => {
      sosIdleLoop.stop();
      navLoop.stop();
    };
  }, []);

  const handleSosPressIn = () => {
    Animated.spring(sosPressScale, {
      toValue: 0.96,
      speed: 30,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleSosPressOut = () => {
    Animated.spring(sosPressScale, {
      toValue: 1,
      speed: 24,
      bounciness: 2,
      useNativeDriver: true,
    }).start();
  };

  const routeEtaMins = evacuationRoute?.estimatedTimeMins || 14;
  const routeDistKm = evacuationRoute?.distanceKm || 4.2;

  return (
    <View style={styles.sheetContainer}>
      {/* Top Drag Handle Affordance */}
      <View style={styles.dragHandleContainer}>
        <View style={styles.dragHandle} />
      </View>

      {/* 1. Active Navigation Instruction Card */}
      <TouchableOpacity
        style={styles.navCard}
        onPress={onNavigationPress}
        activeOpacity={0.88}
      >
        <View style={styles.navIconCircle}>
          <CornerUpLeft size={22} color="#FFFFFF" />
        </View>
        <View style={styles.navTextContainer}>
          <View style={styles.navHeaderRow}>
            <Text style={styles.navTitle}>{t('turnLeft')}</Text>
            <View style={styles.etaBadge}>
              <Animated.View style={[styles.liveDot, { opacity: navPulseOpacity }]} />
              <Text style={styles.etaText}>{routeEtaMins}m ({routeDistKm}km)</Text>
            </View>
          </View>
          <Text style={styles.navSubtitle}>
            {evacuationRoute?.shelterName ? `To: ${evacuationRoute.shelterName}` : t('proceedSafeHaven')}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 2. Dominant Emergency SOS Control Button with Idle Breathing & Press Feedback */}
      <Animated.View
        style={{
          transform: [
            { scale: Animated.multiply(sosPulseScale, sosPressScale) },
          ],
        }}
      >
        <TouchableOpacity
          style={styles.sosButton}
          onPress={onSosPress}
          onPressIn={handleSosPressIn}
          onPressOut={handleSosPressOut}
          activeOpacity={0.92}
          accessibilityLabel={t('emergencySosButton')}
        >
          <View style={styles.sosContentRow}>
            <ShieldAlert size={20} color="#FFFFFF" />
            <Text style={styles.sosFullText}>EMERGENCY SOS</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* 3. Offline Local Cache Status Card */}
      <View style={styles.offlineStatusCard}>
        <Animated.View style={[styles.statusDot, { opacity: navPulseOpacity }]} />
        <Text style={styles.offlineStatusText}>
          {t('offlineStatus')}
        </Text>
      </View>
    </View>
  );
};

export const AegisBottomSheet = SafeguardBottomSheet;

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: 'rgba(10, 15, 26, 0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    gap: 14,
  },
  navIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTextContainer: {
    flex: 1,
  },
  navHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  etaText: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '700',
  },
  navSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 3,
  },
  sosButton: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  sosContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sosFullText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  offlineStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  offlineStatusText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    flex: 1,
  },
});
