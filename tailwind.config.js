/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  // We use CSS variables for theming — Tailwind is used for layout/spacing only
  theme: {
    extend: {
      colors: {
        accent:  'var(--accent)',
        accent2: 'var(--accent2)',
        green:   'var(--green)',
        red:     'var(--red)',
        amber:   'var(--amber)',
        blue:    'var(--blue)',
      },
      fontFamily: {
        barlow:           ['var(--font-barlow)', 'system-ui', 'sans-serif'],
        'barlow-condensed': ['var(--font-barlow-condensed)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
