/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:     { DEFAULT: '#F5F0E8', 50: '#FDFCFA', 100: '#F5F0E8', 200: '#E8DDCC', 300: '#D4C4A8' },
        gold:      { DEFAULT: '#C9A84C', 50: '#F7F0DB', 100: '#EDDFB3', 200: '#DCC97A', 300: '#C9A84C', 400: '#B8952E', 500: '#9A7B24', 600: '#A8882F' },
        dark:      { DEFAULT: '#09090b', 50: '#544B3F', 100: '#3D352C', 200: '#2E2820', 300: '#1A1611', 400: '#0D0B08', 950: '#050505' },
        sage:      { DEFAULT: '#7A8C6E', 50: '#E8ECE5', 100: '#C5D0BE', 200: '#A2B396', 300: '#7A8C6E', 400: '#5F6E55', 500: '#47533F' },
        terracota: { DEFAULT: '#B05C3A', 50: '#F2E0D7', 100: '#E0B8A3', 200: '#CE9070', 300: '#B05C3A', 400: '#8D4A2E', 500: '#6A3823' },
        dgflow: {
          bg: '#0a0a0a',
          card: '#121212',
          border: '#1f1f1f',
          input: '#1a1a1a',
          inputBorder: '#27272a',
          accent: '#e13a40',
          accentHover: '#c52f34',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Montserrat', 'DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(26, 22, 17, 0.08)',
        'card-hover': '0 8px 24px rgba(26, 22, 17, 0.12)',
        'kanban': '0 1px 4px rgba(26, 22, 17, 0.06)',
        'glow': '0 0 20px rgba(201, 168, 76, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
