import type { GlobalThemeOverrides } from 'naive-ui';

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#2d8b8bFF',
    primaryColorHover: '#34a0a0FF',
    primaryColorPressed: '#236e6eFF',
    primaryColorSuppl: '#34a0a0FF',
    borderRadius: '8px',
  },

  Menu: {
    itemHeight: '32px',
  },

  Layout: { color: '#f1faee' },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px' },
    },
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#35a3a3FF',
    primaryColorHover: '#46b6b6FF',
    primaryColorPressed: '#297e7eFF',
    primaryColorSuppl: '#46b6b6FF',
    borderRadius: '8px',
  },

  Notification: {
    color: '#243040',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px', color: '#1c2632' },
    },
  },

  Menu: {
    itemHeight: '32px',
  },

  Layout: {
    color: '#161e29',
    siderColor: '#1c2632',
    siderBorderColor: 'transparent',
  },

  Card: {
    color: '#222e3c',
    borderColor: '#2c3a4a',
  },

  Table: {
    tdColor: '#222e3c',
    thColor: '#2a3744',
  },
};
