import { DefaultTheme } from 'react-native-paper';
import colors from './colors';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    placeholder: '#888888',
    disabled: '#CCCCCC',
  },
};