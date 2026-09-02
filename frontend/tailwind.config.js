/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          chassis: '#e0e5ec',
          panel: '#f0f2f5',
          recessed: '#d1d9e6',
          dark: '#2d3436',
          label: '#4a5568',
          orange: '#ff4757',
          shadow: '#babecc',
          highlight: '#ffffff',
          deep: '#a3b1c6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Roboto Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '8px 8px 16px #babecc, -8px -8px 16px #ffffff',
        'floating': '12px 12px 24px #babecc, -12px -12px 24px #ffffff, inset 1px 1px 0 rgba(255,255,255,0.5)',
        'recessed': 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff',
        'pressed': 'inset 6px 6px 12px #babecc, inset -6px -6px 12px #ffffff',
        'orange-btn': '4px 4px 8px rgba(166,50,60,0.4), -4px -4px 8px rgba(255,100,110,0.4)',
        'led-orange': '0 0 10px 2px rgba(255, 71, 87, 0.6)',
        'led-green': '0 0 10px 2px rgba(34, 197, 94, 0.6)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
}
