import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, MapPin, Bell, ChevronRight, CheckCircle2, AlertOctagon } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';
import { LocationService } from '../../src/services/location/locationService';
import { NotificationService } from '../../src/services/notification/notificationService';
import { useUserStore } from '../../src/store/useUserStore';

export default function CivilianOnboardingScreen() {
  const router = useRouter();
  const { profile } = useUserStore();
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  const handleRequestLocation = async () => {
    const granted = await LocationService.requestPermissions();
    setLocationGranted(granted);
  };

  const handleRequestNotifications = async () => {
    const granted = await NotificationService.requestPermissions();
    setNotificationsGranted(granted);
  };

  const handleCompleteOnboarding = () => {
    router.replace('/civilian' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Branding Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBox}>
            <Shield size={36} color={colors.primary.main} />
          </View>
          <Text style={styles.appName}>AEGIS AI</Text>
          <Text style={styles.appTagline}>
            AI-Powered Disaster Management & Safe Evacuation Platform
          </Text>
        </View>

        {/* Core Mission Banner */}
        <View style={styles.missionCard}>
          <AlertOctagon size={20} color={colors.safety.main} />
          <View style={styles.missionTextContainer}>
            <Text style={styles.missionTitle}>SIH 2026 DISASTER PLATFORM</Text>
            <Text style={styles.missionDesc}>
              Designed to guide evacuees away from active flash floods, landslides, and cyclones with real-time AI safe routing.
            </Text>
          </View>
        </View>

        {/* Permissions Setup */}
        <Text style={styles.sectionTitle}>REQUIRED EMERGENCY PERMISSIONS</Text>

        {/* Location Permission Card */}
        <View style={styles.permissionCard}>
          <View style={styles.permHeader}>
            <View style={[styles.permIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <MapPin size={20} color={colors.primary.main} />
            </View>
            <View style={styles.permTextContainer}>
              <Text style={styles.permTitle}>Precise GPS Location</Text>
              <Text style={styles.permDesc}>
                Required to compute dynamic safest evacuation paths away from high-risk flood polygons.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.permButton, locationGranted && styles.permButtonGranted]}
            onPress={handleRequestLocation}
            disabled={locationGranted}
            activeOpacity={0.8}
          >
            {locationGranted ? (
              <>
                <CheckCircle2 size={16} color="#FFF" />
                <Text style={styles.permButtonText}>GPS Access Granted</Text>
              </>
            ) : (
              <Text style={styles.permButtonText}>Grant Location Access</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Notifications Permission Card */}
        <View style={styles.permissionCard}>
          <View style={styles.permHeader}>
            <View style={[styles.permIcon, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
              <Bell size={20} color={colors.safety.main} />
            </View>
            <View style={styles.permTextContainer}>
              <Text style={styles.permTitle}>Flash Alert Broadcasts</Text>
              <Text style={styles.permDesc}>
                Receive life-saving flash evacuation alerts issued by GSDMA, Collectorate & IMD.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.permButton, notificationsGranted && styles.permButtonGranted]}
            onPress={handleRequestNotifications}
            disabled={notificationsGranted}
            activeOpacity={0.8}
          >
            {notificationsGranted ? (
              <>
                <CheckCircle2 size={16} color="#FFF" />
                <Text style={styles.permButtonText}>Alert Notifications Enabled</Text>
              </>
            ) : (
              <Text style={styles.permButtonText}>Enable Emergency Notifications</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Continue Action */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleCompleteOnboarding}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>ENTER CIVILIAN APP</Text>
          <ChevronRight size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  brandHeader: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.strong,
    marginBottom: spacing.sm,
    ...shadows.glowBlue,
  },
  appName: {
    color: colors.text.primary,
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 1.5,
  },
  appTagline: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginTop: 4,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.strong,
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  missionTextContainer: {
    flex: 1,
  },
  missionTitle: {
    color: colors.safety.main,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  missionDesc: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
    lineHeight: 18,
  },
  sectionTitle: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
    marginVertical: spacing.xs,
  },
  permissionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.md,
  },
  permHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  permIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permTextContainer: {
    flex: 1,
  },
  permTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  permDesc: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  permButton: {
    backgroundColor: colors.primary.main,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  permButtonGranted: {
    backgroundColor: colors.status.success,
  },
  permButtonText: {
    color: '#FFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  continueButton: {
    backgroundColor: colors.primary.main,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    ...shadows.glowBlue,
  },
  continueText: {
    color: '#FFF',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 1,
  },
});
