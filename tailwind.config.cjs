import withMT from "@material-tailwind/html/utils/withMT";

/** @type {import('tailwindcss').Config} */
module.exports = withMT({
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#ef4444',
          green: '#22c55e',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          yellow: '#eab308',
          black: '#111827',
        },
      },
      borderRadius: { '2xl': '1rem' },
      container: { center: true, padding: '1rem' },
    },
  },
  plugins: [],
});
