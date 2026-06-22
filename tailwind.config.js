/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  important: '#root', // Ensures Tailwind classes override MUI defaults
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#0F766E', // Medical Teal
          light: '#14b8a6',
          dark: '#0f766e',
        },
        secondary: {
          main: '#1E3A8A', // Deep Blue
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Prevent Tailwind's preflight from overriding MUI's CSS reset entirely
  },
}
