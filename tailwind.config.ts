import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#FFF8F0',
          100: '#F5E6D3',
          200: '#E8D5BE',
          300: '#D7CCC8',
          400: '#A1887F',
          500: '#8B5E3C',
          600: '#795548',
          700: '#5D4037',
          800: '#3E2723',
          900: '#2C1A12',
        },
        cream: '#FFF8F0',
        accent: '#FF8A3D',
        success: '#4CAF50',
        danger: '#E57373',
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'clay': '20px',
        'clay-lg': '24px',
      },
      boxShadow: {
        'clay': '6px 6px 12px rgba(139,94,60,0.15), -3px -3px 8px rgba(255,255,255,0.8), inset 1px 1px 2px rgba(255,255,255,0.6), inset -1px -1px 2px rgba(0,0,0,0.05)',
        'clay-primary': '6px 6px 12px rgba(139,94,60,0.35), -3px -3px 8px rgba(255,248,240,0.5), inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.1)',
        'clay-accent': '6px 6px 12px rgba(255,138,61,0.3), -3px -3px 8px rgba(255,248,240,0.5), inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.1)',
        'clay-inset': 'inset 3px 3px 6px rgba(139,94,60,0.12), inset -2px -2px 4px rgba(255,255,255,0.7)',
        'clay-pressed': 'inset 2px 2px 4px rgba(0,0,0,0.1)',
      },
      animation: {
        'bounce-slow': 'bounce 2s ease infinite',
        'walk': 'walk 3s linear infinite',
      },
      keyframes: {
        walk: {
          '0%, 100%': { transform: 'translateX(-20px)' },
          '50%': { transform: 'translateX(20px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
