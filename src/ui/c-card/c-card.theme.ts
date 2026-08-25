import { defineThemes } from '../theme/theme.models';

export const { useTheme } = defineThemes({
  dark: {
    backgroundColor: '#222e3c',
    borderColor: '#2c3a4a',
    shadow: '0 6px 22px rgba(8, 14, 24, 0.45)',
  },
  light: {
    backgroundColor: '#ffffff',
    borderColor: '#e6ece9',
    shadow: '0 6px 22px rgba(26, 35, 50, 0.08)',
  },
});
