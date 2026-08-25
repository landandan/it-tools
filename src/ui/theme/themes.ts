import { defineThemes } from './theme.models';

export const { themes: appThemes, useTheme: useAppTheme } = defineThemes({
  light: {
    background: '#f1faee',
    text: {
      baseColor: '#1a2332',
      mutedColor: '#5b6b6b',
    },
    default: {
      color: 'rgba(26, 35, 50, 0.05)',
      colorHover: 'rgba(26, 35, 50, 0.09)',
      colorPressed: 'rgba(26, 35, 50, 0.22)',
    },
    primary: {
      color: '#2d8b8b',
      colorHover: '#34a0a0',
      colorPressed: '#236e6e',
      colorFaded: '#2d8b8b2f',
    },
    warning: {
      color: '#e0a93b',
      colorHover: '#e8b659',
      colorPressed: '#c98f25',
      colorFaded: '#e0a93b2f',
    },
    success: {
      color: '#2f9e7a',
      colorHover: '#3bb08a',
      colorPressed: '#227a5e',
      colorFaded: '#2f9e7a2f',
    },
    error: {
      color: '#e5544f',
      colorHover: '#ec6f6a',
      colorPressed: '#c63f3a',
      colorFaded: '#e5544f2a',
    },
  },
  dark: {
    background: '#161e29',
    text: {
      baseColor: '#e8f3f1',
      mutedColor: '#9fb4b1',
    },
    default: {
      color: 'rgba(255, 255, 255, 0.08)',
      colorHover: 'rgba(255, 255, 255, 0.12)',
      colorPressed: 'rgba(255, 255, 255, 0.24)',
    },
    primary: {
      color: '#35a3a3',
      colorHover: '#46b6b6',
      colorPressed: '#297e7e',
      colorFaded: '#35a3a32f',
    },
    warning: {
      color: '#eab64e',
      colorHover: '#f0c468',
      colorPressed: '#cf9636',
      colorFaded: '#eab64e2f',
    },
    success: {
      color: '#3fb38c',
      colorHover: '#54c39d',
      colorPressed: '#2f8c6c',
      colorFaded: '#3fb38c2f',
    },
    error: {
      color: '#ec6f6a',
      colorHover: '#f08783',
      colorPressed: '#d4544f',
      colorFaded: '#ec6f6a2a',
    },
  },
});
