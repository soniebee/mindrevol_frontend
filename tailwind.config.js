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
        // Màu nền tối giản (Đen sâu thẳm)
        background: "#09090b", 
        // Màu bề mặt (Card, Input...) - hơi sáng hơn nền chút
        surface: "#18181b",
        // Màu chữ chính
        foreground: "#fafafa",
        // Màu chữ phụ (mờ hơn)
        muted: "#a1a1aa",
        
        // Màu Neon điểm nhấn (Chọn màu Lime/Vàng chanh)
        primary: {
          DEFAULT: "#ccff00", // Màu Neon chính
          foreground: "#000000", // Chữ trên nền Neon phải là đen
        },
        
        // Màu báo lỗi (Đỏ)
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fafafa",
        },
      },
      fontFamily: {
        // Dùng font mặc định hệ thống cho nhanh và sạch (Apple System Font)
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
      },
    },
  },
  plugins: [],
}