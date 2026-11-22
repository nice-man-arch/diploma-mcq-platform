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
        notion: {
          bg: '#191919',
          sidebar: '#202020',
          card: '#202020',
          hover: '#282828',
          active: '#303030',
          text: '#E3E3E3',
          muted: '#9B9A97',
          subtle: '#6F6E6B',
          // Dusty pastel status colors
          sage: '#24332C',
          sageText: '#85B59A',
          sageBorder: '#33483E',
          blue: '#22313F',
          blueText: '#8FAFC4',
          blueBorder: '#2D4154',
          terracotta: '#3B2825',
          terracottaText: '#D18E84',
          terracottaBorder: '#503732',
          amber: '#362D1F',
          amberText: '#D1B280',
          amberBorder: '#4D402B',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        'xs': '3px',
        'sm': '5px',
        'md': '7px',
        'lg': '10px'
      }
    },
  },
  plugins: [],
}
