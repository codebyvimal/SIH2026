import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './types/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        sans: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
      },
      colors: {
        'deep-navy': '#1E293B',
        'saffron': '#FF6B00',
        'gov-blue': '#264092',
        'gov-blue-dark': '#1A5276',
        'gov-gold': '#FFA730',
        'gov-green': '#1A7A4A',
        'gov-red': '#B02925',
        'gov-bg': '#F4F6F9',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out both',
        'fade-in': 'fadeIn 0.3s ease-out both',
        'slide-down': 'slideDown 0.2s ease-out both',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'gov': '0 2px 8px rgba(38, 64, 146, 0.12)',
        'gov-lg': '0 8px 24px rgba(38, 64, 146, 0.16)',
      },
    },
  },
  plugins: [],
};

export default config;
