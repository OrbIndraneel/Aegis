import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Vibration } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { AlertOctagon } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useUserStore } from '../../store/useUserStore';
import { ApiClient } from '../../services/api/client';
import { triggerCriticalHapticPulse } from '../../utils/emergencyAlertSound';

const HOLD_DURATION_MS = 3000;

export const GlobalEmergencyFab: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, triggerSos } = useUserStore();

  const [isPressing, setIsPressing] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(3);
  const pressTimerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  // Animated progress: 0.0 -> 1.0 during 3-second hold
  const holdProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Hide FAB when user is already on SOS dispatch screen
  const isHidden = pathname.includes('/sos');

  useEffect(() => {
    if (isPressing) {
      pulseScale.value = withTiming(1.15, { duration: 300, easing: Easing.ease });
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [isPressing]);

  const handlePressIn = () => {
    setIsPressing(true);
    setSecondsRemaining(3);
    holdProgress.value = withTiming(1, { duration: HOLD_DURATION_MS, easing: Easing.linear });

    // Haptic buzz on initial press
    if (Platform.OS !== 'web') {
      Vibration.vibrate(100);
    }

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((HOLD_DURATION_MS - elapsed) / 1000));
      setSecondsRemaining(remaining);
      if (Platform.OS !== 'web' && remaining > 0) {
        Vibration.vibrate(60);
      }
    }, 950);

    pressTimerRef.current = setTimeout(async () => {
      // 3-SECOND HOLD COMPLETE: DISPATCH SOS!
      clearInterval(intervalRef.current);
      setIsPressing(false);
      triggerCriticalHapticPulse();
      triggerSos();

      // Trigger SOS dispatch via ApiClient with offline queue fallback
      ApiClient.triggerEmergencySos({
        reason: 'Immediate Danger (1-Tap SOS)',
        location: profile.currentLocation || { latitude: 22.3072, longitude: 73.1812 },
        fullName: profile.fullName || 'Citizen User',
        phoneNumber: profile.phoneNumber || '+91 00000 00000',
        bloodGroup: profile.bloodGroup,
        medicalConditions: profile.medicalConditions,
      }).catch(() => {});

      // Navigate to full civilian SOS dashboard
      router.push('/civilian/sos');
    }, HOLD_DURATION_MS);
  };

  const handlePressOut = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPressing(false);
    holdProgress.value = withSpring(0);
    setSecondsRemaining(3);
  };

  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const progressRingStyle = useAnimatedStyle(() => {
    return {
      opacity: holdProgress.value > 0 ? 1 : 0,
      transform: [
        {
          scale: interpolate(holdProgress.value, [0, 1], [1, 1.45]),
        },
      ],
    };
  });

  if (isHidden) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Animated expanding safety boundary ring */}
      <Animated.View style={[styles.haloRing, progressRingStyle]} pointerEvents="none" />

      <Animated.View style={[styles.fabWrapper, fabAnimatedStyle]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            styles.fabButton,
            pressed && styles.fabButtonPressed,
          ]}
          accessibilityLabel="Emergency SOS Beacon. Press and hold 3 seconds to broadcast emergency rescue signal."
          accessibilityRole="button"
        >
          <AlertOctagon size={24} color="#FFFFFF" />
          <Text style={styles.sosText}>
            {isPressing ? `${secondsRemaining}s` : 'SOS'}
          </Text>
        </Pressable>
      </Animated.View>

      {isPressing && (
        <View style={styles.instructionBubble}>
          <Text style={styles.instructionText}>Hold {secondsRemaining}s to Alert NDRF</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 96,
    right: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  haloRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.45)',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  fabWrapper: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#F87171',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabButtonPressed: {
    backgroundColor: '#B91C1C',
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  instructionBubble: {
    position: 'absolute',
    right: 70,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    minWidth: 150,
  },
  instructionText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
