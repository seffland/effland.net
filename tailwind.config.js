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
  // Expanded safelist to ensure all dynamic classes work on Cloudflare
  safelist: [
    // Animation classes
    'animate-spin', 'animate-pulse', 'animate-bounce',
    
    // Transform classes
    'transform', 'hover:-translate-y-0.5', 'translate-x-0', 'translate-y-0',
    
    // Transition classes
    'transition', 'duration-200', 'duration-300',
    
    // Shadow utilities
    'shadow-md', 'shadow-lg', 'hover:shadow-lg', 'hover:shadow-xl',
    
    // Display utilities
    'hidden', 'block', 'inline-block', 'flex', 'inline-flex',
    
    // Color utilities
    'bg-red-500', 'bg-green-500', 'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700',
    
    // Focus utilities
    'focus:ring-2', 'focus:ring-indigo-500', 'focus:border-indigo-500', 'focus:ring-offset-2',
    
    // Interactive utilities
    'hover:bg-indigo-700'
  ]
}