import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Shield, ChevronLeft, LogOut, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  showLogout?: boolean;
  onLogoutPress?: () => void;
  onProfilePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'AEGIS AI',
  subtitle,
  showBack,
  onBackPress,
  rightAction,
  showLogout = false,
  onLogoutPress,
  onProfilePress,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
      <View style={[styles.container, subtitle ? styles.containerWithSubtitle : null]}>
        <View style={styles.headerContent}>
          {/* Left Slot: Back Button or Shield Badge */}
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
            ) : (
              <View style={styles.logoBadge}>
                <Shield size={16} color="#FFFFFF" />
              </View>
            )}
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

          {/* Right Slot: Custom Action, Logout, or Profile Button */}
          <View style={[styles.sideSlot, styles.rightSlot]}>
            {rightAction ? (
              rightAction
            ) : showLogout ? (
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.75}
                accessibilityLabel="Log out"
              >
                <LogOut size={13} color="#F87171" />
                <Text style={styles.logoutBtnText}>Log Out</Text>
              </TouchableOpacity>
            ) : onProfilePress ? (
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={onProfilePress}
                activeOpacity={0.75}
                accessibilityLabel="User profile"
              >
                <User size={16} color="#CBD5E1" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 28 }} />
            )}
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
    backgroundColor: '#05080E',
  },
  container: {
    height: 48,
    backgroundColor: 'rgba(10, 15, 26, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    position: 'relative',
    overflow: 'hidden',
  },
  containerWithSubtitle: {
    height: 54,
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
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
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
  profileBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
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
  },
  titleSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '500',
    marginTop: 1,
    textAlign: 'center',
  },
});
