export const colors = {
  // Direct Official Palette Specification
  primaryNavy: '#0B1F33',     // Primary: Deep Navy
  secondarySlate: '#23415F',  // Secondary: Slate Blue
  accentTeal: '#00B8D4',      // Accent: Cyan / Teal
  bgOffWhite: '#F5F7FA',      // Background: Off-white
  cardWhite: '#FFFFFF',       // Cards: White
  safeGreen: '#22C55E',       // Safe: Green
  warningAmber: '#F59E0B',    // Warning: Amber
  dangerRed: '#EF4444',       // Danger: Red
  criticalDarkRed: '#B91C1C', // Critical: Dark Red
  textDarkSlate: '#172033',   // Text: Dark Slate

  // Top-level semantic aliases
  cards: '#FFFFFF',
  card: '#FFFFFF',
  safe: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  critical: '#B91C1C',

  // Backgrounds - Off-white canvas & pure white cards
  background: {
    primary: '#F5F7FA',     // Off-white canvas (#F5F7FA)
    secondary: '#FFFFFF',   // White Card background (#FFFFFF)
    tertiary: '#EEF2F6',    // Subtle elevated card inset
    darkBanner: '#0B1F33',  // Deep Navy contrast banner (#0B1F33)
    overlay: 'rgba(11, 31, 51, 0.45)',
  },

  // Borders & Dividers - Clean slate borders
  border: {
    subtle: 'rgba(23, 32, 51, 0.06)',
    default: 'rgba(23, 32, 51, 0.10)',
    strong: 'rgba(23, 32, 51, 0.18)',
    dark: '#23415F',        // Slate Blue (#23415F)
    active: '#0B1F33',      // Deep Navy (#0B1F33)
  },

  // Primary & Secondary Brand Tokens
  primary: {
    main: '#0B1F33',        // Deep Navy (#0B1F33)
    light: '#23415F',       // Slate Blue (#23415F)
    dark: '#05111D',
    contrastText: '#FFFFFF',
    accent: '#00B8D4',      // Cyan / Teal (#00B8D4)
  },

  // Secondary Color
  secondary: {
    main: '#23415F',        // Slate Blue (#23415F)
    light: '#365D85',
    dark: '#14273A',
    contrastText: '#FFFFFF',
  },

  // Accent Color
  accent: {
    main: '#00B8D4',        // Cyan / Teal (#00B8D4)
    light: '#33C6DC',
    dark: '#008BA3',
    contrastText: '#FFFFFF',
  },

  safety: {
    main: '#22C55E',        // Safe Green (#22C55E)
    light: '#4ADE80',
    dark: '#16A34A',
  },

  // Early Warning Levels (NOTICE, WATCH, WARNING)
  warningLevel: {
    NOTICE: {
      main: '#F59E0B',      // Warning Amber (#F59E0B)
      background: 'rgba(245, 158, 11, 0.10)',
      border: 'rgba(245, 158, 11, 0.28)',
      text: '#D97706',
      badge: '#FEF3C7',
    },
    WATCH: {
      main: '#EF4444',      // Danger Red (#EF4444)
      background: 'rgba(239, 68, 68, 0.10)',
      border: 'rgba(239, 68, 68, 0.30)',
      text: '#DC2626',
      badge: '#FEE2E2',
    },
    WARNING: {
      main: '#B91C1C',      // Critical Dark Red (#B91C1C)
      background: 'rgba(185, 28, 28, 0.12)',
      border: 'rgba(185, 28, 28, 0.35)',
      text: '#991B1B',
      badge: '#FEE2E2',
    },
  },

  // Disaster Severity Levels (Safe, Warning, Danger, Critical)
  severity: {
    LOW: {
      main: '#22C55E',      // Safe Green (#22C55E)
      background: 'rgba(34, 197, 94, 0.10)',
      border: 'rgba(34, 197, 94, 0.25)',
      text: '#16A34A',
    },
    MODERATE: {
      main: '#F59E0B',      // Warning Amber (#F59E0B)
      background: 'rgba(245, 158, 11, 0.10)',
      border: 'rgba(245, 158, 11, 0.25)',
      text: '#D97706',
    },
    HIGH: {
      main: '#EF4444',      // Danger Red (#EF4444)
      background: 'rgba(239, 68, 68, 0.10)',
      border: 'rgba(239, 68, 68, 0.25)',
      text: '#DC2626',
    },
    CRITICAL: {
      main: '#B91C1C',      // Critical Dark Red (#B91C1C)
      background: 'rgba(185, 28, 28, 0.12)',
      border: 'rgba(185, 28, 28, 0.30)',
      text: '#991B1B',
      pulse: '#EF4444',
    },
  },

  // Text hierarchy
  text: {
    primary: '#172033',     // Dark Slate (#172033)
    secondary: '#4B5E76',   // Harmonious Slate Blue secondary
    muted: '#8494A7',       // Muted slate subtext
    inverse: '#FFFFFF',     // White text on dark navy cards
    highlight: '#00B8D4',   // Cyan / Teal accent (#00B8D4)
  },

  // Status & Utility
  status: {
    success: '#22C55E',     // Green (#22C55E)
    warning: '#F59E0B',     // Amber (#F59E0B)
    error: '#EF4444',       // Red (#EF4444)
    critical: '#B91C1C',    // Dark Red (#B91C1C)
    info: '#00B8D4',        // Cyan / Teal (#00B8D4)
    offline: '#64748B',     // Slate
  },

  // Map GIS specific colors
  map: {
    routeSafe: '#22C55E',       // Safe Green
    routeCaution: '#F59E0B',    // Amber Warning
    routeClosed: '#EF4444',     // Red Danger
    floodPolygon: 'rgba(0, 184, 212, 0.25)',
    landslidePolygon: 'rgba(245, 158, 11, 0.35)',
    slopeInstability: 'rgba(185, 28, 28, 0.45)',
    contourLine: 'rgba(255, 255, 255, 0.15)',
    shelterMarker: '#22C55E',
    userMarker: '#00B8D4',
    villageMarker: '#F59E0B',
    blockedRoadMarker: '#B91C1C',
  }
};
