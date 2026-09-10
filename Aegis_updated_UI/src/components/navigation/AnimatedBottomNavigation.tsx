import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, LayoutChangeEvent } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Map, Bell, Footprints, AlertOctagon, FileText } from 'lucide-react-native';
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
  labelKey: 'tabMap' | 'tabAlerts' | 'tabRoute' | 'tabReport' | 'tabSos' | 'tabProfile';
  icon: React.ComponentType<{ size: number; color: string }>;
  route: string;
}

const TABS: TabItem[] = [
  { id: 'map', labelKey: 'tabMap', icon: Map, route: '/civilian' },
  { id: 'alerts', labelKey: 'tabAlerts', icon: Bell, route: '/civilian/alerts' },
  { id: 'route', labelKey: 'tabRoute', icon: Footprints, route: '/civilian/evacuation' },
  { id: 'report', labelKey: 'tabReport', icon: FileText, route: '/civilian/report' },
  { id: 'sos', labelKey: 'tabSos', icon: AlertOctagon, route: '/civilian/sos' },
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
    if (pathname === '/civilian/report') return 3;
    if (pathname === '/civilian/sos' || pathname === '/modal/sos') return 4;
    return 0;
  }, [pathname]);

  // Shared Values for Animated Active Pill Highlight & Tactile Press
  const containerWidth = useSharedValue(0);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

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
            <TabButtonWithFeedback
              key={item.id}
              item={item}
              isActive={isActive}
              onPress={() => router.push(item.route as any)}
              t={t}
            />
          );
        })}
      </View>
    </View>
  );
};

interface TabButtonProps {
  item: TabItem;
  isActive: boolean;
  onPress: () => void;
  t: (key: any) => string;
}

const TabButtonWithFeedback: React.FC<TabButtonProps> = ({ item, isActive, onPress, t }) => {
  const Icon = item.icon;
  const pressScale = useSharedValue(1);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      iconScale.value = withSpring(1.15, { damping: 12, stiffness: 200 }, () => {
        iconScale.value = withSpring(1.05, { damping: 14, stiffness: 150 });
      });
    } else {
      iconScale.value = withTiming(1, { duration: 150, easing: Easing.ease });
    }
  }, [isActive]);

  const rButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const rIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <Pressable
      style={styles.tabButton}
      onPress={onPress}
      onPressIn={() => {
        pressScale.value = withSpring(0.93, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${t(item.labelKey)} tab${isActive ? ', selected' : ''}`}
    >
      <Animated.View style={[styles.tabContent, rButtonStyle]}>
        <Animated.View style={rIconStyle}>
          <Icon
            size={20}
            color={isActive ? '#FFFFFF' : '#64748B'}
          />
        </Animated.View>
        <Text
          style={[
            styles.tabLabel,
            isActive && styles.activeTabLabel,
          ]}
          numberOfLines={1}
        >
          {t(item.labelKey)}
        </Text>
      </Animated.View>
    </Pressable>
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
    backgroundColor: 'rgba(10, 15, 26, 0.94)',
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
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
