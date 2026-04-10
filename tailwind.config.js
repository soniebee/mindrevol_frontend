/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b", 
        surface: "#18181b",
        foreground: "#fafafa",
        muted: "#a1a1aa",
        primary: {
          DEFAULT: "#ccff00",
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fafafa",
        },
        // --- BẢNG MÀU CUTE (PASTEL) ---
        cute: {
          beige: "#FDFBF7",
          green: "#B4E1BC",
          yellow: "#FFEDA3",
          dark: "#2C4C3B"
        }
      },
      fontFamily: {
        sans: [
          "-apple-system", 
          "BlinkMacSystemFont", 
          "Segoe UI", 
          "Roboto", 
          "Helvetica", 
          "Arial", 
          "sans-serif"
        ],
        coiny: ['"Coiny"', 'cursive', 'sans-serif'],
        quicksand: ['"Quicksand"', 'sans-serif'], // Font chính cho giao diện Cute
      },
      backgroundImage: {
        'cute-dots': 'radial-gradient(#B4E1BC 1px, transparent 1px)', // Họa tiết chấm bi xanh
      },
      backgroundSize: {
        'cute-dots': '20px 20px',
      }
    },
  },
  plugins: [],
}