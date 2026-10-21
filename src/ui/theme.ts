import { useColorScheme } from 'react-native';

const light = {
  bg: '#F3F4F6',
  surface: '#FFFFFF',
  ink: '#16181D',
  muted: '#5E636E',
  line: '#DDE0E5',
  accent: '#E2452B',
  accentInk: '#FFFFFF',
  accentSoft: '#FBE3DE',
  ok: '#1E7F4F',
  okSoft: '#DDF1E6',
  crit: '#B3261E',
  critSoft: '#F8DEDC',
};

const dark: typeof light = {
  bg: '#121418',
  surface: '#1B1E24',
  ink: '#ECEEF1',
  muted: '#9AA0AB',
  line: '#2C3038',
  accent: '#FF6A4D',
  accentInk: '#1A0A06',
  accentSoft: '#3A1F19',
  ok: '#5CCB91',
  okSoft: '#173226',
  crit: '#FF8A80',
  critSoft: '#3A1C1A',
};

export type Palette = typeof light;

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };
export const type = {
  title: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.4 },
  h2: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 22 },
  small: { fontSize: 14, lineHeight: 19 },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.6, textTransform: 'uppercase' as const },
  number: { fontSize: 40, fontWeight: '700' as const, fontVariant: ['tabular-nums' as const] },
};
