import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useTranslation } from '../../i18n';

interface Props {
  title?: string;
  subtitle?: string;
  actionText?: string;
}

export const FloatingAlertCard: React.FC<Props> = ({
  title,
  subtitle,
  actionText,
}) => {
  const { t } = useTranslation();

  const displayTitle = title || t('criticalAlertTitle');
  const displaySubtitle = subtitle || t('criticalAlertSubtitle');
  const displayAction = actionText || t('reroutingText');

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AlertTriangle size={24} color="#EF4444" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.alertTitle}>
          {displayTitle}
        </Text>
        <Text style={styles.alertSubtitle}>{displaySubtitle}</Text>
        <Text style={styles.actionText}>{displayAction}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(15, 21, 32, 0.88)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  alertTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 19,
  },
  alertSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 19,
  },
  actionText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
