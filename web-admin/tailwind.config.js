/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2E7D32',      // Vert principal de l'app mobile
        'primary-dark': '#1B5E20',
        'primary-light': '#388E3C',
        secondary: '#D84315',    // Orange de l'app mobile
        success: '#4ADE80',
        warning: '#FBBF24',
        danger: '#EF4444',
        dark: '#0F172A',
        'light-bg': '#F5F7F5',
        'card-light': '#FFFFFF',
        'card-dark': '#1E293B',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
