/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3B82F6', // Azul claro
          600: '#2563EB', // Azul escuro
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}