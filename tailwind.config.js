/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./pages/**/*.html",
    "./js/**/*.js"  // More specific path for your JS files
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',    // Slate 900
        secondary: '#38bdf8',  // Sky 400
        'secondary-dark': '#0284c7', // Sky 600  
        background: '#f8fafc',  // Slate 50
        text: '#334155',       // Slate 700
      },
    },
  },
  plugins: [],
}