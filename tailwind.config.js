/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: '#2c3e50',
        secondary: '#3498db',
        'secondary-dark': '#2980b9',
        text: '#333',
        background: '#f5f6fa'
      }
    }
  },
  plugins: [],
} 