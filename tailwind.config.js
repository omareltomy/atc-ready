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
        'custom-bg': '#f6f7f9',
        'custom-fg': '#000',
        'custom-radar': '#111',
        'custom-ring': '#222',
        'custom-cross': '#444',
        'custom-label-bg': 'rgba(0,0,0,0.6)',
        'custom-text': '#fff',
        'custom-target': '#0f0',
        'custom-intruder': '#fff',
      },
      fontFamily: {
        'system': ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'inter': ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
