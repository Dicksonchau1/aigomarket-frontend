/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 👈 Add this
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'outfit': ['Outfit', 'sans-serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'bg-primary': '#1a1a1a',
        'bg-secondary': '#252525',
        'bg-card': '#2d2d2d',
        'accent-silver': '#c0c0c0',
        'accent-silver-light': '#e8e8e8',
        'accent-silver-dark': '#8a8a8a',
        'accent-cyan': '#06b6d4',
        'accent-indigo': '#6366f1',
        'accent-purple': '#a855f7',
        'accent-emerald': '#10b981',
        'accent-gold': '#f59e0b',
        'text-primary': '#f0f0f0',
        'text-secondary': '#a0a0a0',
        'text-muted': '#707070',
        'border-color': '#3a3a3a',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #e8e8e8 0%, #c0c0c0 50%, #8a8a8a 100%)',
        'gradient-metallic': 'linear-gradient(180deg, #e8e8e8 0%, #c0c0c0 25%, #a0a0a0 50%, #c0c0c0 75%, #e8e8e8 100%)',
      },
    },
  },
  plugins: [],
}