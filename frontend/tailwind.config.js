/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0B1220',
        voidlight: '#141C33',
        paper: '#F6F7FB',
        ink: '#12172B',
        muted: '#6B7280',
        line: '#E4E7EF',
        brand: {
          50: '#EEF0FF',
          100: '#DFE1FF',
          300: '#A6ABFB',
          500: '#5B5FEE',
          600: '#4649D1',
          700: '#3639A8',
        },
        amber: {
          400: '#FFB020',
          500: '#F59E0B',
        },
        teal: {
          400: '#2DD4C4',
          500: '#17B897',
          600: '#0F9A7D',
        },
        rose: {
          500: '#F04868',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)',
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 12px 32px -12px rgba(15, 23, 42, 0.12)',
        glow: '0 0 0 1px rgba(91,95,238,0.15), 0 8px 30px -8px rgba(91,95,238,0.35)',
      },
      backgroundImage: {
        'grid-fade': 'linear-gradient(to bottom, rgba(11,18,32,0) 0%, #0B1220 90%)',
      },
      keyframes: {
        flowRight: {
          '0%': { transform: 'translateX(-8%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(108%)', opacity: '0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        flowRight: 'flowRight 8s linear infinite',
        pulseDot: 'pulseDot 2s ease-in-out infinite',
        fadeUp: 'fadeUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
