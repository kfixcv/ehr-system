/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', '"Cairo"', 'sans-serif'],
      },
      colors: {
        hospital: {
          dark: '#0b3948',     // كحلي تركوازي عميق للقائمة الجانبية
          primary: '#0f4c5c',  // اللون الرئيسي للثيم
          accent: '#1b6ca8',   // لون التمييز الطبي
          light: '#e8f1f5',    // خلفية البطاقات الفرعية
        }
      }
    },
  },
  plugins: [],
}