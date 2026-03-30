import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Charcoal black palette
        charcoal: {
          50:  '#f5f5f4',
          100: '#e8e8e6',
          200: '#d1d1ce',
          300: '#b0b0ab',
          400: '#888882',
          500: '#6b6b65',
          600: '#57574f',
          700: '#484843',
          800: '#3d3d38',
          900: '#353531',
          950: '#1c1c19',
        },
        // Gold accent palette
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // App semantic tokens
        bg: {
          DEFAULT: '#faf9f7',
          dark: '#111110',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#1c1c1a',
        },
        border: {
          DEFAULT: '#e5e5e3',
          dark: '#2a2a28',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        'dark-gradient': 'linear-gradient(180deg, #111110 0%, #1c1c1a 100%)',
        'hero-gradient': 'linear-gradient(135deg, #1c1c19 0%, #353531 40%, #484843 100%)',
        'card-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.06) 50%, transparent 100%)',
      },
      boxShadow: {
        'gold': '0 4px 24px rgba(245,158,11,0.25)',
        'gold-lg': '0 8px 48px rgba(245,158,11,0.35)',
        'card': '0 2px 16px rgba(0,0,0,0.08)',
        'card-dark': '0 2px 16px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'countdown': 'countdown 1s linear infinite',
      },
      keyframes: {
        pulseGold: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(245,158,11,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(245,158,11,0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        countdown: {
          from: { strokeDashoffset: '0' },
          to:   { strokeDashoffset: '100' },
        },
      },
    },
  },
  plugins: [],
}

export default config
