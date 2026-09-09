import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, LayoutChangeEvent } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Map, Bell, Footprints, AlertOctagon, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTranslation } from '../../i18n';

export interface TabItem {
  id: string;
  labelKey: 'tabMap' | 'tabAlerts' | 'tabRoute' | 'tabSos' | 'tabProfile';
  icon: React.ComponentType<{ size: number; color: string }>;
  route: string;
}

const TABS: TabItem[] = [
  { id: 'map', labelKey: 'tabMap', icon: Map, route: '/civilian' },
  { id: 'alerts', labelKey: 'tabAlerts', icon: Bell, route: '/civilian/alerts' },
  { id: 'route', labelKey: 'tabRoute', icon: Footprints, route: '/civilian/evacuation' },
  { id: 'sos', labelKey: 'tabSos', icon: AlertOctagon, route: '/civilian/sos' },
  { id: 'profile', labelKey: 'tabProfile', icon: User, route: '/civilian/profile' },
];

export const AnimatedBottomNavigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const activeIndex = React.useMemo(() => {
    if (pathname === '/civilian' || pathname === '/civilian/' || pathname === '/civilian/index') return 0;
    if (pathname === '/civilian/alerts') return 1;
    if (pathname === '/civilian/evacuation' || pathname === '/civilian/route') return 2;
    if (pathname === '/civilian/sos' || pathname === '/modal/sos') return 3;
    if (pathname === '/civilian/profile') return 4;
    return 0;
  }, [pathname]);

  // Layout tracking for animated indicator positioning
  const containerWidth = useSharedValue(0);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const tabWidth = containerWidth.value > 0 ? containerWidth.value / TABS.length : 0;

  useEffect(() => {
    if (containerWidth.value > 0) {
      const targetWidth = containerWidth.value / TABS.length;
      const targetX = activeIndex * targetWidth;

      indicatorX.value = withSpring(targetX, {
        damping: 18,
        stiffness: 180,
        mass: 0.8,
      });

      indicatorWidth.value = withSpring(targetWidth, {
        damping: 18,
        stiffness: 180,
      });
    }
  }, [activeIndex, containerWidth.value]);

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    containerWidth.value = width;

    const initialTabWidth = width / TABS.length;
    indicatorWidth.value = initialTabWidth;
    indicatorX.value = activeIndex * initialTabWidth;
  };

  const rIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorX.value }],
      width: indicatorWidth.value,
    };
  });

  return (
    <View
      style={[
        styles.outerWrapper,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={styles.navContainer}
        onLayout={handleContainerLayout}
        accessibilityRole="tablist"
      >
        {/* Animated Active Tab Glass Pill Highlight */}
        <Animated.View style={[styles.activeIndicator, rIndicatorStyle]} />

        {/* Tab Buttons */}
        {TABS.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === activeIndex;

          return (
            <Pressable
              key={item.id}
              style={styles.tabButton}
              onPress={() => router.push(item.route as any)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${t(item.labelKey)} tab${isActive ? ', selected' : ''}`}
              accessibilityHint={`Navigates to the ${t(item.labelKey)} screen`}
            >
              <TabIconWithAnimation isActive={isActive} Icon={Icon} />
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.activeTabLabel,
                ]}
                numberOfLines={1}
              >
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

interface TabIconProps {
  isActive: boolean;
  Icon: React.ComponentType<{ size: number; color: string }>;
}

const TabIconWithAnimation: React.FC<TabIconProps> = ({ isActive, Icon }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1.15, { damping: 12, stiffness: 200 }, () => {
        scale.value = withSpring(1.05, { damping: 14, stiffness: 150 });
      });
    } else {
      scale.value = withTiming(1, { duration: 150, easing: Easing.ease });
    }
  }, [isActive]);

  const rIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={rIconStyle}>
      <Icon
        size={20}
        color={isActive ? '#FFFFFF' : '#64748B'}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 440,
    height: 60,
    backgroundColor: 'rgba(10, 15, 26, 0.92)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  activeIndicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    gap: 3,
  },
  tabLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
