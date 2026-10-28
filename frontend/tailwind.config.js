/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6D28D9',
          hover: '#5B21B6',
          dark: '#4C1D95',
          light: '#EDE9FE',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        accent: {
          DEFAULT: '#DB2777',
          light: '#FCE7F3',
          dark: '#9D174D',
        },
        lavender: {
          light: '#F5F3FF',
          soft: '#EDE9FE',
        },
        app: {
          bg: '#FAF9FC',
          card: '#FFFFFF',
          sidebar: '#FFFFFF',
          text: '#27233A',
          muted: '#6B667A',
          border: '#E7E2EF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'premium': '0 10px 25px -5px rgba(124, 58, 237, 0.08), 0 8px 10px -6px rgba(124, 58, 237, 0.04)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
      }
    },
  },
  plugins: [],
}
