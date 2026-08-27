/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        inper: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#36abf8',
          500: '#0c8ee9',
          600: '#0270c7',
          700: '#0359a1',
          800: '#074c85',
          900: '#0c3f6e',
          950: '#082849',
        },
        emerald_custom: {
          500: '#10b981',
          600: '#059669',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
