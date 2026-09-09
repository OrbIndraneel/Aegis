export const colors = {
  // Backgrounds - Soft light off-white aesthetic matching reference
  background: {
    primary: '#F4F4F7',     // Soft light/off-white canvas
    secondary: '#FFFFFF',   // Pristine white card background
    tertiary: '#FAFAFC',    // Subtle elevated card inset
    darkBanner: '#18181B',  // Sleek dark contrast banner (e.g. Current Safety Status)
    overlay: 'rgba(24, 24, 27, 0.4)',
  },

  // Borders & Dividers - Subtle light borders
  border: {
    subtle: 'rgba(0, 0, 0, 0.05)',
    default: 'rgba(0, 0, 0, 0.08)',
    strong: 'rgba(0, 0, 0, 0.12)',
    dark: '#27272A',
    active: '#18181B',
  },

  // Primary Accent & Emergency Colors
  primary: {
    main: '#18181B',        // Premium Obsidian Black Primary
    light: '#3F3F46',
    dark: '#09090B',
    contrastText: '#FFFFFF',
    accent: '#3B82F6',      // Command Blue accent
  },

  safety: {
    main: '#F97316',        // Safety Orange
    light: '#FB923C',
    dark: '#C2410C',
  },

  // Disaster Severity Levels (Restrained, subtle light tint backgrounds)
  severity: {
    LOW: {
      main: '#10B981',      // Emerald Green
      background: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.25)',
      text: '#047857',
    },
    MODERATE: {
      main: '#F59E0B',      // Amber
      background: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.25)',
      text: '#B45309',
    },
    HIGH: {
      main: '#EF4444',      // Bright Red
      background: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.25)',
      text: '#B91C1C',
    },
    CRITICAL: {
      main: '#DC2626',      // Deep Crimson
      background: 'rgba(220, 38, 38, 0.12)',
      border: 'rgba(220, 38, 38, 0.3)',
      text: '#991B1B',
      pulse: '#EF4444',
    },
  },

  // Text hierarchy - High contrast dark typography on light background
  text: {
    primary: '#18181B',     // Deep obsidian black title text
    secondary: '#71717A',   // Clean medium gray
    muted: '#A1A1AA',       // Muted subtext
    inverse: '#FFFFFF',     // White text on dark cards
    highlight: '#2563EB',   // Accent link blue
  },

  // Status & Utility
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    offline: '#71717A',
  },

  // Map GIS specific colors
  map: {
    routeSafe: '#10B981',       // Green Polyline
    routeCaution: '#F59E0B',    // Amber Polyline
    routeClosed: '#EF4444',     // Red Dotted Line
    floodPolygon: 'rgba(239, 68, 68, 0.25)',
    landslidePolygon: 'rgba(245, 158, 11, 0.25)',
    cyclonePolygon: 'rgba(139, 92, 246, 0.25)',
    shelterMarker: '#10B981',
    userMarker: '#3B82F6',
  }
};
