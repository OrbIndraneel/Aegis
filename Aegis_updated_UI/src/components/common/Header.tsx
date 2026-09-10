import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ChevronLeft, LogOut } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  showLogout?: boolean;
  onLogoutPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'AEGIS',
  subtitle,
  showBack,
  onBackPress,
  rightAction,
  showLogout = true,
  onLogoutPress,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useUserStore();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const handleLogout = () => {
    if (onLogoutPress) {
      onLogoutPress();
    } else {
      logout();
      router.replace('/');
    }
  };

  const shouldShowBack = showBack ?? (onBackPress !== undefined);

  return (
    <View
      style={[
        styles.safeWrapper,
        { paddingTop: Math.max(insets.top + 4, 12) },
      ]}
      pointerEvents="box-none"
    >
      {/* Floating Black Liquid Glass Header Bar */}
      <View style={[styles.liquidGlassContainer, subtitle ? styles.containerWithSubtitle : null]}>
        {/* Subtle Top Reflection Sheen Line */}
        <View style={styles.glassReflectionLine} />

        <View style={styles.headerContent}>
          {/* Left Action: Functional Back Control if needed */}
          <View style={styles.sideSlot}>
            {shouldShowBack ? (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={handleBack}
                activeOpacity={0.75}
                accessibilityLabel="Go back"
              >
                <ChevronLeft size={18} color="#F8FAFC" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Centered Page Title & Subtitle */}
          <View style={styles.titleSlot}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {/* Right Slot: Custom Action or Fast Log Out Button */}
          <View style={[styles.sideSlot, styles.rightSlot]}>
            {rightAction ? (
              rightAction
            ) : showLogout ? (
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.75}
                accessibilityLabel="Log out / switch portal"
                accessibilityRole="button"
              >
                <LogOut size={13} color="#F87171" />
                <Text style={styles.logoutBtnText}>Log Out</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeWrapper: {
    paddingHorizontal: 14,
    paddingBottom: 6,
    zIndex: 50,
  },
  liquidGlassContainer: {
    height: 48,
    backgroundColor: 'rgba(10, 15, 26, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderTopColor: 'rgba(255, 255, 255, 0.28)',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  containerWithSubtitle: {
    height: 52,
  },
  glassReflectionLine: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  sideSlot: {
    minWidth: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSlot: {
    minWidth: 70,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.32)',
  },
  logoutBtnText: {
    color: '#FECACA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 1,
    textAlign: 'center',
  },
});
