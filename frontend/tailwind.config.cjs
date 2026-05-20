/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0f19',
        darkCard: '#131926',
        darkBorder: '#1f293d',
        accentViolet: '#6366f1',
        accentEmerald: '#10b981',
        accentRose: '#f43f5e',
      },
    },
  },
  plugins: [],
}
