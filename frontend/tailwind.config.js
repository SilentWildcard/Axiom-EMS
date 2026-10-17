/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#050B14',
        'navy-surface': '#0B1528',
        'panel-elevated': '#101E36',
        'cyan-glow': '#38BDF8',
        'vivid-blue': '#2563EB',
        'ice-blue': '#7DD3FC',
        'pale-blue': '#BAE6FD',
        'royal-blue': '#1D4ED8',
        'azure-blue': '#0EA5E9',
        'text-primary': '#F0F7FF',
        'text-secondary': '#93B2D6',
        ers: {
          dark: '#050B14',       // Monochromatic obsidian midnight blue
          navy: '#0B1528',       // Deep navy surface
          card: '#0B1528',       // Deep navy surface
          panel: '#101E36',      // Elevated navy panel
          border: '#1E355B',     // Monochromatic blue border
          cyan: '#38BDF8',       // Electric cyan
          blue: '#2563EB',       // Vivid royal blue
          red: '#2563EB',        // Mapped to royal blue for monochromatic compliance
          amber: '#0EA5E9',      // Mapped to electric azure
          emerald: '#7DD3FC',    // Mapped to ice pale blue
          purple: '#1D4ED8',     // Mapped to deep royal blue
        }
      },
      fontFamily: {
        hud: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px -3px rgba(56, 189, 248, 0.35)',
        'cyan-glow-sm': '0 0 10px rgba(56, 189, 248, 0.25)',
        'blue-glow': '0 0 22px -3px rgba(37, 99, 235, 0.5)',
        'ice-glow': '0 0 18px -3px rgba(125, 211, 252, 0.35)',
        'panel-depth': '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(56, 189, 248, 0.1)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-ping': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 8px rgba(56, 189, 248, 0.2)' },
          '100%': { boxShadow: '0 0 22px rgba(56, 189, 248, 0.55)' }
        }
      }
    },
  },
  plugins: [],
}
