/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090B', // Dark background
        foreground: '#E4E4E7', // Light text
        card: '#18181B',       // Card background
        primary: {
          DEFAULT: '#3B82F6', // Blue
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#27272A',
          foreground: '#A1A1AA',
        },
        accent: {
          DEFAULT: '#60A5FA',
          foreground: '#09090B',
        },
      },
    },
  },
  plugins: [],
}