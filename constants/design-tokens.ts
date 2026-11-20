/**
 * Central design tokens for JobFlow.
 *
 * Single source of truth for spacing, typography, radius, dimensions and
 * motion. Screens and shared primitives should read from here instead of
 * hardcoding pixel values, so the whole app stays on one scale.
 *
 * Scale (from the design guide):
 * - spacing: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64
 * - radius: 6 / 8 / 12 / 16 / 24 / full
 * - type: display 36 down to micro 11; body 14–16, section headings 20–24,
 *   screen titles 28–30
 * - dimensions: screen padding 16, header 56, button 48–52, input 50,
 *   tab bar 64 + safe area
 * - motion: press feedback and transitions run 150–300ms
 * - touch targets: minimum 44x44 (48 where Android-ideal)
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
  display: 64,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

export const typography = {
  display: { fontSize: 36, lineHeight: 44 },
  title: { fontSize: 30, lineHeight: 36 },
  h1: { fontSize: 28, lineHeight: 34 },
  h2: { fontSize: 24, lineHeight: 30 },
  h3: { fontSize: 20, lineHeight: 26 },
  h4: { fontSize: 17, lineHeight: 22 },
  body: { fontSize: 16, lineHeight: 24 },
  bodySmall: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16 },
  micro: { fontSize: 11, lineHeight: 14 },
} as const;

export type TypographyVariant = keyof typeof typography;

export const dimensions = {
  /** Horizontal padding for every screen. */
  screenPadding: 16,
  /** Vertical gap between sections on a screen. */
  sectionGap: 24,
  /** Default padding inside a card. */
  cardPadding: 16,
  /** Screen/modal header height. */
  headerHeight: 56,
  /** Tab bar height, before the bottom safe-area inset is added. */
  tabBarHeight: 64,
  tabIconSize: 24,
  tabLabelSize: 11,
  buttonHeight: {
    small: 44,
    medium: 48,
    large: 52,
  },
  inputHeight: 50,
  /** Minimum touch target (44x44; 48 is the Android-ideal height). */
  minTouchTarget: 44,
} as const;

export const motion = {
  /** Press feedback. */
  fast: 150,
  /** Standard transition. */
  base: 200,
  /** Slower entrance / emphasis. */
  slow: 300,
} as const;

/** Hit slop that grows a small control (e.g. an inline clear icon) up to the
 *  44x44 minimum touch target without changing its visible size. */
export const touchHitSlop = {
  top: 10,
  bottom: 10,
  left: 10,
  right: 10,
} as const;
