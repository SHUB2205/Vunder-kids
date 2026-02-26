/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#22C55E',
        'primary-dark': '#16A34A',
        dark: '#1E293B',
        'dark-light': '#334155',
      },
    },
  },
  plugins: [],
}
