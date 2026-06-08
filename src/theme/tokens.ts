// Design tokens extracted from the Contato Seguro Figma — "Gestão de documentos"
// Brand: Contato Seguro · navy primary (#263072), Montserrat typeface.

export const COLORS = {
  // Brand
  primary: '#263072',
  primaryHover: '#1c2659',
  primaryActive: '#161d45',

  // Blue scale (tags / counts)
  blue1: '#e8f6fd',
  blue2: '#d4ecfb',
  blue3: '#9dbfea',
  blue6: '#263072',

  // Warning (Aceite pendente)
  warning: '#fa8c16',
  warningBg: '#fff7e6',
  warningBorder: '#ffd591',

  // Success (accepted)
  success: '#52c41a',
  successBg: '#f6ffed',
  successBorder: '#b7eb8f',

  // Info (informativo)
  info: '#1677ff',

  // Neutrals
  bgBase: '#fafafa',
  surface: '#ffffff',
  cardBorder: '#f0f0f0',
  divider: '#f0f0f0',
  textHeading: 'rgba(0,0,0,0.88)',
  textSecondary: 'rgba(0,0,0,0.65)',
  textTertiary: 'rgba(0,0,0,0.45)',
  textDisabled: 'rgba(0,0,0,0.25)',
} as const;

export const FONT_FAMILY =
  "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// Responsive breakpoints (px) — Mobile → Tablet → Desktop
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_WIDTH_COLLAPSED = 72;
