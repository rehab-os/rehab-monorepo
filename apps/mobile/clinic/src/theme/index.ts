export * from './colors';
export * from './typography';
export * from './spacing';

import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary[500],
    primaryContainer: colors.primary[100],
    secondary: colors.secondary[500],
    secondaryContainer: colors.secondary[100],
    background: colors.background.default,
    surface: colors.background.paper,
    error: colors.error,
    onPrimary: '#FFFFFF',
    onPrimaryContainer: colors.primary[900],
    onSecondary: '#FFFFFF',
    onSecondaryContainer: colors.secondary[900],
    onBackground: colors.text.primary,
    onSurface: colors.text.primary,
    onError: '#FFFFFF',
    outline: colors.neutral[300],
    elevation: {
      level0: 'transparent',
      level1: colors.background.paper,
      level2: colors.background.paper,
      level3: colors.background.paper,
      level4: colors.background.paper,
      level5: colors.background.paper,
    },
  },
};
