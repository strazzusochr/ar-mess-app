// Elegantes, minimalistisches Design-System

export const Colors = {
  // Hauptfarben (minimalistisch & elegant)
  primary: '#E3F2FD',      // Hellblau
  secondary: '#C8E6C9',    // Hellgrün
  accent: '#FFF9C4',       // Gelb
  dark: '#121212',         // Schwarz
  light: '#FFFFFF',        // Weiß
  danger: '#EF5350',       // Rot
  
  // UI Elemente
  background: '#0A0A0A',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceLight: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.15)',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  
  // Mess-Modi
  distance: '#4FC3F7',     // Hellblau
  area: '#81C784',         // Hellgrün
  volume: '#FFD54F',       // Gelb
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '300' as const,
    letterSpacing: 1,
  },
  h2: {
    fontSize: 22,
    fontWeight: '300' as const,
    letterSpacing: 0.5,
  },
  h3: {
    fontSize: 18,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '300' as const,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};