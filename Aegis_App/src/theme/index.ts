import { colors } from './colors';
import { typography } from './typography';
import { spacing, radius, shadows, iconSizes } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
};

export type Theme = typeof theme;
export { colors, typography, spacing, radius, shadows, iconSizes };
