/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        barber: {
          dark: '#0c0d0f',
          surface: '#15171b',
          card: '#1b1e24',
          border: '#2a2e37',
          muted: '#8b92a0',
          silver: '#e2e8f0',
          silverDark: '#94a3b8',
          accent: '#c99a4e', // subtle gold/amber accent option
          accentHover: '#b5873e',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
