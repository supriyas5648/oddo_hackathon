/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          500: '#3b6fe0',
          600: '#2f5bd0',
          700: '#2749a8',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)',
        cardhover: '0 8px 24px rgba(16, 24, 40, 0.10)',
      },
    },
  },
  plugins: [],
};
