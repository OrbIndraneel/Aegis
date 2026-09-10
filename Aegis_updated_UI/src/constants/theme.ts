/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#172033',              // Dark Slate
    background: '#F5F7FA',        // Off-white
    backgroundElement: '#FFFFFF', // Cards: White
    backgroundSelected: '#E2E8F0',
    textSecondary: '#4B5E76',     // Slate Blue
    primary: '#0B1F33',           // Deep Navy
    secondary: '#23415F',         // Slate Blue
    accent: '#00B8D4',            // Cyan / Teal
    safe: '#22C55E',              // Green
    warning: '#F59E0B',           // Amber
    danger: '#EF4444',            // Red
    critical: '#B91C1C',          // Dark Red
  },
  dark: {
    text: '#F5F7FA',
    background: '#0B1F33',        // Deep Navy
    backgroundElement: '#14273A',
    backgroundSelected: '#23415F',
    textSecondary: '#94A3B8',
    primary: '#0B1F33',
    secondary: '#23415F',
    accent: '#00B8D4',
    safe: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    critical: '#B91C1C',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
