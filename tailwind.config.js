/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // TODO: preencher com os design tokens do Figma (AGES IV).
      // Manter os MESMOS valores usados no finup-web.
      colors: {},
    },
  },
  plugins: [],
};
