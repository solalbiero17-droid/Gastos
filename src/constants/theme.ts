import { oklch } from '../utils/oklch';

export { categoryColor, categorySoft } from '../utils/oklch';

export const colors = {
  appBg: '#faf9f6',
  pageBg: '#efece6',
  surface: '#fff',
  ink: '#2b2823',
  secondary: '#8a8579',
  disabled: '#d8d3c9',
  barTrack: '#efece6',
  divider: '#f3f0ea',
  tabInactive: '#a39d90',
  green: oklch(0.55, 0.16, 145),
  greenSoft: oklch(0.94, 0.05, 145),
  greenSoftText: oklch(0.4, 0.12, 145),
  greenSoftSub: oklch(0.45, 0.1, 145),
  greenLight: oklch(0.78, 0.14, 145),
  red: oklch(0.62, 0.19, 25),
  redSoft: oklch(0.94, 0.05, 25),
  redSoftText: oklch(0.45, 0.16, 25),
  redLight: oklch(0.72, 0.19, 25),
  violet: oklch(0.6, 0.16, 285),
  ok: oklch(0.72, 0.16, 145),
  warn: oklch(0.72, 0.15, 60),
  over: oklch(0.62, 0.19, 25),
  googleBlue: '#4285F4',
  white15: 'rgba(255,255,255,0.15)',
  white50: 'rgba(255,255,255,0.5)',
  white55: 'rgba(255,255,255,0.55)',
  white60: 'rgba(255,255,255,0.6)',
  white65: 'rgba(255,255,255,0.65)',
};

export const NEW_CATEGORY_HUES = [25, 60, 100, 145, 200, 250, 285, 320, 0, 175];
export const GOAL_HUES = [25, 60, 145, 200, 250, 285, 320];
export const DEFAULT_WARN_THRESHOLD = 0.8;
export const DEFAULT_CATEGORY_LIMIT = 50000;
export const LIMIT_STEP = 10000;
export const TOAST_DURATION_MS = 2600;

export const radii = {
  card: 18,
  cardLg: 22,
  pill: 99,
  button: 16,
  input: 12,
  key: 14,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
};
