/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./pages/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}",
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
  // Make sure these features are enabled
  corePlugins: {
    animation: true,
    transform: true,
    transitionProperty: true,
  },
  // Add safelist for dynamic classes that might not be detected in the static analysis
  safelist: [
    'animate-spin',
    'transform',
    'transition',
    'duration-200',
    'hover:-translate-y-0.5',
    'hover:shadow-lg',
    'hidden',
    'bg-red-500',
    'bg-green-500',
    'focus:ring-2',
    'focus:ring-indigo-500',
    'focus:border-indigo-500',
    'focus:ring-offset-2'
  ]
}