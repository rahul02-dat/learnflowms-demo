/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0E14",
        surface: "#131722",
        primary: "#34E2E4",
        secondary: "#4721FB",
        accent: "#AB1DFE",
      }
    },
  },
  plugins: [],
}
