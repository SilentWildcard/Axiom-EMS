/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0e1a',
        'bg-secondary': '#0f1629',
        'bg-card': '#111827',
        'accent-cyan': '#00d4ff',
        'accent-blue': '#0066cc',
        'alert-red': '#ef4444',
        'success-green': '#22c55e',
        'warning-amber': '#f59e0b',
      },
      animation: {
        'pulse-ring': 'pulse-ring 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'siren-flash': 'siren-flash 0.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.05)' },
        },
        'siren-flash': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px #ef4444' },
          '50%': { opacity: '0.6', boxShadow: '0 0 40px #ef4444, 0 0 60px #ef4444' },
        },
      },
    },
  },
  plugins: [],
}
