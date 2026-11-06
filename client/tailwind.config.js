/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'media',
  theme: { extend: { colors: { brand: { DEFAULT: '#1f4e5f', light: '#5fb0c9' } } } },
  plugins: [],
};
