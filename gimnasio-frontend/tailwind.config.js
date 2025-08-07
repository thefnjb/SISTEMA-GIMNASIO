const { heroui } = require("@heroui/react");
const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/react/**/*.js"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui(), nextui()],
}
