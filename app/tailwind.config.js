/** @type {import('tailwindcss').Config} */
import { customColors } from './style/customColors';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: customColors,
    },
  },
  plugins: [],
};
