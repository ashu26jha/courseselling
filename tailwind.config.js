/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        black:{
          11: '#27272A'
        }
      },
      borderRadius: {
        DEFAULT: '4px',
        'md': '0.375rem',
        'full': '9999px',
        'large': '15px',
      },
      width: {
        '128': '85rem',
      }
    },
  },
  plugins: [],
};
