import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useTranslation } from '../../i18n';

interface Props {
  title?: string;
  subtitle?: string;
  actionText?: string;
  severity?: string;
}

export const FloatingAlertCard: React.FC<Props> = ({
  title,
  subtitle,
  actionText,
  severity = 'CRITICAL',
}) => {
  const { t } = useTranslation();

  const displayTitle = title || t('criticalAlertTitle');
  const displaySubtitle = subtitle || t('criticalAlertSubtitle');
  const displayAction = actionText || t('reroutingText');

  // Restrained Live Pulse Indicator for Active Alert (2.6s calm cycle)
  const pulseOpacity = useRef(new Animated.Value(0.4)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseOpacity, {
            toValue: 0.95,
            duration: 1300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1.25,
            duration: 1300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseOpacity, {
            toValue: 0.4,
            duration: 1300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1.0,
            duration: 1300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {/* Restrained Live Pulse Circle behind Alert Icon */}
        <Animated.View
          style={[
            styles.livePulseDot,
            {
              opacity: pulseOpacity,
              transform: [{ scale: pulseScale }],
            },
          ]}
        />
        <AlertTriangle size={20} color="#EF4444" />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.alertTitle} numberOfLines={1}>
            {displayTitle}
          </Text>
          <View style={styles.severityTag}>
            <Animated.View style={[styles.miniLiveDot, { opacity: pulseOpacity }]} />
            <Text style={styles.severityText}>{severity}</Text>
          </View>
        </View>
        <Text style={styles.alertSubtitle} numberOfLines={1}>{displaySubtitle}</Text>
        <Text style={styles.actionText}>{displayAction}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(15, 21, 32, 0.92)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    position: 'relative',
  },
  livePulseDot: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  alertTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
  },
  severityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.4)',
  },
  miniLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EF4444',
  },
  severityText: {
    color: '#F87171',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  alertSubtitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  actionText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 3,
    fontStyle: 'italic',
  },
});
