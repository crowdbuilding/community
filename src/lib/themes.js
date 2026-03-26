export const themes = {
  light: {
    bg: '#f7f8fa', card: '#ffffff', text: '#1a1a2e',
    sub: '#5a5f72', muted: '#9ba1b0', faint: '#b0b5c3', line: '#f0f1f4',
    blue: '#4A90D9', green: '#3BD269', yellow: '#F4B400',
    hotpink: '#F23578', orange: '#F09020', rose: '#F5B0C5',
    shadow1: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
    shadow2: '0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
    shadow3: '0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)',
  },
  warm: {
    bg: '#F5F0EB', card: '#FFFCF8', text: '#2C2520',
    sub: '#6B5E54', muted: '#A49788', faint: '#C4B8AC', line: '#EBE4DC',
    blue: '#5B8EC4', green: '#5AAE6C', yellow: '#D4A43A',
    hotpink: '#D4567A', orange: '#CF8432', rose: '#DBA8B4',
    shadow1: '0 1px 3px rgba(44,37,32,0.05), 0 1px 2px rgba(44,37,32,0.03)',
    shadow2: '0 4px 12px rgba(44,37,32,0.07), 0 1px 3px rgba(44,37,32,0.04)',
    shadow3: '0 12px 40px rgba(44,37,32,0.12), 0 4px 12px rgba(44,37,32,0.06)',
  },
  dark: {
    bg: '#121218', card: '#1C1C26', text: '#E8E6F0',
    sub: '#A09CB0', muted: '#6E6A80', faint: '#4A475A', line: '#2A2A38',
    blue: '#6AA3E8', green: '#4FD87A', yellow: '#F0C850',
    hotpink: '#F05A8A', orange: '#F0A040', rose: '#E8A0B8',
    shadow1: '0 1px 3px rgba(0,0,0,0.20), 0 1px 2px rgba(0,0,0,0.15)',
    shadow2: '0 4px 12px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.20)',
    shadow3: '0 12px 40px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.25)',
  },
}

export function getTokens(mode, projectBranding = {}) {
  return {
    ...themes[mode],
    radius: '16px',
    radiusSm: '10px',
    ...(projectBranding.brand_primary_color && { blue: projectBranding.brand_primary_color }),
    ...(projectBranding.brand_accent_color && { green: projectBranding.brand_accent_color }),
  }
}
