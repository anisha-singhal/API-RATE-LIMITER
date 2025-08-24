/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090B', // Very dark gray
        foreground: '#E4E4E7', // Light gray text
        card: '#18181B',       // Card background
        primary: {
          DEFAULT: '#3B82F6', // Blue
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#27272A',
          foreground: '#A1A1AA',
        },
        border: '#27272A',
        // Add more colors here if your components need them
      },
    },
  },
  plugins: [],
}