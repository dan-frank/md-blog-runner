/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/scripts/**/*.js",
    "./src/templates/**/*.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio")
  ],
}
