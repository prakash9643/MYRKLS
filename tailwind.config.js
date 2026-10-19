/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary Color Palette (Brand Guidelines Page 4)
          forest: '#1c2919',
          'forest-80': '#495447',
          'forest-60': '#777f75',
          'forest-40': '#a4a9a3',
          'forest-20': '#d2d4d1',

          olive: '#5b6546',
          'olive-80': '#7c846b',
          'olive-60': '#9da390',
          'olive-40': '#bec1b5',
          'olive-20': '#dfe0da',

          // Secondary Color Palette (Brand Guidelines Page 5)
          cream: '#f4f0e5',
          sand: '#c7b596',
          white: '#ffffff',
          dark: '#231f20',
        },
        forest: {
          950: '#121c10',
          900: '#1c2919', // Official Primary Forest
          850: '#233320',
          800: '#2b3c27',
          700: '#3d5238',
          600: '#495447',
        },
        sage: {
          50: '#faf8f4',
          100: '#f4f0e5', // Official Secondary Cream
          200: '#dfe0da', // Olive 20%
          300: '#c7b596', // Official Sand
          400: '#bec1b5', // Olive 40%
          500: '#9da390', // Olive 60%
          600: '#7c846b', // Olive 80%
          700: '#5b6546', // Official Primary Olive
        },
        ivory: {
          50: '#ffffff',
          100: '#fdfcf9',
          200: '#f4f0e5', // Official Secondary Cream
          300: '#ebe5d6',
          400: '#c7b596', // Official Sand
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Bodoni Moda"', 'Cambria', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        manrope: ['Manrope', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        syne: ['Syne', 'Inter', 'sans-serif'],
        mono: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '13px',
      }
    },
  },
  plugins: [],
}
