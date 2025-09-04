/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        josefin: ['"Josefin Sans"', 'sans-serif'],
        fira: ['"Fira Sans"', 'sans-serif'], // Already added
        roboto: ['"Roboto"', 'sans-serif'], // Add Roboto
      },
    },
  },
  plugins: [],
};
